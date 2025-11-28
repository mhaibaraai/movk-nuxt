<script setup lang="ts">
const rating = ref(3)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <div class="text-sm text-gray-500 mb-2">
        显示徽章
      </div>
      <MStarRating v-model="rating" :show-badge="true" />
    </div>

    <div>
      <div class="text-sm text-gray-500 mb-2">
        隐藏徽章
      </div>
      <MStarRating v-model="rating" :show-badge="false" />
    </div>
  </div>
</template>
