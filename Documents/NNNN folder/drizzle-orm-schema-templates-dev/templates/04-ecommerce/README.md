# E-Commerce Schema

Full product catalog and order management for e-commerce apps.

## Tables
- `categories` — nested product categories (supports parent_id hierarchy)
- `products` — product listings with pricing and SKU
- `product_variants` — variant options (size, color, etc.) with individual stock/pricing
- `orders` — customer orders with status tracking
- `order_items` — line items with price snapshots

## Features
- Product variants with individual pricing and stock
- Guest checkout support (userId is nullable)
- Price snapshots on order items (historical accuracy)
- Stripe payment intent integration field
