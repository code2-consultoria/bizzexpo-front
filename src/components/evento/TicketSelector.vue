<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import TicketCard from './TicketCard.vue'

interface Categoria {
  id: string
  nome: string
  descricao?: string
}

interface Props {
  categorias: Categoria[]
  eventoSlug: string
}

const props = defineProps<Props>()
const router = useRouter()

// Mapa de quantidades selecionadas por categoria
const quantidades = ref<Record<string, number>>({})

// Inicializa quantidades
watch(
  () => props.categorias,
  (cats) => {
    cats.forEach((cat) => {
      if (!(cat.id in quantidades.value)) {
        quantidades.value[cat.id] = 0
      }
    })
  },
  { immediate: true }
)

// Total de tickets selecionados
const totalTickets = computed(() => {
  return Object.values(quantidades.value).reduce((sum, q) => sum + q, 0)
})

// Verifica se pode fazer inscricao
const canSubmit = computed(() => totalTickets.value > 0)

// Atualiza quantidade de uma categoria
function updateQuantidade(categoriaId: string, quantidade: number) {
  quantidades.value[categoriaId] = quantidade
}

// Navega para o formulario de inscricao
function irParaInscricao() {
  // Se tiver apenas uma categoria selecionada, vai direto para ela
  const selecionadas = Object.entries(quantidades.value).filter(([, q]) => q > 0)

  if (selecionadas.length === 1 && selecionadas[0]) {
    const categoriaId = selecionadas[0][0]
    router.push({
      name: 'evento-inscricao',
      params: { slug: props.eventoSlug },
      query: { categoria: categoriaId },
    })
  } else {
    // Se tiver várias, vai para a página de inscrição geral
    router.push({
      name: 'evento-inscricao',
      params: { slug: props.eventoSlug },
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
        Tickets
      </h3>
    </div>

    <div v-if="categorias.length === 0" class="p-6 text-center">
      <p class="text-slate-500 text-sm">Nenhum ticket disponivel no momento.</p>
    </div>

    <div v-else class="px-4">
      <TicketCard
        v-for="categoria in categorias"
        :key="categoria.id"
        :id="categoria.id"
        :nome="categoria.nome"
        :descricao="categoria.descricao"
        :quantidade="quantidades[categoria.id] || 0"
        @update:quantidade="updateQuantidade(categoria.id, $event)"
      />
    </div>

    <div class="p-4 border-t border-slate-100">
      <button
        type="button"
        :disabled="!canSubmit"
        class="w-full py-3 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
        @click="irParaInscricao"
      >
        <span v-if="totalTickets === 0">Selecione um ticket</span>
        <span v-else-if="totalTickets === 1">Inscrever-se</span>
        <span v-else>Inscrever-se ({{ totalTickets }} tickets)</span>
      </button>
    </div>
  </div>
</template>
