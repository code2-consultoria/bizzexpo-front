<script setup lang="ts">
import type { MetodoPagamento } from '@/types'

const props = defineProps<{
  modelValue: MetodoPagamento
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MetodoPagamento): void
}>()

interface MetodoOpcao {
  value: MetodoPagamento
  label: string
  descricao: string
  icon: string
}

const metodos: MetodoOpcao[] = [
  {
    value: 'pix',
    label: 'PIX',
    descricao: 'Pagamento instantaneo',
    icon: 'qr_code_2',
  },
  {
    value: 'credit_card',
    label: 'Cartao de Credito',
    descricao: 'Parcele em ate 12x',
    icon: 'credit_card',
  },
  {
    value: 'debit_card',
    label: 'Cartao de Debito',
    descricao: 'Debito em conta',
    icon: 'credit_card',
  },
]

function selecionar(metodo: MetodoPagamento) {
  if (!props.disabled) {
    emit('update:modelValue', metodo)
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-on-surface-variant">
      Forma de pagamento
    </label>

    <div class="grid gap-3">
      <button
        v-for="metodo in metodos"
        :key="metodo.value"
        type="button"
        @click="selecionar(metodo.value)"
        :disabled="disabled"
        class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
        :class="{
          'border-primary bg-primary/5': modelValue === metodo.value,
          'border-outline-variant/30 hover:border-primary/50': modelValue !== metodo.value && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
        }"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
          :class="{
            'bg-primary text-on-primary': modelValue === metodo.value,
            'bg-surface-container-high text-on-surface-variant': modelValue !== metodo.value,
          }"
        >
          <span class="material-symbols-outlined text-2xl">{{ metodo.icon }}</span>
        </div>

        <div class="flex-1">
          <p class="font-semibold text-on-surface">{{ metodo.label }}</p>
          <p class="text-sm text-on-surface-variant">{{ metodo.descricao }}</p>
        </div>

        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="{
            'border-primary bg-primary': modelValue === metodo.value,
            'border-outline-variant': modelValue !== metodo.value,
          }"
        >
          <span
            v-if="modelValue === metodo.value"
            class="w-2 h-2 rounded-full bg-on-primary"
          ></span>
        </div>
      </button>
    </div>
  </div>
</template>
