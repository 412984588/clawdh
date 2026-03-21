import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Multi-step form state pattern — generalised for any form shape
export interface StepConfig {
  id: string;
  label: string;
  isValid: (data: Record<string, unknown>) => boolean;
}

interface FormState<T extends Record<string, unknown> = Record<string, unknown>> {
  data: T;
  currentStepIndex: number;
  steps: StepConfig[];
  errors: Partial<Record<keyof T, string>>;
  isDirty: boolean;
  isSubmitting: boolean;
  isComplete: boolean;
}

interface FormActions<T extends Record<string, unknown> = Record<string, unknown>> {
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  setFields: (fields: Partial<T>) => void;
  setError: <K extends keyof T>(key: K, message: string) => void;
  clearError: <K extends keyof T>(key: K) => void;
  clearAllErrors: () => void;
  nextStep: () => boolean; // returns false if current step invalid
  prevStep: () => void;
  goToStep: (index: number) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  complete: () => void;
}

// Example: SaaS onboarding form
export interface OnboardingFormData {
  // Step 1: Account
  email: string;
  password: string;
  // Step 2: Profile
  name: string;
  company: string;
  // Step 3: Plan
  planId: string;
  billingInterval: "monthly" | "yearly";
}

const onboardingSteps: StepConfig[] = [
  { id: "account", label: "Account", isValid: (d) => !!(d.email && d.password) },
  { id: "profile", label: "Profile", isValid: (d) => !!(d.name) },
  { id: "plan", label: "Plan", isValid: (d) => !!(d.planId) },
];

const initialData: OnboardingFormData = {
  email: "", password: "", name: "", company: "", planId: "", billingInterval: "monthly",
};

export const useOnboardingFormStore = create<FormState<OnboardingFormData> & FormActions<OnboardingFormData>>()(
  devtools(
    (set, get) => ({
      data: initialData,
      currentStepIndex: 0,
      steps: onboardingSteps,
      errors: {},
      isDirty: false,
      isSubmitting: false,
      isComplete: false,

      setField: (key, value) =>
        set((s) => ({ data: { ...s.data, [key]: value }, isDirty: true }), false, "form/setField"),

      setFields: (fields) =>
        set((s) => ({ data: { ...s.data, ...fields }, isDirty: true }), false, "form/setFields"),

      setError: (key, message) =>
        set((s) => ({ errors: { ...s.errors, [key]: message } }), false, "form/setError"),

      clearError: (key) =>
        set((s) => { const e = { ...s.errors }; delete e[key]; return { errors: e }; }, false, "form/clearError"),

      clearAllErrors: () => set({ errors: {} }, false, "form/clearErrors"),

      nextStep: () => {
        const { currentStepIndex, steps, data } = get();
        const currentStep = steps[currentStepIndex];
        if (!currentStep.isValid(data as Record<string, unknown>)) return false;
        if (currentStepIndex < steps.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 }, false, "form/nextStep");
        }
        return true;
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) set({ currentStepIndex: currentStepIndex - 1 }, false, "form/prevStep");
      },

      goToStep: (index) => set({ currentStepIndex: index }, false, "form/goToStep"),

      setSubmitting: (isSubmitting) => set({ isSubmitting }, false, "form/setSubmitting"),

      reset: () => set({ data: initialData, currentStepIndex: 0, errors: {}, isDirty: false, isComplete: false }, false, "form/reset"),

      complete: () => set({ isComplete: true, isSubmitting: false }, false, "form/complete"),
    }),
    { name: "OnboardingFormStore" }
  )
);

export const selectCurrentStep = (s: FormState) => s.steps[s.currentStepIndex];
export const selectIsLastStep = (s: FormState) => s.currentStepIndex === s.steps.length - 1;
export const selectProgress = (s: FormState) =>
  Math.round(((s.currentStepIndex + 1) / s.steps.length) * 100);
