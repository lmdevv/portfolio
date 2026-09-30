# SSH deployment

The website deploys through Cloudflare Pages' GitHub integration on every push to `master`.
The GitHub Actions workflow checks both clients, builds the portable Linux x64 TUI, and deploys
it to Compute Engine through IAP. GitHub authenticates using OIDC; no service account key is stored.

The public service listens on IPv6 port 22. Only `portfolio` can connect, without a password or
individual SSH key. Every terminal session launches the portfolio binary. Commands are passed as
route text, never executed by a shell. File transfers, forwarding, and nonterminal sessions are
rejected. Real administrative SSH listens on private IPv4 and is reachable through IAP.

```sh
ssh portfolio@ssh.luismario.me
ssh -t portfolio@ssh.luismario.me /blog
```

Visitors need IPv6 connectivity. The service defaults to four simultaneous sessions, ten minutes
per session, and animations off. Its systemd memory limit is 750 MiB. These limits help contain
resource usage; they do not guarantee that GCP's monthly outbound allowance cannot be exceeded.

## Provisioning

Create a dedicated GCP project linked to an active billing account, then run from an authenticated
Cloud Shell or local gcloud installation:

```sh
GCP_PROJECT_ID=your-project bash deploy/ssh/provision-gcp.sh
```

The script creates an `e2-micro` in `us-east1-b`, a 20 GB standard persistent disk, a dedicated VPC,
static external IPv6, and firewall rules for public IPv6 SSH and private IAP administration.
It grants CI deployment access to the dedicated project and restricts GitHub federation to this
repository's numeric IDs and the `master` branch. The VM has no service account or external IPv4.

Set these GitHub repository variables from the script's output:

- `GCP_PROJECT_ID`
- `GCP_VM_NAME`
- `GCP_ZONE`
- `GCP_DEPLOY_SERVICE_ACCOUNT`
- `GCP_WORKLOAD_IDENTITY_PROVIDER`

Create a DNS-only Cloudflare `AAAA` record for `ssh.luismario.me` using `SSH_IPV6`. Keep the website's
Cloudflare Pages DNS records and build configuration.

## Releases and rollback

Each release lives in `/opt/portfolio/releases/<commit>`. Deployment changes the `current` symlink,
restarts the public service, and opens a local SSH session to check that the TUI renders and exits.
A failed check restores the previous release. Deployments disconnect existing visitor sessions;
visitors can reconnect immediately. Old releases are pruned while retaining rollback candidates.

To restore a retained release through administrative SSH:

```sh
gcloud compute ssh portfolio-ssh --project=your-project --zone=us-east1-b --tunnel-through-iap
sudo ln -sfn /opt/portfolio/releases/COMMIT /opt/portfolio/current
sudo cp /opt/portfolio/current/portfolio-ssh.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl restart portfolio-ssh
sudo python3 /opt/portfolio/current/smoke_test.py
```

Run service tests inside the repository's Nix devshell:

```sh
nix develop -c python3 deploy/ssh/test_server.py
```
