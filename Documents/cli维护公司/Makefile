.PHONY: setup test test-resilience test-validation benchmark lint format format-check build ci health-check

setup:
	cd backend && uv sync --all-groups
	cd frontend && npm install

test:
	cd backend && uv run pytest
	cd frontend && npm run test -- --run

test-resilience:
	cd backend && uv run pytest ../tests/test_adapter_resilience.py -v --tb=short

benchmark:
	cd backend && uv run pytest ../tests/test_benchmarks.py -v -s --tb=short

test-validation:
	cd backend && uv run pytest ../tests/test_validation.py -v --tb=short

lint:
	cd backend && uv run ruff check .
	cd backend && uv run ty check src
	cd frontend && npm run lint

format:
	cd backend && uv run ruff format .
	cd frontend && npm run format

format-check:
	cd backend && uv run ruff format --check .
	cd frontend && npm run format

build:
	cd backend && uv run python -m compileall src
	cd frontend && npm run build

ci: test lint format-check build

health-check:
	python3 scripts/agent_health_check.py

health-check-json:
	python3 scripts/agent_health_check.py --json
