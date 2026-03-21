/**
 * GitHub Actions CI Workflow Generator
 * Generates Node.js CI workflows with testing, linting, and type checking
 */
import { writeFileSync } from "fs";

// ── Node.js CI workflow ───────────────────────────────────────────────────────

export const NODEJS_CI_WORKFLOW = `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: TypeScript type check
        run: npx tsc --noEmit

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint-and-typecheck

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    env:
      DATABASE_URL: postgresql://postgres:test@localhost:5432/test_db
      REDIS_URL: redis://localhost:6379
      NODE_ENV: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run database migrations
        run: npx prisma migrate deploy

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build (verify image builds)
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          tags: app:test
          cache-from: type=gha
          cache-to: type=gha,mode=max
`;

// ── Matrix testing workflow ───────────────────────────────────────────────────

export const MATRIX_CI_WORKFLOW = `name: Matrix CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    name: Test (Node \${{ matrix.node-version }})
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: ["18", "20", "22"]
      fail-fast: false

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm test
`;

// ── Workflow file writer ──────────────────────────────────────────────────────

export type WorkflowType = "nodejs-ci" | "matrix-ci";

export function writeWorkflow(
  type: WorkflowType,
  path = ".github/workflows/ci.yml"
): void {
  const map: Record<WorkflowType, string> = {
    "nodejs-ci": NODEJS_CI_WORKFLOW,
    "matrix-ci": MATRIX_CI_WORKFLOW,
  };
  writeFileSync(path, map[type]);
  console.log(`[GitHub Actions] Wrote ${type} workflow to ${path}`);
}

// ── Workflow validator ────────────────────────────────────────────────────────

export interface WorkflowJob {
  name: string;
  needs?: string | string[];
  steps: number;
}

export function parseWorkflowJobs(yaml: string): WorkflowJob[] {
  const jobs: WorkflowJob[] = [];
  const jobMatches = yaml.matchAll(/^  (\w[\w-]*):$/gm);

  for (const match of jobMatches) {
    const jobName = match[1];
    if (jobName === "on" || jobName === "jobs") continue;

    const stepsMatch = yaml.match(new RegExp(`${jobName}:[\\s\\S]*?steps:([\\s\\S]*?)(?=\\n  \\w|$)`));
    const stepCount = (stepsMatch?.[1].match(/- (name|uses|run):/g) ?? []).length;

    jobs.push({ name: jobName, steps: stepCount });
  }

  return jobs;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

function main() {
  console.log("=== GitHub Actions CI Workflow ===\n");
  console.log(NODEJS_CI_WORKFLOW);

  const jobs = parseWorkflowJobs(NODEJS_CI_WORKFLOW);
  console.log("\nParsed jobs:", jobs);
}

main();
