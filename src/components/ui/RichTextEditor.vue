<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import EditorJS, { type OutputData, type OutputBlockData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import InlineCode from '@editorjs/inline-code'
import DOMPurify from 'dompurify'

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
let lastEmittedValue = ''

// Tipos de bloco permitidos
const ALLOWED_BLOCK_TYPES = ['paragraph', 'header', 'list', 'quote', 'delimiter']

// Configuracao do DOMPurify para sanitizar texto inline
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'a', 'code', 'br'],
  ALLOWED_ATTR: ['href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
}

// Sanitiza texto usando DOMPurify
function sanitizeText(text: string): string {
  if (!text) return ''
  return DOMPurify.sanitize(text, purifyConfig)
}

// Sanitiza um bloco do Editor.js
function sanitizeBlock(block: OutputBlockData): OutputBlockData | null {
  // Verifica se o tipo de bloco e permitido
  if (!ALLOWED_BLOCK_TYPES.includes(block.type)) {
    return null
  }

  const sanitizedBlock = { ...block, data: { ...block.data } }

  switch (block.type) {
    case 'paragraph':
    case 'header':
      sanitizedBlock.data.text = sanitizeText(block.data.text as string)
      break
    case 'list':
      if (Array.isArray(block.data.items)) {
        sanitizedBlock.data.items = block.data.items.map((item: string) => sanitizeText(item))
      }
      break
    case 'quote':
      sanitizedBlock.data.text = sanitizeText(block.data.text as string)
      if (block.data.caption) {
        sanitizedBlock.data.caption = sanitizeText(block.data.caption as string)
      }
      break
    case 'delimiter':
      // Delimitador nao tem texto
      break
  }

  return sanitizedBlock
}

// Sanitiza todos os blocos do Editor.js
function sanitizeEditorData(data: OutputData): OutputData {
  const sanitizedBlocks = data.blocks
    .map(sanitizeBlock)
    .filter((block): block is OutputBlockData => block !== null)

  return {
    ...data,
    blocks: sanitizedBlocks,
  }
}

// Extrai apenas os blocos para comparacao (ignora time, version, ids)
function extractBlocksForComparison(content: string): string {
  if (!content) return ''
  try {
    const parsed = JSON.parse(content) as OutputData
    if (!parsed.blocks) return ''
    // Extrai apenas type e data de cada bloco, ignorando id
    const blocksOnly = parsed.blocks.map((block) => ({
      type: block.type,
      data: block.data,
    }))
    return JSON.stringify(blocksOnly)
  } catch {
    return content
  }
}

// Compara dois conteudos ignorando timestamps e ids
function areContentsEqual(content1: string, content2: string): boolean {
  return extractBlocksForComparison(content1) === extractBlocksForComparison(content2)
}

// Converte string JSON ou texto simples para dados do Editor.js
function parseContent(content: string): OutputData {
  if (!content) {
    return { time: Date.now(), blocks: [], version: '2.28.0' }
  }

  try {
    const parsed = JSON.parse(content) as OutputData
    if (parsed.blocks) {
      return sanitizeEditorData(parsed)
    }
    // Se for JSON mas sem blocks, trata como texto
    return {
      time: Date.now(),
      blocks: [{ id: crypto.randomUUID(), type: 'paragraph', data: { text: sanitizeText(content) } }],
      version: '2.28.0',
    }
  } catch {
    // Se nao for JSON, trata como texto simples
    if (content.trim()) {
      return {
        time: Date.now(),
        blocks: [{ id: crypto.randomUUID(), type: 'paragraph', data: { text: sanitizeText(content) } }],
        version: '2.28.0',
      }
    }
    return { time: Date.now(), blocks: [], version: '2.28.0' }
  }
}

// Converte dados do Editor.js para string JSON sanitizada
async function serializeContent(): Promise<string> {
  if (!editor) return ''

  try {
    const data = await editor.save()
    if (!data.blocks || data.blocks.length === 0) {
      return ''
    }
    // Sanitiza antes de serializar
    const sanitizedData = sanitizeEditorData(data)
    return JSON.stringify(sanitizedData)
  } catch {
    return ''
  }
}

async function initEditor() {
  if (!editorContainer.value || editor) return

  const initialData = parseContent(props.modelValue)
  lastEmittedValue = props.modelValue

  editor = new EditorJS({
    holder: editorContainer.value,
    placeholder: props.placeholder,
    minHeight: props.minHeight,
    data: initialData,
    tools: {
      header: {
        class: Header as unknown as EditorJS.BlockToolConstructable,
        config: {
          levels: [2, 3, 4],
          defaultLevel: 2,
        },
        inlineToolbar: true,
      },
      list: {
        class: List as unknown as EditorJS.BlockToolConstructable,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
      paragraph: {
        class: Paragraph as unknown as EditorJS.BlockToolConstructable,
        inlineToolbar: true,
      },
      quote: {
        class: Quote as unknown as EditorJS.BlockToolConstructable,
        inlineToolbar: true,
        config: {
          quotePlaceholder: 'Digite a citação',
          captionPlaceholder: 'Autor da citação',
        },
      },
      delimiter: Delimiter as unknown as EditorJS.BlockToolConstructable,
      inlineCode: {
        class: InlineCode as unknown as EditorJS.InlineToolConstructable,
      },
    },
    onChange: async () => {
      if (isInternalChange) return
      const content = await serializeContent()
      lastEmittedValue = content
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

    // Se o novo valor e igual ao que acabamos de emitir, ignora
    if (newValue === lastEmittedValue) return

    // Compara conteudo ignorando timestamps e ids
    if (areContentsEqual(newValue, lastEmittedValue)) return

    isInternalChange = true
    try {
      const data = parseContent(newValue)
      await editor.render(data)
      lastEmittedValue = newValue
    } finally {
      isInternalChange = false
    }
  },
  { flush: 'post' }
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
