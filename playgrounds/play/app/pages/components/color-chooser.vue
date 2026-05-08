<script setup lang="ts">
const hex = ref('#0ea5e9')
const rgb = ref('rgb(34,197,94)')
const hsl = ref('hsl(280 80% 50%)')

const presets = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
</script>

<template>
  <Navbar />

  <div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    <Showcase title="HEX 格式" :state="{ value: hex }">
      <MColorChooser v-model="hex" format="hex" />
    </Showcase>

    <Showcase title="RGB 格式" :state="{ value: rgb }">
      <MColorChooser v-model="rgb" format="rgb" />
    </Showcase>

    <Showcase title="HSL + 自定义按钮" :state="{ value: hsl }">
      <MColorChooser
        v-model="hsl"
        format="hsl"
        :button-props="{ color: 'neutral', variant: 'outline' }"
        :popover-props="{ content: { side: 'right' } }"
      />
    </Showcase>

    <Showcase title="预设颜色" description="点击右侧 button 触发 popover；自带 swatches">
      <div class="flex items-center gap-2 flex-wrap">
        <UButton
          v-for="c in presets"
          :key="c"
          :style="{ backgroundColor: c }"
          class="size-8 rounded-md ring-1 ring-default"
          @click="hex = c"
        />
        <UBadge :style="{ backgroundColor: hex, color: 'white' }">
          {{ hex }}
        </UBadge>
      </div>
    </Showcase>
  </div>
</template>
