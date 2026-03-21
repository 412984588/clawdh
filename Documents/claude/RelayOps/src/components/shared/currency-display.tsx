import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface CurrencyDisplayProps {
  amount: number
  currency?: string
  className?: string
  /** Show green/red coloring based on positive/negative */
  colored?: boolean
}

export function CurrencyDisplay({
  amount,
  currency = 'USD',
  className,
  colored = false,
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, currency)
  return (
    <span
      className={cn(
        'tabular-nums',
        colored && amount > 0 && 'text-green-600',
        colored && amount < 0 && 'text-destructive',
        className
      )}
    >
      {formatted}
    </span>
  )
}
