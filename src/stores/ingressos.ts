import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { TipoIngresso, IngressoCompra, CompraIngressoForm, PaginatedResponse } from '@/types'

export const useIngressosStore = defineStore('ingressos', () => {
  const tiposIngresso = ref<TipoIngresso[]>([])
  const ingressoAtual = ref<IngressoCompra | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<PaginatedResponse<unknown>['meta'] | null>(null)

  // Buscar tipos de ingresso publicos
  async function fetchTiposIngresso(slug: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/evento/${slug}/tipos-ingresso`)
      tiposIngresso.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao carregar tipos de ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Comprar ingresso (publico)
  async function comprarIngresso(slug: string, dados: CompraIngressoForm) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/evento/${slug}/ingressos`, dados)
      ingressoAtual.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao comprar ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  // CRUD para organizador
  async function fetchTiposIngressoOrganizador(eventoId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/eventos/${eventoId}/tipos-ingresso`)
      tiposIngresso.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao carregar tipos de ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function criarTipoIngresso(eventoId: string, dados: Partial<TipoIngresso>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/eventos/${eventoId}/tipos-ingresso`, dados)
      tiposIngresso.value.push(response.data.data)
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao criar tipo de ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function atualizarTipoIngresso(tipoIngressoId: string, dados: Partial<TipoIngresso>) {
    loading.value = true
    error.value = null
    try {
      const response = await api.put(`/tipos-ingresso/${tipoIngressoId}`, dados)
      const index = tiposIngresso.value.findIndex(t => t.id === tipoIngressoId)
      if (index !== -1) {
        tiposIngresso.value[index] = response.data.data
      }
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao atualizar tipo de ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function excluirTipoIngresso(tipoIngressoId: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/tipos-ingresso/${tipoIngressoId}`)
      tiposIngresso.value = tiposIngresso.value.filter(t => t.id !== tipoIngressoId)
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao excluir tipo de ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Adicionar cortesia (organizador)
  async function adicionarCortesia(eventoId: string, dados: { tipo_ingresso_id: string, participante_id: string }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/eventos/${eventoId}/cortesias`, dados)
      ingressoAtual.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao adicionar cortesia'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cancelar ingresso (organizador)
  async function cancelarIngresso(ingressoId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.delete(`/ingressos/${ingressoId}`)
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao cancelar ingresso'
      throw err
    } finally {
      loading.value = false
    }
  }

  function limpar() {
    tiposIngresso.value = []
    ingressoAtual.value = null
    error.value = null
    meta.value = null
  }

  return {
    tiposIngresso,
    ingressoAtual,
    loading,
    error,
    meta,
    fetchTiposIngresso,
    comprarIngresso,
    fetchTiposIngressoOrganizador,
    criarTipoIngresso,
    atualizarTipoIngresso,
    excluirTipoIngresso,
    adicionarCortesia,
    cancelarIngresso,
    limpar,
  }
})
