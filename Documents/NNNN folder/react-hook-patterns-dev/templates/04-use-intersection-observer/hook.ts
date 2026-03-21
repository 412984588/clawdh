import { useState, useEffect, useRef, useCallback } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Once true, stops observing (for lazy-load once patterns) */
  freezeOnceVisible?: boolean;
}

interface IntersectionState {
  isIntersecting: boolean;
  intersectionRatio: number;
  entry: IntersectionObserverEntry | null;
}

/**
 * Observes whether a DOM element is visible in the viewport.
 *
 * @example — Lazy load an image
 * const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
 * return <img ref={ref} src={isIntersecting ? realSrc : placeholder} />
 *
 * @example — Infinite scroll trigger
 * const { ref, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' })
 * useEffect(() => { if (isIntersecting) loadMore() }, [isIntersecting])
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): { ref: React.RefObject<Element | null>; isIntersecting: boolean } & IntersectionState {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options;

  const ref = useRef<Element | null>(null);
  const [state, setState] = useState<IntersectionState>({
    isIntersecting: false,
    intersectionRatio: 0,
    entry: null,
  });

  const frozen = state.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const element = ref.current;
    if (!element || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState({
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          entry,
        });
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, frozen]);

  return { ref, ...state };
}

/**
 * Simpler hook — just returns a ref and boolean.
 * Use when you don't need the full IntersectionObserverEntry.
 *
 * @example — Animate on scroll
 * const [ref, isVisible] = useIsVisible()
 * <div ref={ref} className={isVisible ? 'animate-in' : 'opacity-0'} />
 */
export function useIsVisible(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element | null>, boolean] {
  const { ref, isIntersecting } = useIntersectionObserver(options);
  return [ref, isIntersecting];
}

/**
 * Load-once hook — triggers a callback when element first enters viewport.
 *
 * @example
 * const ref = useLazyLoad(() => setLoaded(true))
 */
export function useLazyLoad(
  onVisible: () => void,
  options: IntersectionObserverInit = {}
): React.RefObject<Element | null> {
  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true,
  });
  const called = useRef(false);

  useEffect(() => {
    if (isIntersecting && !called.current) {
      called.current = true;
      onVisible();
    }
  }, [isIntersecting, onVisible]);

  return ref;
}

// Make React available for the ref types
import type React from "react";
