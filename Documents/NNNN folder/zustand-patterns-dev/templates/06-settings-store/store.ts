import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "zh" | "es" | "fr" | "de" | "ja";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

interface UserSettings {
  theme: Theme;
  language: Language;
  dateFormat: DateFormat;
  timezone: string;
  emailNotifications: {
    newsletter: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    weeklyDigest: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: "sm" | "md" | "lg";
  };
}

interface SettingsState {
  settings: UserSettings;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

interface SettingsActions {
  updateTheme: (theme: Theme) => void;
  updateLanguage: (language: Language) => void;
  updateEmailNotification: (key: keyof UserSettings["emailNotifications"], value: boolean) => void;
  updateAccessibility: (key: keyof UserSettings["accessibility"], value: unknown) => void;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  saveToServer: () => Promise<void>;
  resetToDefaults: () => void;
}

const defaultSettings: UserSettings = {
  theme: "system",
  language: "en",
  dateFormat: "MM/DD/YYYY",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  emailNotifications: {
    newsletter: false,
    productUpdates: true,
    securityAlerts: true,
    weeklyDigest: false,
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: "md",
  },
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        settings: defaultSettings,
        isSaving: false,
        lastSavedAt: null,

        updateTheme: (theme) =>
          set((s) => { s.settings.theme = theme; }, false, "settings/theme"),

        updateLanguage: (language) =>
          set((s) => { s.settings.language = language; }, false, "settings/language"),

        updateEmailNotification: (key, value) =>
          set((s) => { s.settings.emailNotifications[key] = value; }, false, "settings/email"),

        updateAccessibility: (key, value) =>
          set((s) => { (s.settings.accessibility as Record<string, unknown>)[key as string] = value; }, false, "settings/a11y"),

        updateSetting: (key, value) =>
          set((s) => { (s.settings as Record<string, unknown>)[key as string] = value; }, false, "settings/update"),

        saveToServer: async () => {
          set((s) => { s.isSaving = true; }, false, "settings/saveStart");
          try {
            await fetch("/api/settings", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(get().settings),
            });
            set((s) => { s.isSaving = false; s.lastSavedAt = new Date(); }, false, "settings/saveSuccess");
          } catch (err) {
            set((s) => { s.isSaving = false; }, false, "settings/saveError");
            console.error("Failed to save settings:", err);
          }
        },

        resetToDefaults: () =>
          set((s) => { s.settings = defaultSettings; }, false, "settings/reset"),
      })),
      { name: "user-settings", partialize: (s) => ({ settings: s.settings }) }
    ),
    { name: "SettingsStore" }
  )
);

export const selectTheme = (s: SettingsState) => s.settings.theme;
export const selectLanguage = (s: SettingsState) => s.settings.language;
