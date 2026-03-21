# FAQ — OpenAPI Spec Templates

**Which OpenAPI version do these use?**
OpenAPI 3.1.0 — the current standard, compatible with JSON Schema.

**Do these validate with standard tools?**
Yes. All specs are designed to pass `npx @redocly/cli lint openapi.yaml`.

**Can I use these to generate client SDKs?**
Yes. Works with openapi-typescript, openapi-generator, and other tools. Each README includes the commands.

**Are the schemas reusable across specs?**
Each spec is self-contained. You can copy components/schemas from one spec into another.

**Can I use these for non-REST APIs?**
These are REST-focused. The Webhook spec partially covers async patterns.

**Do these include example values?**
Yes, where relevant — UUID formats, enum values, and description fields on most properties.

**Refund policy?**
30 days, no questions asked.
