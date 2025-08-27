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
  email: string;
  password: string;
  consent: boolean;
}

const formData = ref<FormData>({
  email: "",
  password: "",
  consent: false,
});

const loadingRequest = ref<boolean>(false);
const router = useRouter();

const schema = object({
  email: string()
    .email("Please enter a valid email address")
    .required("This field is required"),
  password: string().required("This field is required"),
  consent: boolean()
    .oneOf([true], "You must consent to proceed")
    .required("You must consent to proceed"),
});

interface RegisterInterface {
  email: string;
  password: string;
}

const handleSubmit = async (loginInput: FormData, event: any) => {
  loadingRequest.value = true;

  try {
    await UserService.getCsrf();
    const response = await UserService.login(loginInput);

    const auth = useAuthStore();
    auth.setUserName(response.data.name);
    auth.setisAuthenticated(true);
    
    router.push({ name: "start" });
  } catch (errors) {
    loadingRequest.value = false;

    const error = errors.response.data.errors;

    if (errors.response !== undefined) {
      Object.entries(error).forEach(([key, item]) => {
        if(Object.keys(formData.value).includes(key)) {
          event.setFieldError(key, item);
        }  else {
          event.setFieldError("email", item);
        }
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
        <p class="text-sm font-light text-gray-500 dark:text-gray-400">
        Dont have an account ?
        <router-link
          to="/"
          class="font-medium text-gray-800 hover:underline dark:text-white"
          >Register here</router-link
        >
      </p>
    </div>
  </Form>
</template>
