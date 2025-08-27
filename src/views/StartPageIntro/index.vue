<script setup lang="ts">
import DefaultLayout from "@/layout/DefaultLayout.vue";
import InputButton from "@/components/Utility/InputButton/index.vue";
import { ref } from "vue";
import { UserService } from "@/services/user.service";
import { useRouter } from "vue-router";
import { LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/store/useAuthStore";

const loadingRequest = ref<boolean>(false);
const loading = ref<boolean>(false);
const router = useRouter();

const startGame = async (input: FormData, event: any) => {
  loadingRequest.value = true;

  try {
    const response = await UserService.start();
    router.push({ name: "play", params: { id: response.hash } });
  } catch (errors) {
  } finally {
    loadingRequest.value = false;
  }
};

const handleLogout = async () => {
  loading.value = true;

  try {
    await UserService.logout();
    const AuthStore = useAuthStore();
    AuthStore.logoutUser();
    window.location.href = "/";
  } catch (errors) {
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <DefaultLayout>
    <div
      class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-2 dark:bg-gray-800"
    >
      <div class="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
        <h1
          class="text-xl font-luckiest-guy font-normal leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white"
        >
          Scratch and Win
        </h1>
        <div class="leading-[1.5]">
          <p>
            Every card hides a mystery prize just waiting to be uncovered.
            Simply scratch away the panels to reveal what's underneath.
          </p>
          <p class="mt-4">
            Each one could unlock a different reward. The thrill is in the
            reveal!
          </p>
          <p class="mt-4">
            Will your card uncover something small, something big, or a little
            bit of everything? There's only one way to find out… start
            scratching and let the excitement unfold!
          </p>
        </div>
      </div>

      <div class="p-6">
        <InputButton
          :loading="loadingRequest"
          :disabled="loadingRequest"
          @click="startGame"
          class="w-full mt-4"
          >Start Game</InputButton
        >

        <InputButton
          :loading="loading"
          :disabled="loading"
          class="bg-[red] w-full mt-4 hover:bg-red-700"
          @click="handleLogout()"
        >
          <span class="flex items-center justify-center gap-2">
            <span>
              <LogOut class="w-5 h-5 text-white" />
            </span>
            <span>Logout</span>
          </span>
        </InputButton>
      </div>
    </div>
  </DefaultLayout>
</template>
