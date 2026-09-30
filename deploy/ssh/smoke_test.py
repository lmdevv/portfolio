"""Check that a local app-only SSH session renders and exits cleanly."""

import asyncio

import asyncssh


async def main():
    # This probe only connects to loopback inside the host, never a remote origin.
    async with asyncssh.connect("::1", known_hosts=None, client_keys=[]) as connection:
        process = await connection.create_process(term_type="xterm-256color", term_size=(100, 30), encoding=None)
        output = await asyncio.wait_for(process.stdout.read(4096), 10)
        if not output:
            raise RuntimeError("TUI produced no terminal output")
        await asyncio.sleep(0.3)
        process.stdin.write(b"q")
        result = await asyncio.wait_for(process.wait(), 5)
        if result.exit_status != 0:
            raise RuntimeError(f"TUI exited with status {result.exit_status}")


if __name__ == "__main__":
    asyncio.run(main())
