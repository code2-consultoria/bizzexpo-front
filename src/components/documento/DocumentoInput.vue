<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { TipoDocumento } from '@/types'

interface Props {
  modelValue: string
  tipo: TipoDocumento
  loading?: boolean
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'buscar'): void
}>()

const debounceTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const placeholder = computed(() => {
  if (props.tipo === 'cpf') {
    return '000.000.000-00'
  }
  return '00.000.000/0000-00'
})

const label = computed(() => {
  return props.tipo === 'cpf' ? 'CPF' : 'CNPJ'
})

function aplicarMascara(valor: string): string {
  const numeros = valor.replace(/\D/g, '')

  if (props.tipo === 'cpf') {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14)
  }

  return numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    .slice(0, 18)
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const valorFormatado = aplicarMascara(target.value)
  emit('update:modelValue', valorFormatado)

  // Debounce para busca automática
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  const numeros = valorFormatado.replace(/\D/g, '')
  const tamanhoEsperado = props.tipo === 'cpf' ? 11 : 14

  if (numeros.length === tamanhoEsperado) {
    debounceTimer.value = setTimeout(() => {
      emit('buscar')
    }, 500)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value)
    }
    emit('buscar')
  }
}

watch(() => props.tipo, () => {
  emit('update:modelValue', '')
})
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled || loading"
        class="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed text-lg"
        :class="{
          'border-gray-300': !error,
          'border-red-500 focus:ring-red-500': error,
        }"
        @input="handleInput"
        @keydown="handleKeyDown"
      />
      <div class="absolute inset-y-0 right-0 flex items-center pr-3">
        <svg
          v-if="loading"
          class="w-5 h-5 text-blue-500 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    <p v-else class="text-xs text-gray-500">
      Digite o {{ label }} e pressione Enter ou aguarde a busca automática
    </p>
  </div>
</template>
