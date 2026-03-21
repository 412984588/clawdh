# Cart Store

Shopping cart state with persistent storage, variant support, and computed totals.

## Features
- Variant-aware: (itemId + variantId) as composite key
- `persist` middleware: cart survives page refresh (localStorage)
- `updateQuantity(id, 0)` automatically removes the item
- Computed selectors for totals (no inline calculation)

## Usage

```tsx
const { addItem, items } = useCartStore();
const total = useCartStore(selectSubtotal);
const itemCount = useCartStore(selectTotalItems);

addItem({ id: "prod-1", name: "T-Shirt", price: 29.99 });
```
