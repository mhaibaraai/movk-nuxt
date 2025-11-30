<script lang="ts" setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const props = defineProps<{
  disabled?: boolean
  readonly?: boolean
  error?: boolean
}>()

const modelValue = defineModel<string>()

const editor = useEditor({
  extensions: [StarterKit],
  content: modelValue.value,
  editable: !props.disabled && !props.readonly,
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3'
    }
  },
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    modelValue.value = html
  }
})

watch(
  () => modelValue.value,
  (value) => {
    if (value && editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value)
    }
  }
)

watch(
  [() => props.disabled, () => props.readonly],
  ([disabled, readonly]) => {
    editor.value?.setEditable(!disabled && !readonly)
  }
)

// 清理编辑器实例
onBeforeUnmount(() => {
  editor.value?.destroy()
})

const buttonClass = computed(() => {
  return 'px-2 py-1 rounded text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
})

const activeButtonClass = computed(() => {
  return 'bg-gray-300 dark:bg-gray-600'
})

const containerClass = computed(() => {
  const classes = [
    'border rounded-md overflow-hidden',
    'bg-white dark:bg-gray-950'
  ]

  if (props.error) {
    classes.push('border-red-500 dark:border-red-500')
  } else {
    classes.push('border-gray-300 dark:border-gray-700')
  }

  if (props.disabled || props.readonly) {
    classes.push('opacity-60 cursor-not-allowed')
  }

  return classes.join(' ')
})
</script>

<template>
  <UCard :class="containerClass">
    <div
      v-if="!readonly"
      class="border-b border-gray-300 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900"
    >
      <button
        type="button"
        :class="[buttonClass, editor?.isActive('bold') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <Icon name="lucide:bold" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('italic') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <Icon name="lucide:italic" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('strike') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <Icon name="lucide:strikethrough" class="w-4 h-4" />
      </button>

      <div class="w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('heading', { level: 1 }) && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <Icon name="lucide:heading-1" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('heading', { level: 2 }) && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <Icon name="lucide:heading-2" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('heading', { level: 3 }) && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <Icon name="lucide:heading-3" class="w-4 h-4" />
      </button>

      <div class="w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('bulletList') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <Icon name="lucide:list" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('orderedList') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <Icon name="lucide:list-ordered" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('blockquote') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <Icon name="lucide:quote" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="[buttonClass, editor?.isActive('codeBlock') && activeButtonClass]"
        :disabled="disabled"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        <Icon name="lucide:code" class="w-4 h-4" />
      </button>

      <div class="w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      <button
        type="button"
        :class="buttonClass"
        :disabled="disabled"
        @click="editor?.chain().focus().setHorizontalRule().run()"
      >
        <Icon name="lucide:minus" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="buttonClass"
        :disabled="disabled"
        @click="editor?.chain().focus().undo().run()"
      >
        <Icon name="lucide:undo" class="w-4 h-4" />
      </button>

      <button
        type="button"
        :class="buttonClass"
        :disabled="disabled"
        @click="editor?.chain().focus().redo().run()"
      >
        <Icon name="lucide:redo" class="w-4 h-4" />
      </button>
    </div>

    <EditorContent :editor="editor" />
  </UCard>
</template>

<style>
.ProseMirror {
  min-height: 200px;
  padding: 0.75rem;
}

.ProseMirror:focus {
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.ProseMirror h3 {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

.ProseMirror ul,
.ProseMirror ol {
  padding-left: 2em;
  margin: 1em 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1em;
  margin: 1em 0;
  color: #666;
}

.ProseMirror code {
  background-color: #f5f5f5;
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: monospace;
}

.ProseMirror pre {
  background-color: #f5f5f5;
  border-radius: 5px;
  padding: 0.75em 1em;
  overflow-x: auto;
}

.ProseMirror pre code {
  background: none;
  padding: 0;
}

.ProseMirror hr {
  border: none;
  border-top: 2px solid #ccc;
  margin: 2em 0;
}

.dark .ProseMirror blockquote {
  border-left-color: #444;
  color: #aaa;
}

.dark .ProseMirror code {
  background-color: #2d2d2d;
}

.dark .ProseMirror pre {
  background-color: #2d2d2d;
}

.dark .ProseMirror hr {
  border-top-color: #444;
}
</style>
