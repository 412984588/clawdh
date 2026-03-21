'use client'

import { useEffect, useRef } from 'react'
import { useInView, m, animate, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface CounterProps {
  end: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
  containerClassName?: string
}

export function Counter({
  end,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 2.4,
  className,
  containerClassName,
}: CounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.45 })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    return prefix + latest.toFixed(decimals) + suffix
  })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, end, {
        duration,
        ease: [0.22, 1, 0.36, 1], // MOTION_EASE
      })
      return () => controls.stop()
    }
  }, [isInView, count, end, duration])

  return (
    <m.span ref={ref} className={cn('tabular-nums', className)}>
      {rounded}
    </m.span>
  )
}
