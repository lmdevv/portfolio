"""Public, app-only SSH endpoint. Administrative SSH remains on private IPv4."""

import asyncio
import errno
import fcntl
import logging
import os
import pty
import signal
import socket
import struct
import subprocess
import termios

import asyncssh

BINARY = os.environ.get("PORTFOLIO_BINARY", "/opt/portfolio/current/portfolio")
MAX_SESSIONS = int(os.environ.get("PORTFOLIO_MAX_SESSIONS", "4"))
SESSION_SECONDS = int(os.environ.get("PORTFOLIO_SESSION_SECONDS", "600"))
sessions = set()


def child_setup():
    os.setsid()
    fcntl.ioctl(0, termios.TIOCSCTTY, 0)


class PortfolioSession(asyncssh.SSHServerSession):
    def __init__(self):
        self.channel = None
        self.master = None
        self.process = None
        self.task = None
        self.terminal = "xterm-256color"
        self.size = (80, 24, 0, 0)
        self.route = ""
        self.pending = bytearray()

    def connection_made(self, channel):
        self.channel = channel

    def pty_requested(self, term_type, term_size, term_modes):
        self.terminal = term_type or "xterm-256color"
        self.size = term_size
        return True

    def shell_requested(self):
        return self.channel.get_terminal_type() is not None

    def exec_requested(self, command):
        # A command is a route argument, never passed to a shell.
        if len(command) > 512 or any(ord(char) < 32 for char in command):
            return False
        self.route = command
        return self.shell_requested()

    def session_started(self):
        self.task = asyncio.create_task(self.run())

    def terminal_size_changed(self, width, height, pixwidth, pixheight):
        self.size = (width, height, pixwidth, pixheight)
        if self.master is not None:
            width, height, pixwidth, pixheight = (max(1, min(n, 65535)) for n in self.size)
            fcntl.ioctl(self.master, termios.TIOCSWINSZ,
                        struct.pack("HHHH", height, width, pixwidth, pixheight))

    def data_received(self, data, datatype):
        if self.master is None:
            return
        if len(self.pending) + len(data) > 65536:
            self.channel.close()
            return
        self.pending.extend(data)
        self.flush_input()

    def flush_input(self):
        if self.master is None:
            return
        loop = asyncio.get_running_loop()
        try:
            count = os.write(self.master, self.pending)
            del self.pending[:count]
        except BlockingIOError:
            pass
        except OSError:
            self.channel.close()
            return
        if self.pending:
            loop.add_writer(self.master, self.flush_input)
        else:
            loop.remove_writer(self.master)

    def forward_output(self):
        try:
            data = os.read(self.master, 32768)
        except BlockingIOError:
            return
        except OSError as exc:
            if exc.errno != errno.EIO:
                logging.exception("PTY read failed")
            asyncio.get_running_loop().remove_reader(self.master)
            return
        if data:
            self.channel.write(data)
        else:
            asyncio.get_running_loop().remove_reader(self.master)

    def pause_writing(self):
        if self.master is not None:
            asyncio.get_running_loop().remove_reader(self.master)

    def resume_writing(self):
        if self.master is not None:
            asyncio.get_running_loop().add_reader(self.master, self.forward_output)

    def connection_lost(self, exc):
        if self.task:
            self.task.cancel()
        sessions.discard(self)

    async def run(self):
        loop = asyncio.get_running_loop()
        slave = None
        try:
            self.master, slave = pty.openpty()
            os.set_blocking(self.master, False)
            self.terminal_size_changed(*self.size)
            env = {
                "PATH": "/usr/bin:/bin", "HOME": "/var/lib/portfolio",
                "LANG": "C.UTF-8", "TERM": self.terminal,
                "SSH_TTY": os.ttyname(slave), "SSH_ORIGINAL_COMMAND": self.route,
                "PORTFOLIO_MOTION": "0",
            }
            self.process = subprocess.Popen(
                [BINARY], stdin=slave, stdout=slave, stderr=slave,
                env=env, preexec_fn=child_setup,
            )
            os.close(slave)
            slave = None
            loop.add_reader(self.master, self.forward_output)
            deadline = loop.time() + SESSION_SECONDS
            while self.process.poll() is None and loop.time() < deadline:
                await asyncio.sleep(0.1)
            if self.process.poll() is None:
                self.channel.write(b"\r\nSession time limit reached. Please reconnect.\r\n")
            else:
                self.forward_output()
            self.channel.exit(self.process.returncode or 0)
        except asyncio.CancelledError:
            pass
        except Exception:
            logging.exception("Portfolio session failed")
            self.channel.exit(1)
        finally:
            if slave is not None:
                os.close(slave)
            if self.process and self.process.poll() is None:
                os.killpg(self.process.pid, signal.SIGTERM)
                for _ in range(20):
                    if self.process.poll() is not None:
                        break
                    await asyncio.sleep(0.05)
                if self.process.poll() is None:
                    os.killpg(self.process.pid, signal.SIGKILL)
                self.process.wait()
            if self.master is not None:
                loop.remove_reader(self.master)
                loop.remove_writer(self.master)
                os.close(self.master)
                self.master = None
            sessions.discard(self)


class PortfolioServer(asyncssh.SSHServer):
    def begin_auth(self, username):
        # The SSH username is only a client label. Every session runs the same
        # portfolio process under the service's fixed, unprivileged OS user.
        return False

    def session_requested(self):
        if len(sessions) >= MAX_SESSIONS:
            return False
        session = PortfolioSession()
        sessions.add(session)
        return session


async def main():
    sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 1)
    sock.bind((os.environ.get("PORTFOLIO_BIND", "::"),
               int(os.environ.get("PORTFOLIO_PORT", "22"))))
    sock.listen(64)
    async with await asyncssh.create_server(
        PortfolioServer, sock=sock,
        server_host_keys=[os.environ.get("PORTFOLIO_HOST_KEY", "/var/lib/portfolio/ssh_host_ed25519_key")],
        encoding=None, login_timeout=15,
    ):
        await asyncio.Future()


if __name__ == "__main__":
    logging.basicConfig(level=logging.WARNING)
    asyncio.run(main())
