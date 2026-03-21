// Vue 3 响应式表单模式 — reactive/ref 表单、验证、错误、提交状态
// 无第三方库的轻量表单验证方案

import { computed, reactive, ref } from "vue";

// ===== 1. 字段验证规则 =====

type Validator = (value: unknown) => string | undefined;

export const rules = {
  required(label = "Field"): Validator {
    return (v) => (!v && v !== 0 ? `${label} is required` : undefined);
  },
  minLength(min: number, label = "Field"): Validator {
    return (v) =>
      typeof v === "string" && v.length < min
        ? `${label} must be at least ${min} characters`
        : undefined;
  },
  maxLength(max: number, label = "Field"): Validator {
    return (v) =>
      typeof v === "string" && v.length > max
        ? `${label} must be at most ${max} characters`
        : undefined;
  },
  email(label = "Email"): Validator {
    return (v) =>
      typeof v === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? `${label} must be a valid email address`
        : undefined;
  },
  pattern(regex: RegExp, message: string): Validator {
    return (v) =>
      typeof v === "string" && !regex.test(v) ? message : undefined;
  },
  min(minimum: number, label = "Value"): Validator {
    return (v) =>
      typeof v === "number" && v < minimum
        ? `${label} must be at least ${minimum}`
        : undefined;
  },
  match(getOther: () => unknown, message = "Values do not match"): Validator {
    return (v) => (v !== getOther() ? message : undefined);
  },
};

// ===== 2. 单字段状态 =====

export interface FieldState<T = string> {
  value: T;
  error: string;
  touched: boolean;
  dirty: boolean;
}

export function createField<T>(initial: T, validators: Validator[] = []) {
  const state = reactive<FieldState<T>>({
    value: initial,
    error: "",
    touched: false,
    dirty: false,
  });

  function validate(): boolean {
    for (const validator of validators) {
      const err = validator(state.value);
      if (err) { state.error = err; return false; }
    }
    state.error = "";
    return true;
  }

  function touch() { state.touched = true; validate(); }
  function change(v: T) {
    state.value = v;
    state.dirty = true;
    if (state.touched) validate();
  }
  function reset() {
    state.value = initial;
    state.error = "";
    state.touched = false;
    state.dirty = false;
  }

  return { state, validate, touch, change, reset };
}

// ===== 3. 表单 composable =====

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegisterForm() {
  const form = reactive<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const errors = reactive<Partial<Record<keyof RegisterFormData, string>>>({});
  const submitting = ref(false);
  const submitted = ref(false);
  const serverError = ref("");

  function validateField(field: keyof RegisterFormData): boolean {
    const fieldValidators: Record<keyof RegisterFormData, Validator[]> = {
      name: [rules.required("Name"), rules.minLength(2, "Name"), rules.maxLength(50, "Name")],
      email: [rules.required("Email"), rules.email()],
      password: [rules.required("Password"), rules.minLength(8, "Password")],
      confirmPassword: [
        rules.required("Confirm password"),
        rules.match(() => form.password, "Passwords do not match"),
      ],
    };

    for (const validator of fieldValidators[field] ?? []) {
      const err = validator(form[field]);
      if (err) { errors[field] = err; return false; }
    }
    errors[field] = undefined;
    return true;
  }

  function validateAll(): boolean {
    const fields: (keyof RegisterFormData)[] = ["name", "email", "password", "confirmPassword"];
    return fields.map(validateField).every(Boolean);
  }

  const isValid = computed(() =>
    Object.values(errors).every((e) => !e) && Object.values(form).every(Boolean)
  );

  async function submit(onSuccess: (data: RegisterFormData) => Promise<void>): Promise<void> {
    submitted.value = true;
    if (!validateAll()) return;
    submitting.value = true;
    serverError.value = "";
    try {
      await onSuccess({ ...form });
    } catch (err) {
      serverError.value = err instanceof Error ? err.message : "Submission failed";
    } finally {
      submitting.value = false;
    }
  }

  function reset() {
    form.name = "";
    form.email = "";
    form.password = "";
    form.confirmPassword = "";
    Object.keys(errors).forEach((k) => { (errors as Record<string, undefined>)[k] = undefined; });
    submitted.value = false;
    serverError.value = "";
  }

  return { form, errors, submitting, submitted, serverError, isValid, validateField, validateAll, submit, reset };
}

// ===== 4. 动态字段数组（用于多收件人等）=====

export function useFieldArray<T>(initial: T[] = []) {
  const fields = ref<T[]>([...initial]) as ReturnType<typeof ref<T[]>>;

  function add(item: T) { (fields.value as T[]).push(item); }
  function remove(index: number) { (fields.value as T[]).splice(index, 1); }
  function update(index: number, item: T) { (fields.value as T[])[index] = item; }
  function move(from: number, to: number) {
    const arr = fields.value as T[];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
  }

  return { fields, add, remove, update, move };
}

export type { RegisterFormData as FormData };
