// Vue 3 过渡动画模式 — Transition、TransitionGroup、JS 钩子、GSAP 集成

import { computed, ref } from "vue";

// ===== 1. CSS 过渡类名方案 =====

// Vue <Transition> 自动应用的 CSS 类名：
// .v-enter-from, .v-enter-active, .v-enter-to
// .v-leave-from, .v-leave-active, .v-leave-to
//
// 自定义 name="fade"：
// .fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
// .fade-enter-from, .fade-leave-to { opacity: 0; }

export const CSS_TRANSITION_CLASSES = {
  fade: {
    enterActive: "transition-opacity duration-300 ease-in-out",
    leaveActive: "transition-opacity duration-300 ease-in-out",
    enterFrom: "opacity-0",
    leaveTo: "opacity-0",
  },
  slideRight: {
    enterActive: "transition-transform duration-300 ease-out",
    leaveActive: "transition-transform duration-200 ease-in",
    enterFrom: "translate-x-full",
    leaveTo: "translate-x-full",
  },
  slideDown: {
    enterActive: "transition-all duration-300 ease-out",
    leaveActive: "transition-all duration-200 ease-in",
    enterFrom: "opacity-0 -translate-y-2",
    leaveTo: "opacity-0 -translate-y-2",
  },
  scale: {
    enterActive: "transition-all duration-200 ease-out",
    leaveActive: "transition-all duration-150 ease-in",
    enterFrom: "opacity-0 scale-95",
    leaveTo: "opacity-0 scale-95",
  },
} as const;

// ===== 2. JavaScript 钩子（更精细的动画控制）=====

export interface TransitionHooks {
  onBeforeEnter?: (el: Element) => void;
  onEnter?: (el: Element, done: () => void) => void;
  onAfterEnter?: (el: Element) => void;
  onEnterCancelled?: (el: Element) => void;
  onBeforeLeave?: (el: Element) => void;
  onLeave?: (el: Element, done: () => void) => void;
  onAfterLeave?: (el: Element) => void;
  onLeaveCancelled?: (el: Element) => void;
}

// 高度展开/收起动画（适合手风琴）
export const collapseHooks: TransitionHooks = {
  onBeforeEnter(el) {
    (el as HTMLElement).style.maxHeight = "0";
    (el as HTMLElement).style.overflow = "hidden";
  },
  onEnter(el, done) {
    const target = el as HTMLElement;
    target.style.transition = "max-height 0.3s ease-out";
    target.style.maxHeight = target.scrollHeight + "px";
    target.addEventListener("transitionend", done, { once: true });
  },
  onAfterEnter(el) {
    (el as HTMLElement).style.maxHeight = "";
    (el as HTMLElement).style.overflow = "";
  },
  onBeforeLeave(el) {
    const target = el as HTMLElement;
    target.style.maxHeight = target.scrollHeight + "px";
    target.style.overflow = "hidden";
  },
  onLeave(el, done) {
    const target = el as HTMLElement;
    requestAnimationFrame(() => {
      target.style.transition = "max-height 0.25s ease-in";
      target.style.maxHeight = "0";
      target.addEventListener("transitionend", done, { once: true });
    });
  },
  onAfterLeave(el) {
    const target = el as HTMLElement;
    target.style.maxHeight = "";
    target.style.overflow = "";
  },
};

// ===== 3. TransitionGroup 列表动画 =====

// 在模板中使用：
// <TransitionGroup tag="ul" name="list" class="relative">
//   <li v-for="item in items" :key="item.id" class="list-item">
// </TransitionGroup>

// CSS:
// .list-enter-active, .list-leave-active { transition: all 0.3s ease; }
// .list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-30px); }
// .list-leave-active { position: absolute; } /* 让其他元素平滑移动 */
// .list-move { transition: transform 0.3s ease; }

export const LIST_TRANSITION_STYLES = `
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
.list-leave-active {
  position: absolute;
}
.list-move {
  transition: transform 0.3s ease;
}
`;

// ===== 4. 过渡状态管理 composable =====

export function useTransitionState(defaultShow = false) {
  const show = ref(defaultShow);
  const isAnimating = ref(false);

  function open() { show.value = true; }
  function close() { show.value = false; }
  function toggle() { show.value = !show.value; }

  const transitionProps = computed(() => ({
    onBeforeEnter: () => { isAnimating.value = true; },
    onAfterEnter: () => { isAnimating.value = false; },
    onBeforeLeave: () => { isAnimating.value = true; },
    onAfterLeave: () => { isAnimating.value = false; },
  }));

  return { show, isAnimating, open, close, toggle, transitionProps };
}

// ===== 5. GSAP 集成模式 =====

// import gsap from 'gsap'
//
// export const gsapFadeHooks: TransitionHooks = {
//   onBeforeEnter(el) { gsap.set(el, { opacity: 0, y: -20 }) },
//   onEnter(el, done) {
//     gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', onComplete: done })
//   },
//   onLeave(el, done) {
//     gsap.to(el, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in', onComplete: done })
//   }
// }
//
// export function useStaggeredList(container: Ref<HTMLElement | null>) {
//   function animateIn() {
//     if (!container.value) return
//     gsap.fromTo(container.value.children, { opacity: 0, y: 20 }, {
//       opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out'
//     })
//   }
//   return { animateIn }
// }

// ===== 6. 路由过渡 =====

export type TransitionName = "fade" | "slide-left" | "slide-right" | "scale";

export function useRouteTransition() {
  const transitionName = ref<TransitionName>("fade");
  const directionMap: Record<string, TransitionName> = {
    forward: "slide-left",
    backward: "slide-right",
  };

  function setDirection(direction: "forward" | "backward") {
    transitionName.value = directionMap[direction] ?? "fade";
  }

  return { transitionName, setDirection };
}

export type { TransitionHooks as VueTransitionHooks };
