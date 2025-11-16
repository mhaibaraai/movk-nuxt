<script setup lang="ts">
import { ref } from 'vue'

const rating1 = ref(0)
const rating2 = ref(3)
const rating3 = ref(4)
const rating4 = ref(5)
const rating5 = ref(0)
const rating6 = ref(0)
</script>

<template>
  <div class="min-h-screen p-8">
    <UContainer>
      <div class="space-y-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            StarRating 组件演示
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            通用的星级评分组件，支持多种配置和自定义
          </p>
        </div>

        <!-- 基础用法 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            基础用法
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  默认配置
                </p>
                <MStarRating v-model="rating1" />
                <p class="mt-2 text-xs text-gray-500">
                  当前评分: {{ rating1 }}
                </p>
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  初始值为 3 星
                </p>
                <MStarRating v-model="rating2" />
                <p class="mt-2 text-xs text-gray-500">
                  当前评分: {{ rating2 }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 自定义最大星数 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            自定义最大星数
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  10 星制
                </p>
                <MStarRating
                  v-model="rating3"
                  :max="10"
                />
                <p class="mt-2 text-xs text-gray-500">
                  当前评分: {{ rating3 }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 状态变化 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            状态变化
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  禁用状态
                </p>
                <MStarRating
                  v-model="rating4"
                  disabled
                />
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  只读状态
                </p>
                <MStarRating
                  v-model="rating4"
                  readonly
                />
              </div>
            </div>
          </UCard>
        </div>

        <!-- 自定义样式 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            自定义样式
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  不显示徽章
                </p>
                <MStarRating
                  v-model="rating5"
                  :show-badge="false"
                />
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  自定义颜色和大小
                </p>
                <MStarRating
                  v-model="rating5"
                  color="primary"
                  size="md"
                />
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  自定义图标（使用爱心）
                </p>
                <StarRating
                  v-model="rating5"
                  empty-icon="i-lucide-heart"
                  filled-icon="i-lucide-heart"
                  color="error"
                />
              </div>
            </div>
          </UCard>
        </div>

        <!-- 半星评分 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            半星评分
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  支持 0.5 增量的评分，点击星星左半部分为半星，右半部分为整星
                </p>
                <MStarRating
                  v-model="rating6"
                  allow-half
                />
                <p class="mt-2 text-xs text-gray-500">
                  当前评分: {{ rating6 }}
                </p>
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  半星 + 可清除
                </p>
                <MStarRating
                  v-model="rating6"
                  allow-half
                  clearable
                />
                <p class="mt-2 text-xs text-gray-500">
                  当前评分: {{ rating6 }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 自定义插槽 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">
            自定义插槽
          </h2>
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  前缀插槽
                </p>
                <MStarRating v-model="rating5">
                  <template #prefix>
                    <span class="text-sm text-gray-600 dark:text-gray-400 mr-2">评价:</span>
                  </template>
                </MStarRating>
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  后缀插槽
                </p>
                <MStarRating v-model="rating5">
                  <template #suffix="{ value }">
                    <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      {{ value === 5 ? '非常满意' : value >= 3 ? '满意' : value > 0 ? '一般' : '未评价' }}
                    </span>
                  </template>
                </MStarRating>
              </div>

              <div>
                <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  自定义徽章
                </p>
                <MStarRating v-model="rating5">
                  <template #badge="{ value }">
                    <UBadge
                      :label="`${value * 20}%`"
                      :color="value >= 4 ? 'success' : value >= 3 ? 'warning' : 'error'"
                      variant="solid"
                      size="xs"
                    />
                  </template>
                </MStarRating>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>
