<template>
  <button
    :class="[
      baseClasses,
      isDisabled
        ? 'opacity-60 cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-800'
        : 'cursor-pointer',
    ]"
    :disabled="isDisabled"
    :type="type"
    v-bind="$attrs"
  >
    <span v-if="!loading">
      <slot />
    </span>
    <span v-else class="inline-flex items-center gap-2">
      <span
        class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
      ></span>
      <span class="sr-only">Loading…</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { cn } from "@/lib/utils";
import { computed, useAttrs } from "vue";

type ButtonType = "button" | "submit" | "reset";

const props = withDefaults(
  defineProps<{
    class?: string;
    loading?: boolean;
    disabled?: boolean;
    type?: ButtonType;
  }>(),
  {
    loading: false,
    disabled: false,
    type: "button",
    class: "",
  }
);

defineOptions({
  inheritAttrs: true,
});

const isDisabled = computed(() => props.disabled || props.loading);
const wrapperClass =
  "text-white w-[200px] bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-3.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700";
const baseClasses = cn(wrapperClass, props.class);
</script>
