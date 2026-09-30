#!/usr/bin/env bash
set -euo pipefail

archive=${1:?release archive required}
revision=${2:?git revision required}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid revision' >&2; exit 1; }
release="/opt/portfolio/releases/$revision"
previous=$(readlink /opt/portfolio/current || true)
if [[ "$previous" == "$release" ]]; then
  python3 "$release/smoke_test.py"
  echo "Already deployed $revision"
  exit 0
fi
install -d -m 0755 "$release"
tar -xzf "$archive" --directory "$release" --no-same-owner
chmod 0755 "$release/portfolio"
chmod 0644 "$release/server.py" "$release/portfolio-ssh.service"
python3 -m py_compile "$release/server.py"
install -m 0644 "$release/portfolio-ssh.service" /etc/systemd/system/portfolio-ssh.service
ln -sfn "$release" /opt/portfolio/current.next
mv -Tf /opt/portfolio/current.next /opt/portfolio/current
systemctl daemon-reload
systemctl enable portfolio-ssh
systemctl restart portfolio-ssh

# Check the actual public SSH handshake, not only whether systemd says active.
healthy=false
for _ in $(seq 1 15); do
  if python3 "$release/smoke_test.py"; then
    healthy=true
    break
  fi
  sleep 1
done
if [[ "$healthy" != true ]]; then
  journalctl -u portfolio-ssh --no-pager -n 30 >&2
  if [[ -n "$previous" ]]; then
    ln -sfn "$previous" /opt/portfolio/current.rollback
    mv -Tf /opt/portfolio/current.rollback /opt/portfolio/current
    install -m 0644 /opt/portfolio/current/portfolio-ssh.service /etc/systemd/system/portfolio-ssh.service
    systemctl daemon-reload
    systemctl restart portfolio-ssh
  fi
  exit 1
fi
echo "Deployed $revision"

# Bound disk usage while retaining the current release and the previous release.
python3 - "$release" "$previous" <<'PY'
import re, shutil, sys
from pathlib import Path
releases = sorted((p for p in Path('/opt/portfolio/releases').iterdir()
                   if p.is_dir() and re.fullmatch(r'[0-9a-f]{40}', p.name)),
                  key=lambda p: p.stat().st_mtime, reverse=True)
protected = {Path(p) for p in sys.argv[1:] if p}
for path in releases[3:]:
    if path not in protected:
        shutil.rmtree(path)
PY
