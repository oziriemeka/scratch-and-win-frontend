<script lang="ts" setup>
import { useField } from "vee-validate";
import { toRef, watch } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const {
  value: fieldValue,
  errorMessage,
  handleBlur,
  setValue,
} = useField(toRef(props, "name"), undefined, {
  type: "checkbox",
  initialValue: props.modelValue,
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = target.checked;
  setValue(newValue);
  emit("update:modelValue", newValue);
};

// Sync external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== fieldValue.value) {
      setValue(newValue);
    }
  }
);
</script>

<template>
  <div class="flex items-center">
    <input
      :id="name"
      :name="name"
      :checked="fieldValue"
      type="checkbox"
      @input="handleInput"
      @blur="handleBlur"
      class="hidden"
    />
    <label :for="name" class="switch"></label>
    <span class="ml-2"><slot /></span>
  </div>
</template>

<style scoped lang="scss">
input[type="checkbox"] {
  height: 0;
  width: 0;
  visibility: hidden;
}

.switch {
  cursor: pointer;
  width: 45px;
  height: 25px;
  background: grey;
  display: block;
  border-radius: 100px;
  position: relative;
}

.switch:after {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  width: 15px;
  height: 15px;
  background: #fff;
  border-radius: 90px;
  transition: 0.3s;
}

input:checked + .switch {
  background: #bada55;
}

input:checked + .switch:after {
  left: calc(100% - 5px);
  transform: translateX(-100%);
}

.switch:active:after {
  width: 30px;
}
</style>
