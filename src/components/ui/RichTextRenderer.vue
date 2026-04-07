<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string
  class?: string
}

const props = defineProps<Props>()

interface EditorBlock {
  type: string
  data: Record<string, unknown>
}

interface EditorData {
  blocks: EditorBlock[]
}

// Tenta parsear o conteudo como JSON do Editor.js
const parsedContent = computed(() => {
  if (!props.content) return null

  try {
    const data = JSON.parse(props.content) as EditorData
    if (data.blocks && Array.isArray(data.blocks)) {
      return data
    }
    return null
  } catch {
    // Nao e JSON, retorna null para renderizar como texto simples
    return null
  }
})

// Verifica se e conteudo do Editor.js
const isEditorContent = computed(() => parsedContent.value !== null)

// Renderiza texto com formatacao inline
function renderInlineFormatting(text: string): string {
  if (!text) return ''

  // Escapa HTML primeiro
  let result = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Inline code (backticks)
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Bold (**text** ou <b>text</b>)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/&lt;b&gt;([^&]+)&lt;\/b&gt;/g, '<strong>$1</strong>')

  // Italic (*text* ou <i>text</i>)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  result = result.replace(/&lt;i&gt;([^&]+)&lt;\/i&gt;/g, '<em>$1</em>')

  // Links
  result = result.replace(
    /&lt;a href="([^"]+)"&gt;([^&]+)&lt;\/a&gt;/g,
    '<a href="$1" class="text-primary hover:underline" target="_blank" rel="noopener">$2</a>'
  )

  return result
}
</script>

<template>
  <div :class="['rich-text-renderer', props.class]">
    <!-- Conteudo do Editor.js -->
    <template v-if="isEditorContent && parsedContent">
      <template v-for="(block, index) in parsedContent.blocks" :key="index">
        <!-- Paragrafo -->
        <p
          v-if="block.type === 'paragraph'"
          class="mb-4 last:mb-0"
          v-html="renderInlineFormatting(block.data.text as string)"
        />

        <!-- Header -->
        <component
          :is="`h${block.data.level || 2}`"
          v-else-if="block.type === 'header'"
          class="font-bold mb-3"
          :class="{
            'text-2xl': block.data.level === 2,
            'text-xl': block.data.level === 3,
            'text-lg': block.data.level === 4,
          }"
          v-html="renderInlineFormatting(block.data.text as string)"
        />

        <!-- Lista -->
        <component
          :is="block.data.style === 'ordered' ? 'ol' : 'ul'"
          v-else-if="block.type === 'list'"
          class="mb-4 last:mb-0 pl-6"
          :class="{
            'list-disc': block.data.style !== 'ordered',
            'list-decimal': block.data.style === 'ordered',
          }"
        >
          <li
            v-for="(item, itemIndex) in (block.data.items as string[])"
            :key="itemIndex"
            class="mb-1 last:mb-0"
            v-html="renderInlineFormatting(item)"
          />
        </component>

        <!-- Citacao -->
        <blockquote
          v-else-if="block.type === 'quote'"
          class="mb-4 last:mb-0 border-l-4 border-primary pl-4 italic"
        >
          <p v-html="renderInlineFormatting(block.data.text as string)" />
          <cite v-if="block.data.caption" class="block mt-2 text-sm text-gray-500 not-italic">
            — {{ block.data.caption }}
          </cite>
        </blockquote>

        <!-- Delimitador -->
        <hr v-else-if="block.type === 'delimiter'" class="my-6 border-gray-200" />

        <!-- Fallback para tipos desconhecidos -->
        <p v-else class="mb-4 last:mb-0 text-gray-600">
          {{ block.data.text || '' }}
        </p>
      </template>
    </template>

    <!-- Texto simples (fallback) -->
    <p v-else class="whitespace-pre-wrap">{{ content }}</p>
  </div>
</template>

<style scoped>
.rich-text-renderer :deep(.inline-code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}
</style>
