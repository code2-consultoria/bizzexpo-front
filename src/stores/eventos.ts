import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Evento } from '@/types'

export const useEventosStore = defineStore('eventos', () => {
  const eventos = ref<Evento[]>([])
  const eventoAtual = ref<Evento | null>(null)
  const loading = ref(false)

  async function fetchEventos() {
    loading.value = true
    try {
      const response = await api.get('/eventos')
      eventos.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchEvento(id: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${id}`)
      eventoAtual.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createEvento(data: {
    nome: string
    descricao: string
    data_inicio: string
    data_fim: string
    local: string
    plano: 'essencial' | 'profissional' | 'enterprise'
  }) {
    const response = await api.post('/eventos', data)
    eventos.value.unshift(response.data.data)
    return response.data.data
  }

  async function updateEvento(
    id: string,
    data: {
      nome?: string
      descricao?: string
      data_inicio?: string
      data_fim?: string
      local?: string
    }
  ) {
    const response = await api.put(`/eventos/${id}`, data)
    const index = eventos.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      eventos.value[index] = response.data.data
    }
    eventoAtual.value = response.data.data
    return response.data.data
  }

  async function deleteEvento(id: string) {
    await api.delete(`/eventos/${id}`)
    eventos.value = eventos.value.filter((e) => e.id !== id)
  }

  async function alterarStatus(id: string, status: string) {
    const response = await api.patch(`/eventos/${id}/status`, { status })
    const index = eventos.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      eventos.value[index] = response.data.data
    }
    eventoAtual.value = response.data.data
    return response.data.data
  }

  async function marcarComoPago(id: string, valor: number, desconto?: number, observacao?: string) {
    const response = await api.patch(`/admin/eventos/${id}/pago`, { valor, desconto, observacao })
    const index = eventos.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      eventos.value[index] = response.data.data.evento
    }
    eventoAtual.value = response.data.data.evento
    return response.data
  }

  return {
    eventos,
    eventoAtual,
    loading,
    fetchEventos,
    fetchEvento,
    createEvento,
    updateEvento,
    deleteEvento,
    alterarStatus,
    marcarComoPago,
  }
})
