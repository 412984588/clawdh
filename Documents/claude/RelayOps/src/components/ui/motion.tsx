'use client'

import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  AnimatePresence,
  type HTMLMotionProps,
} from 'framer-motion'
import { usePathname } from 'next/navigation'
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

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const reduced = useReducedMotionPreference()

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        initial={reduced ? false : { opacity: 1, y: 8 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 1, y: -8 }}
        transition={{ duration: MOTION_DURATIONS.fast, ease: MOTION_EASE }}
        className="flex-1 flex flex-col"
      >
        {children}
      </m.div>
    </AnimatePresence>
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
  viewport = { once: true, margin: "-50px" },
  ...props
}: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotionPreference()

  // 渐进增强：SSR/无JS 时默认可见（opacity:1），客户端 hydrate 后才做动画
  // 用 translateY 微移代替 opacity 0→1，避免白屏风险
  return (
    <m.div
      data-motion="fade-in"
      data-reduced-motion={reduced ? 'true' : 'false'}
      initial={reduced ? false : { opacity: 1, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={
        reduced
          ? undefined
          : { duration: MOTION_DURATIONS.fast, ease: MOTION_EASE, ...transition }
      }
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={style as CSSProperties | undefined}
      {...props}
    />
  )
}

export function SlideUp({
  className,
  style,
  transition,
  viewport = { once: true, margin: "-50px" },
  ...props
}: HTMLMotionProps<'div'>) {
  const reduced = useReducedMotionPreference()

  // 渐进增强：初始 opacity:1 避免白屏，只做 translateY 动画
  return (
    <m.div
      data-motion="slide-up"
      data-reduced-motion={reduced ? 'true' : 'false'}
      initial={reduced ? false : { opacity: 1, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={
        reduced
          ? undefined
          : { duration: MOTION_DURATIONS.slow, ease: MOTION_EASE, ...transition }
      }
      className={cn(MOTION_REDUCE_CLASS, className)}
      style={style as CSSProperties | undefined}
      {...props}
    />
  )
}

type StaggerListProps =
  | ({ as?: 'div'; children: ReactNode } & Omit<HTMLMotionProps<'div'>, 'children'>)
  | ({ as: 'tbody'; children: ReactNode } & Omit<HTMLMotionProps<'tbody'>, 'children'>)
  | ({ as: 'ul'; children: ReactNode } & Omit<HTMLMotionProps<'ul'>, 'children'>)

export function StaggerList(props: StaggerListProps) {
  const reduced = useReducedMotionPreference()
  const baseProps = {
    'data-motion': 'stagger-list' as const,
    'data-reduced-motion': reduced ? 'true' : 'false',
    initial: reduced ? false : 'hidden',
    whileInView: reduced ? undefined : 'show',
    viewport: { once: true, margin: "-50px" },
    variants: reduced
      ? undefined
      : {
          hidden: { opacity: 1 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.05,
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

  if (props.as === 'ul') {
    const { as: _as, children, className, style, ...ulProps } = props
    return (
      <m.ul
        {...baseProps}
        className={cn(MOTION_REDUCE_CLASS, className)}
        style={mergeMotionStyle(style as CSSProperties | undefined, reduced, 'transform, opacity')}
        {...ulProps}
      >
        {children}
      </m.ul>
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
          hidden: { opacity: 1, y: 24 },
          show: {
            opacity: 1,
            y: 0,
            transition: {
              duration: MOTION_DURATIONS.slow,
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
