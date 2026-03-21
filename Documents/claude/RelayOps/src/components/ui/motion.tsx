'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  type HTMLMotionProps,
} from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const MOTION_DURATIONS = {
  fast: 0.18,
  base: 0.22,
  slow: 0.28,
} as const

const MOTION_REDUCE_CLASS = 'motion-reduce:transform-none motion-reduce:transition-none'

function mergeMotionStyle(
  style: CSSProperties | undefined,
  reduced: boolean,
  willChange: CSSProperties['willChange'],
): CSSProperties | undefined {
  if (reduced) {
    return style
  }

  return {
    willChange,
    ...style,
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}

export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => setReduced(mediaQuery.matches)

    updateReducedMotion()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateReducedMotion)
      return () => mediaQuery.removeEventListener('change', updateReducedMotion)
    }

    mediaQuery.addListener(updateReducedMotion)
    return () => mediaQuery.removeListener(updateReducedMotion)
  }, [])

  return reduced
}

export function FadeIn({
  className,
  style,
  transition,
  ...props
}: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotionPreference()

  return (
    <m.div
      data-motion="fade-in"
      data-reduced-motion={reduced ? 'true' : 'false'}
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      transition={
        reduced
          ? undefined
          : { duration: MOTION_DURATIONS.fast, ease: MOTION_EASE, ...transition }
      }
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'opacity')}
      {...props}
    />
  )
}

export function SlideUp({
  className,
  style,
  transition,
  ...props
}: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotionPreference()

  return (
    <m.div
      data-motion="slide-up"
      data-reduced-motion={reduced ? 'true' : 'false'}
      initial={reduced ? false : { opacity: 0.92, y: 12 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={
        reduced
          ? undefined
          : { duration: MOTION_DURATIONS.base, ease: MOTION_EASE, ...transition }
      }
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
      {...props}
    />
  )
}

type StaggerListProps =
  | ({ as?: 'div'; children: ReactNode } & Omit<HTMLMotionProps<'div'>, 'children'>)
  | ({ as: 'tbody'; children: ReactNode } & Omit<HTMLMotionProps<'tbody'>, 'children'>)

export function StaggerList(props: StaggerListProps) {
  const reduced = useReducedMotionPreference()
  const baseProps = {
    'data-motion': 'stagger-list' as const,
    'data-reduced-motion': reduced ? 'true' : 'false',
    initial: reduced ? false : 'hidden',
    animate: reduced ? undefined : 'show',
    variants: reduced
      ? undefined
      : {
          hidden: { opacity: 1 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.04,
            },
          },
        },
  }

  if (props.as === 'tbody') {
    const { as: _as, children, className, style, ...tbodyProps } = props
    return (
      <m.tbody
        {...baseProps}
        className={cn(MOTION_REDUCE_CLASS, className)}
        style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
        {...tbodyProps}
      >
        {children}
      </m.tbody>
    )
  }

  const { as: _as, children, className, style, ...divProps } = props
  return (
    <m.div
      {...baseProps}
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
      {...divProps}
    >
      {children}
    </m.div>
  )
}

type StaggerItemProps =
  | ({ as?: 'div'; children: ReactNode } & Omit<HTMLMotionProps<'div'>, 'children'>)
  | ({ as: 'tr'; children: ReactNode } & Omit<HTMLMotionProps<'tr'>, 'children'>)
  | ({ as: 'li'; children: ReactNode } & Omit<HTMLMotionProps<'li'>, 'children'>)

export function StaggerItem(props: StaggerItemProps) {
  const reduced = useReducedMotionPreference()
  const baseProps = {
    'data-motion': 'stagger-item' as const,
    'data-reduced-motion': reduced ? 'true' : 'false',
    variants: reduced
      ? undefined
      : {
          hidden: { opacity: 0, y: 12 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: MOTION_DURATIONS.base,
              ease: MOTION_EASE,
            },
          },
        },
  }

  if (props.as === 'tr') {
    const { as: _as, children, className, style, ...trProps } = props
    return (
      <m.tr
        {...baseProps}
        className={cn(MOTION_REDUCE_CLASS, className)}
        style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
        {...trProps}
      >
        {children}
      </m.tr>
    )
  }

  if (props.as === 'li') {
    const { as: _as, children, className, style, ...liProps } = props
    return (
      <m.li
        {...baseProps}
        className={cn(MOTION_REDUCE_CLASS, className)}
        style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
        {...liProps}
      >
        {children}
      </m.li>
    )
  }

  const { as: _as, children, className, style, ...divProps } = props
  return (
    <m.div
      {...baseProps}
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
      {...divProps}
    >
      {children}
    </m.div>
  )
}
