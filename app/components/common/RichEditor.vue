<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue ?? '',
  extensions: [
    StarterKit.configure({
      link: { openOnClick: false },
    }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ],
  editorProps: {
    attributes: { class: 'outline-none min-h-[200px] px-4 py-3' },
  },
  onUpdate: ({ editor }) => emit('update:modelValue', editor.getHTML()),
})

watch(() => props.modelValue, (val) => {
  if (!editor.value || val === editor.value.getHTML()) return
  editor.value.commands.setContent(val ?? '')
})

onBeforeUnmount(() => editor.value?.destroy())

function setLink() {
  const prev = editor.value?.getAttributes('link').href ?? ''
  const url = window.prompt('URL посилання', prev)
  if (url === null) return
  if (!url) {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}
</script>

<template>
  <div class="border border-input rounded-md overflow-hidden focus-within:border-foreground/40 transition-colors">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/40">
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('bold') }" aria-label="Жирний" title="Жирний" @click="editor.chain().focus().toggleBold().run()">
        <Icon name="lucide:bold" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('italic') }" aria-label="Курсив" title="Курсив" @click="editor.chain().focus().toggleItalic().run()">
        <Icon name="lucide:italic" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('underline') }" aria-label="Підкреслення" title="Підкреслення" @click="editor.chain().focus().toggleUnderline().run()">
        <Icon name="lucide:underline" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('strike') }" aria-label="Закреслення" title="Закреслення" @click="editor.chain().focus().toggleStrike().run()">
        <Icon name="lucide:strikethrough" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div class="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

      <button type="button" class="tb-btn text-xs font-bold" :class="{ active: editor.isActive('heading', { level: 1 }) }" aria-label="Заголовок 1" title="Заголовок 1" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button type="button" class="tb-btn text-xs font-bold" :class="{ active: editor.isActive('heading', { level: 2 }) }" aria-label="Заголовок 2" title="Заголовок 2" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" class="tb-btn text-xs font-bold" :class="{ active: editor.isActive('heading', { level: 3 }) }" aria-label="Заголовок 3" title="Заголовок 3" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>

      <div class="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

      <button type="button" class="tb-btn" :class="{ active: editor.isActive('bulletList') }" aria-label="Маркований список" title="Маркований список" @click="editor.chain().focus().toggleBulletList().run()">
        <Icon name="lucide:list" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('orderedList') }" aria-label="Нумерований список" title="Нумерований список" @click="editor.chain().focus().toggleOrderedList().run()">
        <Icon name="lucide:list-ordered" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive('blockquote') }" aria-label="Цитата" title="Цитата" @click="editor.chain().focus().toggleBlockquote().run()">
        <Icon name="lucide:quote" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div class="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

      <button type="button" class="tb-btn" :class="{ active: editor.isActive({ textAlign: 'left' }) }" aria-label="По лівому краю" title="По лівому краю" @click="editor.chain().focus().setTextAlign('left').run()">
        <Icon name="lucide:align-left" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive({ textAlign: 'center' }) }" aria-label="По центру" title="По центру" @click="editor.chain().focus().setTextAlign('center').run()">
        <Icon name="lucide:align-center" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <button type="button" class="tb-btn" :class="{ active: editor.isActive({ textAlign: 'right' }) }" aria-label="По правому краю" title="По правому краю" @click="editor.chain().focus().setTextAlign('right').run()">
        <Icon name="lucide:align-right" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div class="w-px h-5 bg-border mx-0.5" aria-hidden="true" />

      <button type="button" class="tb-btn" :class="{ active: editor.isActive('link') }" aria-label="Посилання" title="Посилання" @click="setLink">
        <Icon name="lucide:link" class="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      <div class="ml-auto flex items-center gap-0.5">
        <button type="button" class="tb-btn" :disabled="!editor.can().undo()" aria-label="Скасувати" title="Скасувати" @click="editor.chain().focus().undo().run()">
          <Icon name="lucide:undo-2" class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button type="button" class="tb-btn" :disabled="!editor.can().redo()" aria-label="Повторити" title="Повторити" @click="editor.chain().focus().redo().run()">
          <Icon name="lucide:redo-2" class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>

    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.tb-btn {
  display: flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  color: hsl(var(--muted-foreground));
  transition: color 0.15s, background-color 0.15s;
  flex-shrink: 0;
}
.tb-btn:hover {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
.tb-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.tb-btn.active {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}

:deep(.tiptap) {
  outline: none;
  min-height: 200px;
  padding: 0.75rem 1rem;
}
:deep(.tiptap h1) { font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin: 0.75rem 0 0.25rem; }
:deep(.tiptap h2) { font-size: 1.25rem; font-weight: 600; line-height: 1.35; margin: 0.5rem 0 0.25rem; }
:deep(.tiptap h3) { font-size: 1.125rem; font-weight: 600; line-height: 1.4; margin: 0.5rem 0 0.25rem; }
:deep(.tiptap p) { margin: 0.25rem 0; }
:deep(.tiptap ul) { list-style-type: disc; padding-left: 1.5rem; margin: 0.375rem 0; }
:deep(.tiptap ol) { list-style-type: decimal; padding-left: 1.5rem; margin: 0.375rem 0; }
:deep(.tiptap li) { margin: 0.125rem 0; }
:deep(.tiptap blockquote) { border-left: 3px solid hsl(var(--border)); padding-left: 1rem; margin: 0.5rem 0; font-style: italic; color: hsl(var(--muted-foreground)); }
:deep(.tiptap a) { color: hsl(var(--primary)); text-decoration: underline; }
:deep(.tiptap code) { background: hsl(var(--muted)); padding: 0.1em 0.3em; border-radius: 0.25rem; font-size: 0.875em; font-family: monospace; }
:deep(.tiptap strong) { font-weight: 700; }
:deep(.tiptap em) { font-style: italic; }
:deep(.tiptap u) { text-decoration: underline; }
:deep(.tiptap s) { text-decoration: line-through; }
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
