import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Categoria } from '@/types'

export interface CategoriaFormData {
  nome: string
  descricao?: string
  preco: number
  quantidade?: number | null
  periodo_inicio?: string | null
  periodo_fim?: string | null
  cortesia: boolean
  ativo: boolean
}

export const useCategoriasStore = defineStore('categorias', () => {
  const categorias = ref<Categoria[]>([])
  const categoriaAtual = ref<Categoria | null>(null)
  const loading = ref(false)

  async function fetchCategorias(eventoId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/categorias`)
      categorias.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoria(eventoId: string, categoriaId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/categorias/${categoriaId}`)
      categoriaAtual.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createCategoria(eventoId: string, data: CategoriaFormData) {
    const response = await api.post(`/eventos/${eventoId}/categorias`, data)
    categorias.value.unshift(response.data.data)
    return response.data.data
  }

  async function updateCategoria(
    eventoId: string,
    categoriaId: string,
    data: Partial<CategoriaFormData>
  ) {
    const response = await api.put(`/eventos/${eventoId}/categorias/${categoriaId}`, data)
    const index = categorias.value.findIndex((c) => c.id === categoriaId)
    if (index !== -1) {
      categorias.value[index] = response.data.data
    }
    categoriaAtual.value = response.data.data
    return response.data.data
  }

  async function deleteCategoria(eventoId: string, categoriaId: string) {
    await api.delete(`/eventos/${eventoId}/categorias/${categoriaId}`)
    categorias.value = categorias.value.filter((c) => c.id !== categoriaId)
  }

  return {
    categorias,
    categoriaAtual,
    loading,
    fetchCategorias,
    fetchCategoria,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  }
})
