/**
 * GitHub Actions Deployment Workflows
 * Deploy to AWS ECS, Railway, Render, Fly.io via GitHub Actions
 */
import { writeFileSync } from "fs";

// ── Docker Hub + AWS ECS deployment ──────────────────────────────────────────

export const ECS_DEPLOY_WORKFLOW = `name: Deploy to AWS ECS

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: my-app
  ECS_SERVICE: my-app-service
  ECS_CLUSTER: my-app-cluster
  CONTAINER_NAME: app

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to ECR
        id: build-image
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG .
          docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG
          echo "image=\$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG" >> \$GITHUB_OUTPUT

      - name: Fill in the new image ID in the ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ecs-task-definition.json
          container-name: \${{ env.CONTAINER_NAME }}
          image: \${{ steps.build-image.outputs.image }}

      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: \${{ steps.task-def.outputs.task-definition }}
          service: \${{ env.ECS_SERVICE }}
          cluster: \${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
`;

// ── Railway deployment ────────────────────────────────────────────────────────

export const RAILWAY_DEPLOY_WORKFLOW = `name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Railway CLI
        run: npm install -g @railway/cli

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: \${{ secrets.RAILWAY_TOKEN }}
        run: railway up --service my-app
`;

// ── Fly.io deployment ─────────────────────────────────────────────────────────

export const FLYIO_DEPLOY_WORKFLOW = `name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy app
    runs-on: ubuntu-latest
    concurrency: deploy-group

    steps:
      - uses: actions/checkout@v4

      - uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Deploy
        run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: \${{ secrets.FLY_API_TOKEN }}
`;

// ── Docker Hub + Render deployment ────────────────────────────────────────────

export const RENDER_DEPLOY_WORKFLOW = `name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USERNAME }}
          password: \${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ secrets.DOCKER_USERNAME }}/my-app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render deploy hook
        run: |
          curl -X POST "\${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
`;

// ── Required GitHub Actions secrets reference ─────────────────────────────────

export const REQUIRED_SECRETS: Record<string, string[]> = {
  "aws-ecs": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
  ],
  "railway": ["RAILWAY_TOKEN"],
  "flyio": ["FLY_API_TOKEN"],
  "render": ["DOCKER_USERNAME", "DOCKER_TOKEN", "RENDER_DEPLOY_HOOK_URL"],
};

export type DeployTarget = "aws-ecs" | "railway" | "flyio" | "render";

export function getDeployWorkflow(target: DeployTarget): string {
  const map: Record<DeployTarget, string> = {
    "aws-ecs": ECS_DEPLOY_WORKFLOW,
    "railway": RAILWAY_DEPLOY_WORKFLOW,
    "flyio": FLYIO_DEPLOY_WORKFLOW,
    "render": RENDER_DEPLOY_WORKFLOW,
  };
  return map[target];
}

export function writeDeployWorkflow(
  target: DeployTarget,
  path = `.github/workflows/deploy-${target}.yml`
): void {
  writeFileSync(path, getDeployWorkflow(target));
  console.log(`[GitHub Actions] Wrote ${target} deploy workflow`);
  console.log(`[Required secrets]: ${REQUIRED_SECRETS[target].join(", ")}`);
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== GitHub Actions Deploy Workflows ===\n");
  console.log("Available deploy targets:", Object.keys(REQUIRED_SECRETS).join(", "));
  console.log("\nFly.io (simplest):");
  console.log(FLYIO_DEPLOY_WORKFLOW);
}

main();
