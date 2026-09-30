#!/usr/bin/env bash
set -euo pipefail

# Debian 12/13 startup script. No application builds run on this small VM.
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y python3-asyncssh openssh-server ca-certificates
id portfolio >/dev/null 2>&1 || useradd --system --home-dir /var/lib/portfolio --shell /usr/sbin/nologin portfolio
install -d -o portfolio -g portfolio -m 0700 /var/lib/portfolio
install -d -m 0755 /opt/portfolio/releases
if [[ ! -f /var/lib/portfolio/ssh_host_ed25519_key ]]; then
  ssh-keygen -q -t ed25519 -N '' -f /var/lib/portfolio/ssh_host_ed25519_key
  chown portfolio:portfolio /var/lib/portfolio/ssh_host_ed25519_key*
fi

# Keep real administrative SSH on IPv4; public IPv6 port 22 belongs to the TUI.
cat > /etc/ssh/sshd_config.d/10-portfolio.conf <<'EOF'
AddressFamily inet
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
EOF
sshd -t
systemctl restart ssh
