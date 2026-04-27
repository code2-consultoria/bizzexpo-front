<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '@/services/api'

interface Props {
  modelValue?: string
  label?: string
  accept?: string
  maxSize?: number // em MB
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Imagem',
  accept: 'image/jpeg,image/png,image/webp',
  maxSize: 2,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const dragover = ref(false)

const previewUrl = computed(() => {
  if (!props.modelValue) return null
  // Se for URL completa ou Data URI, usa direto
  if (props.modelValue.startsWith('http') || props.modelValue.startsWith('data:')) {
    return props.modelValue
  }
  // Se for path relativo, monta URL do storage
  // Remove /api do final se existir, pois storage fica na raiz
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || ''
  return `${baseUrl}/storage/${props.modelValue}`
})

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    await uploadFile(input.files[0])
  }
}

async function handleDrop(event: DragEvent) {
  dragover.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await uploadFile(event.dataTransfer.files[0])
  }
}

async function uploadFile(file: File) {
  error.value = null

  // Valida tipo
  const allowedTypes = props.accept.split(',').map((t) => t.trim())
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Tipo de arquivo não permitido'
    return
  }

  // Valida tamanho
  const maxBytes = props.maxSize * 1024 * 1024
  if (file.size > maxBytes) {
    error.value = `Arquivo muito grande (máximo ${props.maxSize}MB)`
    return
  }

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    emit('update:modelValue', response.data.path)
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erro ao fazer upload'
  } finally {
    loading.value = false
  }
}

function removeImage() {
  emit('update:modelValue', undefined)
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">{{ label }}</label>

    <!-- Preview da imagem -->
    <div v-if="previewUrl" class="relative inline-block">
      <img :src="previewUrl" alt="Preview" class="h-32 w-32 rounded-lg object-cover" />
      <button
        type="button"
        @click="removeImage"
        class="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Upload area -->
    <div
      v-else
      class="relative rounded-lg border-2 border-dashed p-6 text-center transition-colors"
      :class="{
        'border-gray-300 hover:border-gray-400': !dragover && !error,
        'border-primary bg-primary/5': dragover,
        'border-red-300': error,
      }"
      @dragover.prevent="dragover = true"
      @dragleave.prevent="dragover = false"
      @drop.prevent="handleDrop"
    >
      <input
        type="file"
        :accept="accept"
        class="absolute inset-0 cursor-pointer opacity-0"
        @change="handleFileSelect"
        :disabled="loading"
      />

      <div v-if="loading" class="flex flex-col items-center">
        <svg class="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-500">Enviando...</p>
      </div>

      <div v-else class="flex flex-col items-center">
        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p class="mt-2 text-sm text-gray-600">
          <span class="text-primary font-medium">Clique para enviar</span> ou arraste uma imagem
        </p>
        <p class="mt-1 text-xs text-gray-500">PNG, JPG ou WebP (máx. {{ maxSize }}MB)</p>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>
