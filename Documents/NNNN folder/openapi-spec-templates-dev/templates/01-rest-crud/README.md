# REST CRUD API — OpenAPI 3.1

Standard CRUD spec: list with pagination, create, get, update, delete.
Includes reusable Error, ValidationError, and PaginationMeta schemas.

## Usage
Validate: `npx @redocly/cli lint openapi.yaml`
Docs: `npx @redocly/cli preview-docs openapi.yaml`
Generate client: `npx openapi-typescript openapi.yaml -o types.ts`
