<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import InlineCode from '@editorjs/inline-code'

interface Props {
  modelValue: string
  placeholder?: string
  error?: string
  minHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Comece a escrever...',
  minHeight: 200,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: EditorJS | null = null
let isInternalChange = false

// Converte string JSON ou texto simples para dados do Editor.js
function parseContent(content: string): object {
  if (!content) {
    return { blocks: [] }
  }

  try {
    const parsed = JSON.parse(content)
    if (parsed.blocks) {
      return parsed
    }
    // Se for JSON mas sem blocks, trata como texto
    return {
      blocks: [{ type: 'paragraph', data: { text: content } }],
    }
  } catch {
    // Se nao for JSON, trata como texto simples
    if (content.trim()) {
      return {
        blocks: [{ type: 'paragraph', data: { text: content } }],
      }
    }
    return { blocks: [] }
  }
}

// Converte dados do Editor.js para string JSON
async function serializeContent(): Promise<string> {
  if (!editor) return ''

  try {
    const data = await editor.save()
    if (!data.blocks || data.blocks.length === 0) {
      return ''
    }
    return JSON.stringify(data)
  } catch {
    return ''
  }
}

async function initEditor() {
  if (!editorContainer.value || editor) return

  const initialData = parseContent(props.modelValue)

  editor = new EditorJS({
    holder: editorContainer.value,
    placeholder: props.placeholder,
    minHeight: props.minHeight,
    data: initialData as any,
    tools: {
      header: {
        class: Header as any,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
        inlineToolbar: true,
      },
      list: {
        class: List as any,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
      paragraph: {
        class: Paragraph as any,
        inlineToolbar: true,
      },
      quote: {
        class: Quote as any,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Digite a citação',
          captionPlaceholder: 'Autor da citação',
        },
      },
      delimiter: Delimiter,
      inlineCode: {
        class: InlineCode as any,
      },
    },
    onChange: async () => {
      if (isInternalChange) return
      const content = await serializeContent()
      emit('update:modelValue', content)
    },
  })

  await editor.isReady
}

// Atualiza o editor quando o modelValue muda externamente
watch(
  () => props.modelValue,
  async (newValue) => {
    if (!editor) return

    // Evita loop infinito
    const currentContent = await serializeContent()
    if (currentContent === newValue) return

    isInternalChange = true
    try {
      const data = parseContent(newValue)
      await editor.render(data as any)
    } finally {
      isInternalChange = false
    }
  }
)

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.destroy()
    editor = null
  }
})
</script>

<template>
  <div
    class="rich-text-editor rounded-lg border transition-colors"
    :class="{
      'border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20': !error,
      'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20': error,
    }"
  >
    <div ref="editorContainer" class="editor-container" />
  </div>
</template>

<style>
.rich-text-editor {
  background: white;
}

.editor-container {
  padding: 0.5rem 0;
}

/* Estilos do Editor.js */
.codex-editor {
  font-family: inherit;
}

.codex-editor__redactor {
  padding-bottom: 1rem !important;
}

.ce-block__content {
  max-width: 100%;
  margin: 0 1rem;
}

.ce-toolbar__content {
  max-width: 100%;
  margin: 0 1rem;
}

.ce-toolbar__plus,
.ce-toolbar__settings-btn {
  color: #6b7280;
}

.ce-toolbar__plus:hover,
.ce-toolbar__settings-btn:hover {
  background-color: #f3f4f6;
}

.ce-block--selected .ce-block__content {
  background-color: #f0fdf9;
}

.ce-paragraph {
  font-size: 1rem;
  line-height: 1.625;
}

.ce-header {
  font-weight: 700;
  padding: 0.5em 0;
}

h2.ce-header {
  font-size: 1.5rem;
}

h3.ce-header {
  font-size: 1.25rem;
}

h4.ce-header {
  font-size: 1.125rem;
}

.cdx-list {
  padding-left: 1.5rem;
}

.cdx-list__item {
  padding: 0.25rem 0;
}

.cdx-quote {
  border-left: 3px solid #006b44;
  padding-left: 1rem;
  font-style: italic;
}

.cdx-quote__caption {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.ce-delimiter {
  text-align: center;
  padding: 1rem 0;
}

.ce-delimiter::before {
  content: '***';
  color: #9ca3af;
  letter-spacing: 0.5em;
}

.cdx-inline-code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}

/* Toolbar inline */
.ce-inline-toolbar {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.ce-inline-tool {
  color: #374151;
}

.ce-inline-tool:hover {
  background-color: #f3f4f6;
}

.ce-inline-tool--active {
  color: #006b44;
}

/* Conversion toolbar */
.ce-conversion-toolbar {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.ce-conversion-tool:hover {
  background-color: #f3f4f6;
}

/* Settings */
.ce-settings {
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.ce-settings__button:hover {
  background-color: #f3f4f6;
}

/* Placeholder */
.ce-paragraph[data-placeholder]:empty::before {
  color: #9ca3af;
}
</style>
