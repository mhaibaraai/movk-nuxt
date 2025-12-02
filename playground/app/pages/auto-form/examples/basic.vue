<script lang="ts" setup>
import { sleep } from '@movk/core'
import type { z } from 'zod/v4'

const { afz } = useAutoForm()
const toast = useToast()

const autoForm = useTemplateRef('autoForm')

const schema = afz.object({
  $personalInfo: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      fullName: afz.string({
        type: 'withClear',
        controlProps: {
          leadingIcon: 'i-lucide-user',
          placeholder: '请输入姓名'
        }
      }).min(2, '姓名至少2个字符').max(50, '姓名最多50个字符').meta({
        label: '真实姓名',
        hint: '请输入您的真实姓名',
        class: 'col-span-2'
      }).default('张三'),

      email: afz.email({
        controlProps: {
          leadingIcon: 'i-lucide-mail',
          placeholder: 'example@email.com'
        }
      }).meta({
        label: 'Email',
        hint: '用于接收通知和登录'
      }),

      phone: afz.string({
        controlProps: {
          leadingIcon: 'i-lucide-phone',
          placeholder: '手机号码'
        }
      }).regex(/^1[3-9]\d{9}$/, '请输入正确的手机号').meta({
        label: 'Phone',
        hint: '11位手机号码'
      }),

      avatar: afz.file({
        type: 'file',
        controlProps: {
          accept: 'image/*'
        }
      }).optional().meta({
        label: 'Avatar',
        hint: '上传头像图片',
        class: 'col-span-2'
      })
    }
  }),

  $account: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      password: afz.string({
        type: 'withPasswordToggle',
        controlProps: {
          leadingIcon: 'i-lucide-lock',
          placeholder: '输入密码'
        }
      }).min(8, '密码至少8个字符').max(32, '密码最多32个字符').meta({
        label: 'Password',
        hint: '8-32个字符'
      }),

      confirmPassword: afz.string({
        type: 'withPasswordToggle',
        controlProps: {
          leadingIcon: 'i-lucide-lock-keyhole',
          placeholder: '确认密码'
        }
      }).meta({
        label: 'Confirm Password',
        hint: '请再次输入密码'
      })
    }
  }),

  $preferences: afz.layout({
    class: 'grid grid-cols-2 gap-4',
    fields: {
      gender: afz.enum(['male', 'female', 'other'], {
        type: 'radioGroup',
        controlProps: {
          orientation: 'horizontal',
          items: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' },
            { label: '其他', value: 'other' }
          ]
        }
      }).optional().default('male').meta({
        label: 'Gender',
        hint: '选择性别',
        class: 'col-span-2'
      }),

      interests: afz.array(afz.string(), {
        type: 'checkboxGroup',
        controlProps: {
          orientation: 'horizontal',
          items: [
            { label: '编程', value: 'coding' },
            { label: '设计', value: 'design' },
            { label: '音乐', value: 'music' },
            { label: '运动', value: 'sports' },
            { label: '阅读', value: 'reading' }
          ]
        }
      }).optional().default(['coding']).meta({
        label: 'Interests',
        hint: '选择您的兴趣爱好(可多选)',
        class: 'col-span-2'
      }),

      country: afz.enum([], {
        type: 'selectMenu',
        controlProps: {
          leadingIcon: 'i-lucide-map-pin',
          placeholder: '请选择国家',
          valueKey: 'value',
          items: [
            { label: '中国', value: 'cn' },
            { label: '美国', value: 'us' },
            { label: '日本', value: 'jp' },
            { label: '英国', value: 'uk' },
            { label: '其他', value: 'other' }
          ]
        }
      }).default('cn').meta({
        label: 'Country',
        hint: '选择所在国家或地区'
      }),

      birthday: afz.calendarDate({ type: 'datePicker' }).optional().meta({
        label: 'Birthday',
        hint: '选择您的出生日期'
      })
    }
  }),

  skills: afz.array(afz.string(), {
    type: 'inputTags'
  }).optional().default(['篮球', '羽毛球🏸']).meta({
    label: 'Skills',
    hint: '输入您的技能标签'
  }),

  experience: afz.array(
    afz.object({
      company: afz.string({
        controlProps: {
          placeholder: '公司名称'
        }
      }).min(1).meta({ label: '公司' }),
      position: afz.string({
        controlProps: {
          placeholder: '职位'
        }
      }).min(1).meta({ label: '职位' }),
      years: afz.number({
        controlProps: {
          placeholder: '工作年限'
        }
      }).int().min(0).max(50).meta({ label: '年限', hint: '工作年数' })
    }).meta({ label: '工作经历' })
  ).optional().default([{
    company: '示例公司',
    position: '软件工程师',
    years: 3
  }]),

  attachments: afz.array(afz.file(), {
    type: 'file',
    controlProps: {
      multiple: true,
      layout: 'list'
    }
  }).optional().meta({
    label: 'Attachments',
    hint: '上传附件文件(支持多个)'
  }),

  bio: afz.string({
    type: 'textarea',
    controlProps: {
      placeholder: '介绍一下自己...',
      rows: 4
    }
  }).max(500, '个人简介最多500字').optional().default('').meta({
    label: 'Bio',
    hint: '简单介绍一下您自己(最多500字)'
  }),

  acceptTerms: afz.boolean({
    controlProps: {
      label: '我已阅读并同意服务条款和隐私政策',
      required: true
    }
  }).meta({
    label: 'Accept Terms'
  })
}).refine(
  data => data.password === data.confirmPassword,
  { message: '两次密码输入不一致', path: ['confirmPassword'] }
).refine(
  data => data.acceptTerms === true,
  { message: '必须同意服务条款', path: ['acceptTerms'] }
)

type Schema = z.output<typeof schema>

const form = ref<Partial<Schema>>({})

async function handleSubmit() {
  await sleep(2000)
  toast.add({
    title: '提交成功',
    color: 'success',
    description: '表单数据已提交'
  })
  console.log('表单数据:', form.value)
}

function handleReset() {
  autoForm.value?.reset()
  toast.add({
    title: '已重置',
    color: 'neutral',
    description: '表单已重置为初始状态'
  })
}

function handleClear() {
  autoForm.value?.clear()
  toast.add({
    title: '已清空',
    color: 'neutral',
    description: '表单已清空'
  })
}
</script>

<template>
  <Navbar />
  <Matrix
    :form="form"
    title="完整基础示例"
    description="一个综合性的表单示例，展示了 AutoForm 的各种核心功能，包括文本输入、邮箱、密码、单选、多选、下拉选择、日期选择、文件上传(头像/附件)、标签输入、文本域、对象数组等控件，以及字段验证、布局分组、可选字段等特性。"
    class="w-[50vw]"
  >
    <MAutoForm
      ref="autoForm"
      :schema="schema"
      :state="form"
      :global-meta="{
        collapsible: { defaultOpen: true }
      }"
      @submit="handleSubmit"
    >
      <template #submit="{ loading }">
        <div class="flex gap-3">
          <UButton
            type="button"
            variant="outline"
            color="neutral"
            size="lg"
            icon="i-lucide-rotate-ccw"
            @click="handleReset()"
          >
            重置
          </UButton>

          <UButton
            type="button"
            variant="outline"
            color="neutral"
            size="lg"
            icon="i-lucide-eraser"
            @click="handleClear()"
          >
            清空
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
            color="primary"
            size="lg"
            icon="i-lucide-circle-check"
          >
            提交
          </UButton>
        </div>
      </template>
    </MAutoForm>
  </Matrix>
</template>
