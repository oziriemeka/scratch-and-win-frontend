<script setup lang="ts">
import { computed, onMounted, ref, toRef } from "vue";
import type { InputType, ValidationStatus } from "./types";
import { twMerge } from "tailwind-merge";
import { useField } from "vee-validate";
import { Eye, EyeClosed } from "lucide-vue-next";

interface InputProps {
  disabled?: boolean;
  label?: string;
  required?: boolean;
  type?: InputType;
  validationStatus?: ValidationStatus;
  wrapperClass?: string | Record<string, boolean>;
  placeholder?: string;
  name?: string;
  modelValue?: string | number;
}

defineOptions({
  inheritAttrs: true,
});

const props = withDefaults(defineProps<InputProps>(), {
  disabled: false,
  label: "",
  required: false,
  type: "text",
  validationStatus: undefined,
  wrapperClass: "",
  modelValue: "",
  placeholder: "",
  name: "name",
});

const validationWrapperClasses = computed(() =>
  twMerge(
    "mt-2 text-sm",
    props.validationStatus === "success"
      ? "text-green-600 dark:text-green-500"
      : "",
    props.validationStatus === "error" ? "text-red-600 dark:text-red-500" : "",
    errors.value && errors.value.length > 0
      ? "text-red-500 dark:text-red-500"
      : ""
  )
);

const toggleShowPassword = ref<boolean>(false);
const { value, handleChange, handleBlur, errors, validate } = useField(
  toRef(props, "name"),
  undefined,
  {
    validateOnValueUpdate: false,
  }
);

const validationListeners = {
  blur: (evt: Event | undefined) => handleBlur(evt, true),
  change: handleChange,
  input: (evt: Event | undefined) => handleChange(evt, !!errors.value),
};

onMounted(() => {
  if (props.modelValue) {
    value.value = props.modelValue;
  }
});

defineExpose({
  value,
});

const dynamicInputType = computed(() => {
  if (props.type == "password") {
    return toggleShowPassword.value ? "text" : "password";
  }
  return props.type;
});
</script>

<template>
  <div :class="props.wrapperClass">
    <label
      :for="name"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        v-bind="$attrs"
        :type="dynamicInputType"
        v-model="value"
        :name="name"
        :id="name"
        class="bg-gray-50 border placeholder:text-[14px] placeholder:font-open-sans pl-4 border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        :placeholder="placeholder"
        v-on="validationListeners"
        @blur="handleBlur"
        @change="handleChange"
      />
      <div
        @click="toggleShowPassword = !toggleShowPassword"
        v-if="props.type == 'password'"
        class="w[20px] lh-[42px] top-[14px] cursor-pointer absolute right-5 opacity-[0.3] hover:opacity-[0.7]"
      >
        <Eye v-if="!toggleShowPassword" class="w-5 h-5 text-gray-500" />
        <EyeClosed v-else class="w-5 h-5 text-gray-500" />
      </div>
    </div>

    <p v-if="$slots.validationMessage" :class="validationWrapperClasses">
      <slot name="validationMessage" />
    </p>

    <p v-if="errors && errors.length > 0" :class="validationWrapperClasses">
      {{ errors[0] }}
    </p>
  </div>
</template>
