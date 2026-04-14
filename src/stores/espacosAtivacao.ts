import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { EspacoAtivacao } from '@/types'

export const useEspacosAtivacaoStore = defineStore('espacosAtivacao', () => {
  const espacos = ref<EspacoAtivacao[]>([])
  const espacoAtual = ref<EspacoAtivacao | null>(null)
  const loading = ref(false)

  async function fetchEspacos(eventoId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/espacos-ativacao`)
      espacos.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchEspaco(eventoId: string, espacoId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/espacos-ativacao/${espacoId}`)
      espacoAtual.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createEspaco(
    eventoId: string,
    data: {
      nome: string
      descricao?: string
      localizacao?: string
      largura?: number
      profundidade?: number
      preco?: number
      imagem?: string
    }
  ) {
    const response = await api.post(`/eventos/${eventoId}/espacos-ativacao`, data)
    espacos.value.unshift(response.data.data)
    return response.data.data
  }

  async function updateEspaco(
    eventoId: string,
    espacoId: string,
    data: {
      nome?: string
      descricao?: string
      localizacao?: string
      largura?: number
      profundidade?: number
      preco?: number
      imagem?: string
    }
  ) {
    const response = await api.put(`/eventos/${eventoId}/espacos-ativacao/${espacoId}`, data)
    const index = espacos.value.findIndex((e) => e.id === espacoId)
    if (index !== -1) {
      espacos.value[index] = response.data.data
    }
    espacoAtual.value = response.data.data
    return response.data.data
  }

  async function deleteEspaco(eventoId: string, espacoId: string) {
    await api.delete(`/eventos/${eventoId}/espacos-ativacao/${espacoId}`)
    espacos.value = espacos.value.filter((e) => e.id !== espacoId)
  }

  return {
    espacos,
    espacoAtual,
    loading,
    fetchEspacos,
    fetchEspaco,
    createEspaco,
    updateEspaco,
    deleteEspaco,
  }
})
