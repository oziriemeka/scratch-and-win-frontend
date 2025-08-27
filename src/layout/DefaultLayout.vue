<script setup lang="ts">
import { useImageUrl } from "@/utils/helpers";

const { getImageUrl } = useImageUrl();
const bgImage = getImageUrl("bg-sample-2.png");
</script>

<template>
  <section
    class="bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply bg-opacity-60"
    :style="{ backgroundImage: `url('${bgImage}')` }"
  >
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen"
    >
      <slot />
    </div>
  </section>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
