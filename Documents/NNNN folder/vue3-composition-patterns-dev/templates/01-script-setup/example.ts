// Vue 3 <script setup> 模式 — defineProps、defineEmits、defineExpose、useAttrs、useSlots
// 注意：此文件包含 Vue SFC <script setup> 的 TypeScript 模式，可独立运行演示

import {
  computed,
  defineComponent,
  ref,
  useAttrs,
  useSlots,
  type PropType,
} from "vue";

// ===== 1. defineProps — 类型安全的 props 声明 =====

export interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

// <script setup> 用法（在 .vue 文件中）：
// const props = defineProps<ButtonProps>()
// const props = withDefaults(defineProps<ButtonProps>(), { variant: 'primary', size: 'md' })

// defineComponent 等效（可在 .ts 文件中运行）：
export const ButtonComponent = defineComponent({
  props: {
    label: { type: String as PropType<string>, required: true },
    variant: {
      type: String as PropType<ButtonProps["variant"]>,
      default: "primary",
    },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    size: { type: String as PropType<ButtonProps["size"]>, default: "md" },
  },
  setup(props) {
    const classes = computed(() => [
      `btn-${props.variant}`,
      `btn-${props.size}`,
      { "btn-disabled": props.disabled || props.loading },
    ]);

    return { classes };
  },
});

// ===== 2. defineEmits — 类型安全的事件声明 =====

export interface ModalEmits {
  (e: "open"): void;
  (e: "close", reason: "backdrop" | "esc" | "button"): void;
  (e: "confirm", value: string): void;
}

// <script setup> 中：
// const emit = defineEmits<ModalEmits>()
// emit('close', 'esc')

export const ModalComponent = defineComponent({
  emits: {
    open: null,
    close: (_reason: "backdrop" | "esc" | "button") => true,
    confirm: (_value: string) => true,
  },
  setup(_props, { emit }) {
    const isOpen = ref(false);
    const inputValue = ref("");

    function open() {
      isOpen.value = true;
      emit("open");
    }

    function close(reason: "backdrop" | "esc" | "button" = "button") {
      isOpen.value = false;
      emit("close", reason);
    }

    function confirm() {
      emit("confirm", inputValue.value);
      close("button");
    }

    return { isOpen, inputValue, open, close, confirm };
  },
});

// ===== 3. defineExpose — 暴露给父组件的 API =====

// <script setup> 中：
// defineExpose({ focus, reset, validate })

export interface InputExposed {
  focus(): void;
  reset(): void;
  validate(): boolean;
}

export const InputComponent = defineComponent({
  setup() {
    const value = ref("");
    const error = ref("");

    function focus() {
      // 实际中：inputRef.value?.focus()
      console.log("Input focused");
    }

    function reset() {
      value.value = "";
      error.value = "";
    }

    function validate(): boolean {
      if (!value.value.trim()) {
        error.value = "Field is required";
        return false;
      }
      error.value = "";
      return true;
    }

    // 暴露给父组件
    return { value, error, focus, reset, validate };
  },
});

// ===== 4. useAttrs & useSlots =====

export const TransparentWrapper = defineComponent({
  inheritAttrs: false, // 禁止自动透传
  setup() {
    const attrs = useAttrs();
    const slots = useSlots();

    const hasDefaultSlot = computed(() => !!slots.default);
    const hasHeaderSlot = computed(() => !!slots.header);

    // 过滤掉 class/style，其余透传
    const passthrough = computed(() => {
      const { class: _cls, style: _sty, ...rest } = attrs;
      return rest;
    });

    return { attrs, hasDefaultSlot, hasHeaderSlot, passthrough };
  },
});

// ===== 5. 响应式 computed + watch 模式 =====

export function useCounter(initial = 0) {
  const count = ref(initial);
  const doubled = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);

  function increment(by = 1) { count.value += by; }
  function decrement(by = 1) { count.value -= by; }
  function reset() { count.value = initial; }

  return { count, doubled, isEven, increment, decrement, reset };
}

// ===== 6. v-model 双向绑定模式 =====

export interface CheckboxProps {
  modelValue: boolean;
  label?: string;
}

// <script setup> 中：
// const props = defineProps<CheckboxProps>()
// const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
// const checked = computed({
//   get: () => props.modelValue,
//   set: (v) => emit('update:modelValue', v)
// })

export function createModelBinding<T>(
  getValue: () => T,
  setValue: (v: T) => void
) {
  return computed<T>({
    get: getValue,
    set: setValue,
  });
}

export type { PropType };
