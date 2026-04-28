import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { EventoPublico, ExpositorPublico, Categoria, TipoIngresso } from '@/types'

export const useEventoPublicoStore = defineStore('eventoPublico', () => {
  const evento = ref<EventoPublico | null>(null)
  const expositores = ref<ExpositorPublico[]>([])
  const categorias = ref<Categoria[]>([])
  const tiposIngresso = ref<TipoIngresso[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEvento(slug: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/evento/${slug}`)
      evento.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar evento'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchExpositores(slug: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/evento/${slug}/expositores`)
      expositores.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao carregar expositores'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCategorias(slug: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/evento/${slug}/categorias`)
      categorias.value = response.data.data
      return response.data.data
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      error.value = errorObj.response?.data?.message || 'Erro ao carregar categorias'
      throw err
    } finally {
      loading.value = false
    }
  }

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

  function limpar() {
    evento.value = null
    expositores.value = []
    categorias.value = []
    tiposIngresso.value = []
    error.value = null
  }

  return {
    evento,
    expositores,
    categorias,
    tiposIngresso,
    loading,
    error,
    fetchEvento,
    fetchExpositores,
    fetchCategorias,
    fetchTiposIngresso,
    limpar,
  }
})
