import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { TipoProduto } from '@/types'

export interface ProdutoMarketplace {
  id: string
  categoria_id: string
  nome: string
  descricao?: string
  tipo: TipoProduto
  preco_base: number
  preco: number
  ativo?: boolean
  categoria?: {
    id: string
    nome: string
  }
}

export const useMarketplaceStore = defineStore('marketplace', () => {
  const produtos = ref<ProdutoMarketplace[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filtros
  const filtroCategoria = ref<string | null>(null)
  const filtroTipo = ref<string | null>(null)
  const busca = ref('')

  // Getters
  const produtosFiltrados = computed(() => {
    let resultado = produtos.value

    if (filtroCategoria.value) {
      resultado = resultado.filter(p => p.categoria_id === filtroCategoria.value)
    }

    if (filtroTipo.value) {
      resultado = resultado.filter(p => p.tipo === filtroTipo.value)
    }

    if (busca.value) {
      const termo = busca.value.toLowerCase()
      resultado = resultado.filter(p =>
        p.nome.toLowerCase().includes(termo) ||
        p.descricao?.toLowerCase().includes(termo)
      )
    }

    return resultado
  })

  const categorias = computed(() => {
    const cats = new Map<string, { id: string; nome: string }>()
    produtos.value.forEach(p => {
      if (p.categoria) {
        cats.set(p.categoria.id, p.categoria)
      }
    })
    return Array.from(cats.values())
  })

  // Actions
  async function fetchProdutos(eventoId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/eventos/${eventoId}/produtos`)
      produtos.value = response.data.data
      return produtos.value
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao carregar produtos'
      throw e
    } finally {
      loading.value = false
    }
  }

  function limparFiltros() {
    filtroCategoria.value = null
    filtroTipo.value = null
    busca.value = ''
  }

  function limpar() {
    produtos.value = []
    limparFiltros()
    error.value = null
  }

  function getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      estande: 'Estande',
      marketing: 'Marketing',
      equipamento: 'Equipamento',
      servico: 'Servico',
    }
    return labels[tipo] || tipo
  }

  return {
    // State
    produtos,
    loading,
    error,
    // Filtros
    filtroCategoria,
    filtroTipo,
    busca,
    // Getters
    produtosFiltrados,
    categorias,
    // Actions
    fetchProdutos,
    limparFiltros,
    limpar,
    getTipoLabel,
  }
})
