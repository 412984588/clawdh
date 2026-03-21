import { describe, it, expect } from "vitest";

// ─── Functions/objects to snapshot ───────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

function buildNavigation(role: "admin" | "user" | "guest"): NavItem[] {
  const base: NavItem[] = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Profile", href: "/profile", icon: "user" },
  ];

  if (role === "admin") {
    return [
      ...base,
      {
        label: "Admin",
        href: "/admin",
        icon: "shield",
        children: [
          { label: "Users", href: "/admin/users" },
          { label: "Settings", href: "/admin/settings" },
          { label: "Audit Log", href: "/admin/audit" },
        ],
      },
    ];
  }

  if (role === "user") {
    return [...base, { label: "Dashboard", href: "/dashboard", icon: "grid" }];
  }

  // guest — minimal navigation
  return [base[0], { label: "Sign In", href: "/login" }];
}

interface ThemeConfig {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

function buildTheme(variant: "light" | "dark"): ThemeConfig {
  const shared = {
    spacing: { sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem" },
    borderRadius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", full: "9999px" },
  };

  if (variant === "dark") {
    return {
      ...shared,
      colors: {
        background: "#0f172a",
        surface: "#1e293b",
        primary: "#6366f1",
        text: "#f1f5f9",
        muted: "#64748b",
      },
    };
  }

  return {
    ...shared,
    colors: {
      background: "#ffffff",
      surface: "#f8fafc",
      primary: "#6366f1",
      text: "#0f172a",
      muted: "#64748b",
    },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("buildNavigation — inline snapshots", () => {
  it("produces admin navigation", () => {
    // Inline snapshots: the expected value is stored right here
    // Run `vitest run --update` to regenerate after intentional changes
    expect(buildNavigation("admin")).toMatchInlineSnapshot(`
      [
        {
          "href": "/",
          "icon": "home",
          "label": "Home",
        },
        {
          "href": "/profile",
          "icon": "user",
          "label": "Profile",
        },
        {
          "children": [
            {
              "href": "/admin/users",
              "label": "Users",
            },
            {
              "href": "/admin/settings",
              "label": "Settings",
            },
            {
              "href": "/admin/audit",
              "label": "Audit Log",
            },
          ],
          "href": "/admin",
          "icon": "shield",
          "label": "Admin",
        },
      ]
    `);
  });

  it("produces guest navigation", () => {
    expect(buildNavigation("guest")).toMatchInlineSnapshot(`
      [
        {
          "href": "/",
          "icon": "home",
          "label": "Home",
        },
        {
          "href": "/login",
          "label": "Sign In",
        },
      ]
    `);
  });

  it("user nav has 3 items", () => {
    const nav = buildNavigation("user");
    expect(nav).toHaveLength(3);
    // Also snapshot to catch shape regressions
    expect(nav[2]).toMatchInlineSnapshot(`
      {
        "href": "/dashboard",
        "icon": "grid",
        "label": "Dashboard",
      }
    `);
  });
});

describe("buildTheme — snapshot for config objects", () => {
  it("light theme matches snapshot", () => {
    expect(buildTheme("light")).toMatchInlineSnapshot(`
      {
        "borderRadius": {
          "full": "9999px",
          "lg": "0.75rem",
          "md": "0.5rem",
          "sm": "0.25rem",
        },
        "colors": {
          "background": "#ffffff",
          "muted": "#64748b",
          "primary": "#6366f1",
          "surface": "#f8fafc",
          "text": "#0f172a",
        },
        "spacing": {
          "lg": "1.5rem",
          "md": "1rem",
          "sm": "0.5rem",
          "xl": "2rem",
        },
      }
    `);
  });

  it("dark theme has dark background", () => {
    const theme = buildTheme("dark");
    expect(theme.colors.background).toBe("#0f172a");
    // Snapshot just the colors section
    expect(theme.colors).toMatchInlineSnapshot(`
      {
        "background": "#0f172a",
        "muted": "#64748b",
        "primary": "#6366f1",
        "surface": "#1e293b",
        "text": "#f1f5f9",
      }
    `);
  });

  it("both themes share same spacing", () => {
    const light = buildTheme("light");
    const dark = buildTheme("dark");
    expect(light.spacing).toEqual(dark.spacing);
    expect(light.borderRadius).toEqual(dark.borderRadius);
  });
});
