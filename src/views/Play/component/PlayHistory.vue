<template>
  <div v-if="playLog" class="absolute right-[-290px] top-0 w-[270px] bg-white rounded-[10px]">
    <div class="p-[10px] font-luckiest-guy pt-5">Play History</div>
    <div class="h-[200px] overflow-y-auto">
      <ul>
        <li
          class="p-[10px] text-xs border-b border-b-[#f2f1f1]"
          v-for="(entry, i) in playLog"
          :key="i"
        >
          <span class="text-[#9ca0a4] pr-4">{{ entry.timestamp }}</span>
          <span :class="['msg', entry.kind]">{{ entry.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();

interface PlayLogInterface {
  timestamp: string;
  text: string;
  kind: string;
}

const props = defineProps<{
  playLog: PlayLogInterface[];
}>();
</script>
