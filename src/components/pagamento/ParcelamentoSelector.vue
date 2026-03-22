<script setup lang="ts">
import { computed } from 'vue'
import type { Parcela } from '@/types'

const props = defineProps<{
  parcelas: Parcela[]
  modelValue: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const parcelaSelecionada = computed(() =>
  props.parcelas.find(p => p.quantidade === props.modelValue)
)

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function selecionar(quantidade: number) {
  if (!props.disabled) {
    emit('update:modelValue', quantidade)
  }
}
</script>

<template>
  <div class="space-y-3">
    <label class="block text-sm font-medium text-on-surface-variant">
      Parcelamento
    </label>

    <div class="grid gap-2">
      <button
        v-for="parcela in parcelas"
        :key="parcela.quantidade"
        type="button"
        @click="selecionar(parcela.quantidade)"
        :disabled="disabled"
        class="flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left"
        :class="{
          'border-primary bg-primary/5': modelValue === parcela.quantidade,
          'border-outline-variant/30 hover:border-primary/50': modelValue !== parcela.quantidade && !disabled,
          'opacity-50 cursor-not-allowed': disabled,
        }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
            :class="{
              'border-primary bg-primary': modelValue === parcela.quantidade,
              'border-outline-variant': modelValue !== parcela.quantidade,
            }"
          >
            <span
              v-if="modelValue === parcela.quantidade"
              class="w-2 h-2 rounded-full bg-on-primary"
            ></span>
          </div>

          <div>
            <span class="font-semibold text-on-surface">
              {{ parcela.quantidade }}x de {{ formatarMoeda(parcela.valor_parcela) }}
            </span>
            <span v-if="parcela.tem_juros" class="text-xs text-on-surface-variant ml-2">
              com juros
            </span>
            <span v-else class="text-xs text-primary ml-2">
              sem juros
            </span>
          </div>
        </div>

        <div class="text-right">
          <p class="text-sm text-on-surface-variant">
            Total: {{ formatarMoeda(parcela.valor_total) }}
          </p>
          <p v-if="parcela.juros > 0" class="text-xs text-on-surface-variant">
            Juros: {{ formatarMoeda(parcela.juros) }}
          </p>
        </div>
      </button>
    </div>

    <!-- Resumo -->
    <div v-if="parcelaSelecionada" class="mt-4 p-4 bg-surface-container-high rounded-xl">
      <div class="flex justify-between text-sm">
        <span class="text-on-surface-variant">Valor a pagar</span>
        <span class="font-bold text-on-surface">
          {{ parcelaSelecionada.quantidade }}x {{ formatarMoeda(parcelaSelecionada.valor_parcela) }}
        </span>
      </div>
      <div class="flex justify-between text-sm mt-1">
        <span class="text-on-surface-variant">Total</span>
        <span class="font-bold text-primary">
          {{ formatarMoeda(parcelaSelecionada.valor_total) }}
        </span>
      </div>
    </div>
  </div>
</template>
