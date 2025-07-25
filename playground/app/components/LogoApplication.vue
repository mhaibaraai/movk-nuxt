<script lang="ts" setup>
import { title } from '~/constants'
</script>

<template>
  <div class="absolute left-0 top-0 z-10 flex">
    <div class="ml-4 mt-4 flex flex-1 items-center">
      <NuxtImg
        src="/logo.svg"
        :alt="title"
        class="mr-2"
        width="42"
        draggable="false"
      />
      <p class="text-xl font-medium m-0">
        {{ title }}
      </p>
    </div>
  </div>
</template>
