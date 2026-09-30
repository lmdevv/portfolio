#!/usr/bin/env bash
set -euo pipefail

project=${GCP_PROJECT_ID:?set GCP_PROJECT_ID}
region=${GCP_REGION:-us-east1}
zone=${GCP_ZONE:-us-east1-b}
vm=${GCP_VM_NAME:-portfolio-ssh}
repository_id=${GITHUB_REPOSITORY_ID:-1270838169}
owner_id=${GITHUB_OWNER_ID:-138343225}
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)

# The project must already exist and have an active billing account.
gcloud services enable compute.googleapis.com iam.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com iap.googleapis.com \
  cloudresourcemanager.googleapis.com oslogin.googleapis.com --project="$project" --quiet
project_number=$(gcloud projects describe "$project" --format='value(projectNumber)')

if ! gcloud compute networks describe portfolio --project="$project" >/dev/null 2>&1; then
  gcloud compute networks create portfolio --subnet-mode=custom --project="$project" --quiet
fi
if ! gcloud compute networks subnets describe portfolio --region="$region" --project="$project" >/dev/null 2>&1; then
  gcloud compute networks subnets create portfolio --network=portfolio --region="$region" \
    --range=10.77.0.0/24 --stack-type=IPV4_IPV6 --ipv6-access-type=EXTERNAL \
    --enable-private-ip-google-access --project="$project" --quiet
fi
if ! gcloud compute firewall-rules describe portfolio-public-ssh --project="$project" >/dev/null 2>&1; then
  gcloud compute firewall-rules create portfolio-public-ssh --network=portfolio \
    --allow=tcp:22 --source-ranges=::/0 --target-tags=portfolio-ssh --project="$project" --quiet
fi
if ! gcloud compute firewall-rules describe portfolio-admin-iap --project="$project" >/dev/null 2>&1; then
  gcloud compute firewall-rules create portfolio-admin-iap --network=portfolio \
    --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=portfolio-ssh --project="$project" --quiet
fi
if ! gcloud compute addresses describe portfolio-ssh-ipv6 --region="$region" --project="$project" >/dev/null 2>&1; then
  gcloud compute addresses create portfolio-ssh-ipv6 --region="$region" --subnet=portfolio \
    --ip-version=IPV6 --endpoint-type=VM --network-tier=PREMIUM --project="$project" --quiet
fi
ipv6=$(gcloud compute addresses describe portfolio-ssh-ipv6 --region="$region" \
  --project="$project" --format='value(address)')
if ! gcloud compute instances describe "$vm" --zone="$zone" --project="$project" >/dev/null 2>&1; then
  gcloud compute instances create "$vm" --zone="$zone" --machine-type=e2-micro \
    --image-family=debian-13 --image-project=debian-cloud \
    --boot-disk-size=20GB --boot-disk-type=pd-standard \
    --subnet=portfolio --stack-type=IPV4_IPV6 --no-address \
    --external-ipv6-address="$ipv6" --external-ipv6-prefix-length=96 \
    --no-service-account --no-scopes --tags=portfolio-ssh \
    --metadata=enable-oslogin=TRUE,block-project-ssh-keys=TRUE \
    --metadata-from-file="startup-script=$script_dir/bootstrap.sh" \
    --project="$project" --quiet
fi

service_account="portfolio-deploy@$project.iam.gserviceaccount.com"
if ! gcloud iam service-accounts describe "$service_account" --project="$project" >/dev/null 2>&1; then
  gcloud iam service-accounts create portfolio-deploy --display-name='Portfolio GitHub deployment' \
    --project="$project" --quiet
fi
if ! gcloud iam workload-identity-pools describe github --location=global --project="$project" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create github --location=global --display-name='GitHub Actions' \
    --project="$project" --quiet
fi
if ! gcloud iam workload-identity-pools providers describe portfolio --workload-identity-pool=github \
  --location=global --project="$project" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc portfolio \
    --workload-identity-pool=github --location=global --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping='google.subject=assertion.sub,attribute.repository_id=assertion.repository_id' \
    --attribute-condition="assertion.repository_owner_id == '$owner_id' && assertion.repository_id == '$repository_id' && assertion.ref == 'refs/heads/master'" \
    --project="$project" --quiet
fi
gcloud iam service-accounts add-iam-policy-binding "$service_account" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$project_number/locations/global/workloadIdentityPools/github/attribute.repository_id/$repository_id" \
  --project="$project" --quiet

# This dedicated project has one VM. No instance creation or billing permissions are granted to CI.
for role in roles/compute.viewer roles/compute.osAdminLogin roles/iap.tunnelResourceAccessor; do
  gcloud projects add-iam-policy-binding "$project" --member="serviceAccount:$service_account" \
    --role="$role" --condition=None --quiet >/dev/null
done

printf 'GCP_PROJECT_ID=%s\nGCP_VM_NAME=%s\nGCP_ZONE=%s\nGCP_DEPLOY_SERVICE_ACCOUNT=%s\nGCP_WORKLOAD_IDENTITY_PROVIDER=projects/%s/locations/global/workloadIdentityPools/github/providers/portfolio\nSSH_IPV6=%s\n' \
  "$project" "$vm" "$zone" "$service_account" "$project_number" "$ipv6"
