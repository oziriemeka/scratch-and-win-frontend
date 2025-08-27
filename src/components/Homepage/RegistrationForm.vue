<script setup lang="ts">
import { ref } from "vue";
import InputButton from "@/components/Utility/InputButton/index.vue";
import CheckBox from "@/components/Utility/CheckBox/index.vue";
import InputField from "@/components/Utility/InputField/index.vue";
import { UserService } from "@/services/user.service";
import { Form } from "vee-validate";
import { useRouter } from "vue-router";
import { boolean, object, string } from "yup";
import { useAuthStore } from "@/store/useAuthStore";

interface FormData {
  name: string;
  email: string;
  password: string;
  consent: boolean;
}

const formData = ref<FormData>({
  name: "",
  email: "",
  password: "",
  consent: false,
});

const loadingRequest = ref<boolean>(false);
const router = useRouter();

const schema = object({
  name: string().required("This field is required"),
  email: string()
    .email("Please enter a valid email address")
    .required("This field is required"),
  password: string().required("This field is required"),
  consent: boolean()
    .oneOf([true], "You must consent to proceed")
    .required("You must consent to proceed"),
});

interface RegisterInterface {
  name: string;
  email: string;
  password: string;
  consent: boolean;
}

const handleSubmit = async (formInput: FormData, event: any) => {
  loadingRequest.value = true;

  try {
    await UserService.getCsrf();
    const response = await UserService.register(formInput);

    const auth = useAuthStore();
    auth.setUserName(response.data.name);
    auth.setisAuthenticated(true);
    router.push({ name: "start" });

  } catch (errors) {
    loadingRequest.value = false;

    const error = errors.response.data.errors;

    if (errors.response !== undefined) {
      Object.entries(error).forEach(([key, item]) => {
        event.setFieldError(key, item);
      });
    }
  }
};
</script>

<template>
  <Form
    :validation-schema="schema"
    class="space-y-4 md:space-y-6"
    @submit="handleSubmit"
    v-slot="{ meta }"
  >
    <div>
      <InputField
        class="mb-3"
        type="text"
        label="Your name"
        placeholder="John Doe"
        v-model="formData.name"
        name="name"
      />
      <InputField
        class="mb-3"
        type="email"
        label="Your email"
        placeholder="johndoe@gmail.com"
        v-model="formData.email"
        name="email"
      />
      <InputField
        class="mb-3"
        type="password"
        label="Your password"
        placeholder="Enter your password"
        v-model="formData.password"
        name="password"
      />
    </div>

    <div class="flex items-start">
      <div class="flex items-center h-5">
        <CheckBox
          name="consent"
          id="remember"
          class="rounded-full"
          v-model="formData.consent"
        >
          I consent i am over 18 years old
        </CheckBox>
      </div>
    </div>
    <div class="mt-8 mx-auto text-center">
      <InputButton
        :disabled="!meta.valid"
        type="submit"
        :loading="loadingRequest"
      >
        Get started
      </InputButton>

      <div class="mt-2 font-open-sans">
        <p class="text-sm font-light text-gray-500 dark:text-gray-400">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-gray-800 hover:underline dark:text-white"
            >Login here</router-link
          >
        </p>
      </div>
    </div>
  </Form>
</template>
