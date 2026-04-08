<script lang="ts" setup>
const { searchSchema } = useUserList()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="">
      <MSearchForm :cols="5" :schema="searchSchema" :global-meta="{ label: '', required: false }" />
    </div>
  </div>
</template>
