<script setup lang="ts">
import type { TipoDocumento } from '@/types'

interface Props {
  modelValue: TipoDocumento | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TipoDocumento): void
}>()

function selecionar(tipo: TipoDocumento) {
  if (!props.disabled) {
    emit('update:modelValue', tipo)
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-gray-600">Selecione o tipo de documento do expositor:</p>

    <div class="grid grid-cols-2 gap-4">
      <button
        type="button"
        :disabled="disabled"
        :class="[
          'flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all',
          modelValue === 'cpf'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        ]"
        @click="selecionar('cpf')"
      >
        <svg
          class="w-8 h-8 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="font-medium">CPF</span>
        <span class="text-xs mt-1 text-gray-500">Pessoa Física</span>
      </button>

      <button
        type="button"
        :disabled="disabled"
        :class="[
          'flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all',
          modelValue === 'cnpj'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-600',
          disabled && 'opacity-50 cursor-not-allowed'
        ]"
        @click="selecionar('cnpj')"
      >
        <svg
          class="w-8 h-8 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <span class="font-medium">CNPJ</span>
        <span class="text-xs mt-1 text-gray-500">Pessoa Jurídica</span>
      </button>
    </div>
  </div>
</template>
