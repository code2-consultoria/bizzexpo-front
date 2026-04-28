<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TicketCard from './TicketCard.vue'
import type { TipoIngresso } from '@/types'

interface Props {
  tiposIngresso: TipoIngresso[]
  eventoSlug: string
}

const props = defineProps<Props>()
const router = useRouter()

// Mapa de quantidades selecionadas por tipo de ingresso
const quantidades = ref<Record<string, number>>({})

// Inicializa quantidades
watch(
  () => props.tiposIngresso,
  (tipos) => {
    tipos.forEach((tipo) => {
      if (!(tipo.id in quantidades.value)) {
        quantidades.value[tipo.id] = 0
      }
    })
  },
  { immediate: true }
)

// Total de tickets selecionados
const totalTickets = computed(() => {
  return Object.values(quantidades.value).reduce((sum, q) => sum + q, 0)
})

// Valor total
const valorTotal = computed(() => {
  return props.tiposIngresso.reduce((total, tipo) => {
    const qtd = quantidades.value[tipo.id] || 0
    return total + (tipo.preco * qtd)
  }, 0)
})

const valorTotalFormatado = computed(() => {
  if (valorTotal.value === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal.value)
})

// Verifica se pode fazer compra
const canSubmit = computed(() => totalTickets.value > 0)

// Atualiza quantidade de um tipo de ingresso
function updateQuantidade(tipoIngressoId: string, quantidade: number) {
  quantidades.value[tipoIngressoId] = quantidade
}

// Navega para o formulario de compra
function irParaCompra() {
  // Se tiver apenas um tipo selecionado, vai direto para ele
  const selecionados = Object.entries(quantidades.value).filter(([, q]) => q > 0)

  if (selecionados.length === 1 && selecionados[0]) {
    const tipoIngressoId = selecionados[0][0]
    router.push({
      name: 'evento-compra',
      params: { slug: props.eventoSlug },
      query: { tipo: tipoIngressoId, qtd: String(selecionados[0][1]) },
    })
  } else {
    // Se tiver varios, serializa os selecionados
    const selecao = selecionados.map(([id, qtd]) => `${id}:${qtd}`).join(',')
    router.push({
      name: 'evento-compra',
      params: { slug: props.eventoSlug },
      query: { selecao },
    })
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
    <div class="p-4 border-b border-slate-100">
      <h3 class="font-semibold text-slate-900 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        Ingressos
      </h3>
    </div>

    <div v-if="tiposIngresso.length === 0" class="p-6 text-center">
      <p class="text-slate-500 text-sm">Nenhum ingresso disponivel no momento.</p>
    </div>

    <div v-else class="px-4">
      <TicketCard
        v-for="tipo in tiposIngresso"
        :key="tipo.id"
        :id="tipo.id"
        :nome="tipo.nome"
        :descricao="tipo.descricao"
        :preco="tipo.preco"
        :quantidade="quantidades[tipo.id] || 0"
        :esgotado="tipo.esgotado"
        :temporariamente-indisponivel="tipo.temporariamente_indisponivel"
        @update:quantidade="updateQuantidade(tipo.id, $event)"
      />
    </div>

    <div class="p-4 border-t border-slate-100 space-y-3">
      <div v-if="totalTickets > 0" class="flex justify-between items-center text-sm">
        <span class="text-slate-600">Total:</span>
        <span class="font-semibold text-lg" :class="valorTotal === 0 ? 'text-green-600' : 'text-slate-900'">
          {{ valorTotalFormatado }}
        </span>
      </div>

      <button
        type="button"
        :disabled="!canSubmit"
        class="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        @click="irParaCompra"
      >
        <span v-if="totalTickets === 0">Selecione um ingresso</span>
        <span v-else-if="totalTickets === 1">Comprar ingresso</span>
        <span v-else>Comprar {{ totalTickets }} ingressos</span>
      </button>
    </div>
  </div>
</template>
