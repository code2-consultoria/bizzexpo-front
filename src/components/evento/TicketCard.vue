<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id: string
  nome: string
  descricao?: string
  preco: number
  quantidade: number
  maxQuantidade?: number
  esgotado?: boolean
  temporariamenteIndisponivel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxQuantidade: 10,
  esgotado: false,
  temporariamenteIndisponivel: false,
})

const emit = defineEmits<{
  (e: 'update:quantidade', value: number): void
}>()

const isGratuito = computed(() => props.preco === 0)
const isDisponivel = computed(() => !props.esgotado && !props.temporariamenteIndisponivel)
const canDecrease = computed(() => props.quantidade > 0)
const canIncrease = computed(() => isDisponivel.value && props.quantidade < props.maxQuantidade)

const precoFormatado = computed(() => {
  if (isGratuito.value) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(props.preco)
})

const statusLabel = computed(() => {
  if (props.esgotado) return 'Esgotado'
  if (props.temporariamenteIndisponivel) return 'Indisponivel'
  return null
})

function decrease() {
  if (canDecrease.value) {
    emit('update:quantidade', props.quantidade - 1)
  }
}

function increase() {
  if (canIncrease.value) {
    emit('update:quantidade', props.quantidade + 1)
  }
}
</script>

<template>
  <div
    class="flex items-center justify-between py-4 border-b border-slate-100 last:border-b-0"
    :class="{ 'opacity-60': !isDisponivel }"
  >
    <div class="flex-1 pr-4">
      <div class="flex items-center gap-2">
        <h4 class="font-medium text-slate-900">{{ nome }}</h4>
        <span
          v-if="statusLabel"
          class="px-2 py-0.5 text-xs font-medium rounded-full"
          :class="{
            'bg-red-100 text-red-700': esgotado,
            'bg-amber-100 text-amber-700': temporariamenteIndisponivel,
          }"
        >
          {{ statusLabel }}
        </span>
      </div>
      <p v-if="descricao" class="text-sm text-slate-500 mt-0.5">{{ descricao }}</p>
      <p class="text-sm font-semibold mt-1" :class="isGratuito ? 'text-green-600' : 'text-primary'">
        {{ precoFormatado }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        :disabled="!canDecrease"
        class="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="decrease"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>

      <span class="w-8 text-center font-medium text-slate-900">{{ quantidade }}</span>

      <button
        type="button"
        :disabled="!canIncrease"
        class="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="increase"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
</template>
