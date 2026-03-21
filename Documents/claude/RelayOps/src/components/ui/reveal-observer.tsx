'use client'

import { useEffect } from 'react'

export function RevealObserver() {
  useEffect(() => {
    // Initialize scroll reveal targets
    const revealTargets = document.querySelectorAll('[data-reveal]:not([data-reveal-ready])')
    revealTargets.forEach((element) => {
      element.setAttribute('data-reveal-ready', 'true')
    })

    const show = (element: Element) => {
      element.classList.add('opacity-100', 'translate-y-0')
      element.classList.remove('opacity-0', 'translate-y-6')
    }

    let revealObserver: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target)
              revealObserver!.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
      )
      revealTargets.forEach((element) => revealObserver!.observe(element))
    } else {
      revealTargets.forEach(show)
    }

    // Counter animation
    const counters = document.querySelectorAll('[data-counter-end]:not([data-counter-ready])')
    counters.forEach((element) => {
      element.setAttribute('data-counter-ready', 'true')
    })

    const animateCounter = (element: Element) => {
      if (element.getAttribute('data-counter-animated') === 'true') return
      element.setAttribute('data-counter-animated', 'true')
      const end = Number(element.getAttribute('data-counter-end') || 0)
      const prefix = element.getAttribute('data-counter-prefix') || ''
      const suffix = element.getAttribute('data-counter-suffix') || ''
      const decimals = Number(element.getAttribute('data-counter-decimals') || 0)
      const duration = 1400
      const startTime = performance.now()

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        const value = (end * eased).toFixed(decimals)
        element.textContent = prefix + value + suffix
        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          element.textContent = prefix + end.toFixed(decimals) + suffix
        }
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        element.textContent = prefix + end.toFixed(decimals) + suffix
        return
      }
      requestAnimationFrame(step)
    }

    let counterObserver: IntersectionObserver | undefined
    if ('IntersectionObserver' in window) {
      counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target)
              counterObserver!.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.45 },
      )
      counters.forEach((element) => counterObserver!.observe(element))
    } else {
      counters.forEach(animateCounter)
    }

    return () => {
      revealObserver?.disconnect()
      counterObserver?.disconnect()
    }
  }, [])

  return null
}
