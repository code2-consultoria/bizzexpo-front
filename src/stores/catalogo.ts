import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { CategoriaProduto, Produto, TipoProduto } from '@/types'

export const useCatalogoStore = defineStore('catalogo', () => {
  // State
  const categorias = ref<CategoriaProduto[]>([])
  const produtos = ref<Produto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Filtros
  const filtroCategoria = ref<string | null>(null)
  const filtroTipo = ref<TipoProduto | null>(null)
  const filtroAtivo = ref<boolean | null>(null)
  const busca = ref('')

  // Getters
  const categoriasAtivas = computed(() =>
    categorias.value.filter(c => c.ativo)
  )

  const produtosFiltrados = computed(() => {
    let resultado = produtos.value

    if (filtroCategoria.value) {
      resultado = resultado.filter(p => p.categoria_id === filtroCategoria.value)
    }

    if (filtroTipo.value) {
      resultado = resultado.filter(p => p.tipo === filtroTipo.value)
    }

    if (filtroAtivo.value !== null) {
      resultado = resultado.filter(p => p.ativo === filtroAtivo.value)
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

  // Actions - Categorias
  async function fetchCategorias() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/catalogo/categorias')
      categorias.value = response.data.data
      return categorias.value
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao carregar categorias'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function criarCategoria(data: { nome: string; descricao?: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/admin/catalogo/categorias', data)
      await fetchCategorias()
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao criar categoria'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function atualizarCategoria(id: string, data: Partial<CategoriaProduto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/admin/catalogo/categorias/${id}`, data)
      await fetchCategorias()
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao atualizar categoria'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removerCategoria(id: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/admin/catalogo/categorias/${id}`)
      await fetchCategorias()
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao remover categoria'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Actions - Produtos
  async function fetchProdutos(params?: { categoria_id?: string; tipo?: string; ativo?: boolean; busca?: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/admin/catalogo/produtos', { params })
      produtos.value = response.data.data
      return produtos.value
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao carregar produtos'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function criarProduto(data: {
    categoria_id: string
    nome: string
    descricao?: string
    tipo: TipoProduto
    preco_base: number
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/admin/catalogo/produtos', data)
      await fetchProdutos()
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao criar produto'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function atualizarProduto(id: string, data: Partial<Produto>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/admin/catalogo/produtos/${id}`, data)
      await fetchProdutos()
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao atualizar produto'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removerProduto(id: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/admin/catalogo/produtos/${id}`)
      await fetchProdutos()
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao remover produto'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function definirPrecoEvento(produtoId: string, eventoId: string, preco: number, ativo: boolean = true) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/admin/catalogo/produtos/${produtoId}/evento/${eventoId}/preco`, {
        preco,
        ativo,
      })
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao definir preco do evento'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Utils
  function limparFiltros() {
    filtroCategoria.value = null
    filtroTipo.value = null
    filtroAtivo.value = null
    busca.value = ''
  }

  function getTipoLabel(tipo: TipoProduto): string {
    const labels: Record<TipoProduto, string> = {
      estande: 'Estande',
      marketing: 'Marketing',
      equipamento: 'Equipamento',
      servico: 'Servico',
    }
    return labels[tipo] || tipo
  }

  return {
    // State
    categorias,
    produtos,
    loading,
    error,
    // Filtros
    filtroCategoria,
    filtroTipo,
    filtroAtivo,
    busca,
    // Getters
    categoriasAtivas,
    produtosFiltrados,
    // Actions - Categorias
    fetchCategorias,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    // Actions - Produtos
    fetchProdutos,
    criarProduto,
    atualizarProduto,
    removerProduto,
    definirPrecoEvento,
    // Utils
    limparFiltros,
    getTipoLabel,
  }
})
