# Invoice Email

Transactional invoice email with line items and totals.

## Props

| Prop | Type | Default |
|------|------|---------|
| `customerName` | string | `"Customer"` |
| `invoiceNumber` | string | `"INV-0001"` |
| `invoiceDate` | string | `"2024-01-01"` |
| `dueDate` | string | `"2024-01-15"` |
| `items` | `LineItem[]` | 1 example item |
| `currency` | string | `"USD"` |

## Usage

```tsx
import InvoiceEmail from "./invoice";
<InvoiceEmail
  customerName="Acme Corp"
  invoiceNumber="INV-0042"
  items={[{ description: "Pro Plan", quantity: 1, unitPrice: 49 }]}
/>
```
