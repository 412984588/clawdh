# 04 — E-Commerce

Complete e-commerce schema with products, variants, categories, customers, and orders.

## Models

- **Customer** + **Address** — customer profiles with multiple addresses
- **Category** — self-referential tree for nested categories
- **Product** + **ProductVariant** — products with SKU-level inventory, price, stock
- **Order** + **OrderItem** — orders with shipping, tax, subtotals

## Key patterns

- `imageUrls String[]` — PostgreSQL array for multiple product images
- `attributes Json` — flexible variant attributes (color, size, etc.)
- Prices in cents (Int) to avoid floating-point issues
- `@unique @default(cuid())` orderNumber for readable order IDs
