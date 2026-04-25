import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Organizador } from '@/types'

export const useOrganizadorStore = defineStore('organizador', () => {
  const organizador = ref<Organizador | null>(null)
  const loading = ref(false)

  async function fetchOrganizador() {
    loading.value = true
    try {
      const response = await api.get('/organizador')
      organizador.value = response.data.data
    } catch {
      organizador.value = null
    } finally {
      loading.value = false
    }
  }

  async function createOrganizador(data: {
    telefone: string
    empresa: string
    cnpj: string
    cargo?: string
  }) {
    const response = await api.post('/organizador', data)
    organizador.value = response.data.data
    return response.data.data
  }

  async function updateOrganizador(data: {
    telefone?: string
    empresa?: string
    cnpj?: string
    cargo?: string
    logo?: string
  }) {
    const response = await api.put('/organizador', data)
    organizador.value = response.data.data
    return response.data.data
  }

  return {
    organizador,
    loading,
    fetchOrganizador,
    createOrganizador,
    updateOrganizador,
  }
})
