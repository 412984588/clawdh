// Vue Router 4 模式 — 命名路由、导航守卫、动态路由、懒加载、元信息
// import { createRouter, createWebHistory, type RouteRecordRaw, type NavigationGuardNext } from 'vue-router'

// ===== 1. 路由定义（类型安全）=====

export interface RouteMeta {
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  title?: string;
  breadcrumb?: string[];
}

// 路由配置示例（在 .vue 项目中实际使用 createRouter）
export const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("./views/HomeView.vue"),
    meta: { title: "Home" } as RouteMeta,
  },
  {
    path: "/login",
    name: "login",
    component: () => import("./views/LoginView.vue"),
    meta: { title: "Login" } as RouteMeta,
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: () => import("./views/DashboardView.vue"),
    meta: { requiresAuth: true, title: "Dashboard" } as RouteMeta,
    children: [
      {
        path: "analytics",
        name: "dashboard-analytics",
        component: () => import("./views/AnalyticsView.vue"),
      },
      {
        path: "settings",
        name: "dashboard-settings",
        component: () => import("./views/SettingsView.vue"),
      },
    ],
  },
  {
    path: "/users/:id(\\d+)",
    name: "user-detail",
    component: () => import("./views/UserDetailView.vue"),
    props: true, // 将 route.params 作为 props 传入组件
    meta: { requiresAuth: true } as RouteMeta,
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("./views/AdminView.vue"),
    meta: { requiresAuth: true, requiresAdmin: true } as RouteMeta,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./views/NotFoundView.vue"),
  },
];

// ===== 2. 导航守卫 =====

// router.beforeEach 全局前置守卫
export function createAuthGuard(getUser: () => { isLoggedIn: boolean; isAdmin: boolean } | null) {
  return function authGuard(
    to: { meta: RouteMeta; name: string },
    _from: unknown,
    next: (args?: string | { name: string } | false) => void
  ) {
    const user = getUser();
    const meta = to.meta;

    if (meta.requiresAuth && !user?.isLoggedIn) {
      next({ name: "login" });
      return;
    }

    if (meta.requiresAdmin && !user?.isAdmin) {
      next({ name: "dashboard" });
      return;
    }

    next();
  };
}

// router.afterEach — 设置页面标题
export function createTitleGuard(appName = "My App") {
  return function titleGuard(to: { meta: RouteMeta }) {
    document.title = to.meta.title ? `${to.meta.title} | ${appName}` : appName;
  };
}

// ===== 3. 路由级加载状态 =====

export function createLoadingGuard(
  setLoading: (v: boolean) => void
) {
  return {
    before: (_to: unknown, _from: unknown, next: () => void) => {
      setLoading(true);
      next();
    },
    after: () => {
      setLoading(false);
    },
  };
}

// ===== 4. useRoute & useRouter composable 封装 =====

// 实际项目中从 vue-router 导入：
// import { useRoute, useRouter } from 'vue-router'

export interface TypedRoute {
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  name: string | null | symbol;
  meta: RouteMeta;
  path: string;
}

// 强类型路由参数 composable
export function useTypedParams<T extends Record<string, string>>(
  route: TypedRoute
): T {
  return route.params as T;
}

// 查询参数辅助
export function useQueryParam(
  route: TypedRoute,
  key: string,
  defaultValue = ""
): string {
  const val = route.query[key];
  return Array.isArray(val) ? (val[0] ?? defaultValue) : (val ?? defaultValue);
}

export function usePaginationQuery(route: TypedRoute) {
  const page = parseInt(useQueryParam(route, "page", "1"), 10) || 1;
  const limit = parseInt(useQueryParam(route, "limit", "20"), 10) || 20;
  return { page, limit };
}

// ===== 5. 滚动行为 =====

export function scrollBehavior(
  to: { hash: string },
  _from: unknown,
  savedPosition: { left: number; top: number } | null
) {
  if (savedPosition) return savedPosition;
  if (to.hash) return { el: to.hash, behavior: "smooth" };
  return { top: 0, behavior: "smooth" };
}

// ===== 6. 程序化导航辅助 =====

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length ? `?${parts.join("&")}` : "";
}

export type { RouteMeta as RouteMetaType };
