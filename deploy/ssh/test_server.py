"""Exercise public SSH restrictions and PTY lifecycle over real SSH connections."""

import asyncio
import importlib.util
from pathlib import Path
import tempfile
import unittest

import asyncssh

spec = importlib.util.spec_from_file_location("portfolio_server", Path(__file__).with_name("server.py"))
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)


class PublicSSHTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        binary = Path(self.directory.name) / "portfolio"
        binary.write_text('#!/bin/sh\nprintf "route=%s\\n" "$SSH_ORIGINAL_COMMAND"\nread -r input\nprintf "input=%s\\n" "$input"\n')
        binary.chmod(0o755)
        server.BINARY = str(binary)
        server.MAX_SESSIONS = 4
        server.SESSION_SECONDS = 10
        server.sessions.clear()
        self.listener = await asyncssh.create_server(
            server.PortfolioServer, "::1", 0, encoding=None,
            server_host_keys=[asyncssh.generate_private_key("ssh-ed25519")],
        )
        self.connections = []

    async def asyncTearDown(self):
        for connection in self.connections:
            connection.close()
            await connection.wait_closed()
        self.listener.close()
        await self.listener.wait_closed()
        await asyncio.sleep(0.2)
        self.assertFalse(server.sessions)
        self.directory.cleanup()

    async def connect(self, username="portfolio"):
        connection = await asyncssh.connect(
            "::1", self.listener.get_port(), username=username,
            known_hosts=None, client_keys=[],
        )
        self.connections.append(connection)
        return connection

    async def test_route_is_literal_and_disconnect_releases_session(self):
        connection = await self.connect()
        route = "/blog; echo should-not-run"
        process = await connection.create_process(route, term_type="xterm-256color")
        output = await asyncio.wait_for(process.stdout.readline(), 3)
        self.assertEqual(output.strip(), f"route={route}")
        process.stdin.write("q\n")
        result = await asyncio.wait_for(process.wait(), 3)
        self.assertEqual(result.exit_status, 0)
        self.assertIn("input=q", result.stdout)

    async def test_any_username_gets_only_the_portfolio(self):
        for username in ("visitor", "root"):
            with self.subTest(username=username):
                connection = await self.connect(username)
                process = await connection.create_process("/blog", term_type="xterm-256color")
                output = await asyncio.wait_for(process.stdout.readline(), 3)
                self.assertEqual(output.strip(), "route=/blog")
                process.stdin.write("q\n")
                result = await asyncio.wait_for(process.wait(), 3)
                self.assertEqual(result.exit_status, 0)
                with self.assertRaises(asyncssh.Error):
                    await connection.start_sftp_client()
                with self.assertRaises(asyncssh.ChannelOpenError):
                    await connection.open_connection("127.0.0.1", 22)

    async def test_nonterminal_sftp_and_forwarding_are_rejected(self):
        connection = await self.connect()
        with self.assertRaises(asyncssh.Error):
            await connection.create_process("/blog")
        with self.assertRaises(asyncssh.Error):
            await connection.start_sftp_client()
        with self.assertRaises(asyncssh.ChannelOpenError):
            await connection.open_connection("127.0.0.1", 22)

    async def test_concurrent_session_limit(self):
        server.MAX_SESSIONS = 1
        connection = await self.connect()
        process = await connection.create_process(term_type="xterm-256color")
        await asyncio.wait_for(process.stdout.readline(), 3)
        with self.assertRaises(asyncssh.ChannelOpenError):
            await connection.create_process(term_type="xterm-256color")

    async def test_time_limit_terminates_child(self):
        server.SESSION_SECONDS = 0.2
        connection = await self.connect()
        process = await connection.create_process(term_type="xterm-256color")
        result = await asyncio.wait_for(process.wait(), 3)
        self.assertIn("Session time limit reached", result.stdout)


if __name__ == "__main__":
    unittest.main()
