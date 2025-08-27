<script setup lang="ts">

import DefaultLayout from "@/layout/DefaultLayout.vue";
import HomeHeader from "@/components/Homepage/HomeHeader.vue";
import RegistrationForm from "@/components/Homepage/RegistrationForm.vue";
</script>

<template>
  <DefaultLayout>
    <div
      class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800"
    >
      <div class="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
        <HomeHeader />
        <RegistrationForm />
      </div>
    </div>
  </DefaultLayout>
</template>
