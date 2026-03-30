<script lang="ts" setup>
const rating = ref(1)
const ratingMax = ref(3)
const readonlyRating = ref(4)
const halfRating = ref(2.5)
</script>

<template>
  <Navbar />
  <Matrix title="星级评分组件" description="`MStarRating` 组件的基础用法，支持只读、半星等模式。">
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="基础评分" hint="5 星评分系统">
        <MStarRating v-model="rating" />
      </UFormField>

      <UFormField label="最大 10 星" hint="自定义最大评分">
        <MStarRating v-model="ratingMax" :max-rating="10" />
      </UFormField>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="只读显示" hint="用于展示评分">
        <MStarRating :model-value="readonlyRating" readonly />
      </UFormField>

      <UFormField label="半星评分" hint="支持精细评分">
        <MStarRating v-model="halfRating" allow-half />
      </UFormField>
    </div>
  </Matrix>
</template>
