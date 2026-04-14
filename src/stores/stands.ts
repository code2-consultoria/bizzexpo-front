import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Stand } from '@/types'

export const useStandsStore = defineStore('stands', () => {
  const stands = ref<Stand[]>([])
  const standAtual = ref<Stand | null>(null)
  const loading = ref(false)

  async function fetchStands(eventoId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/stands`)
      stands.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchStand(eventoId: string, standId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/stands/${standId}`)
      standAtual.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createStand(
    eventoId: string,
    data: {
      nome: string
      descricao?: string
      localizacao?: string
      largura?: number
      profundidade?: number
      preco?: number
      quantidade?: number
      imagem?: string
    }
  ) {
    const response = await api.post(`/eventos/${eventoId}/stands`, data)
    stands.value.unshift(response.data.data)
    return response.data.data
  }

  async function updateStand(
    eventoId: string,
    standId: string,
    data: {
      nome?: string
      descricao?: string
      localizacao?: string
      largura?: number
      profundidade?: number
      preco?: number
      quantidade?: number
      imagem?: string
    }
  ) {
    const response = await api.put(`/eventos/${eventoId}/stands/${standId}`, data)
    const index = stands.value.findIndex((s) => s.id === standId)
    if (index !== -1) {
      stands.value[index] = response.data.data
    }
    standAtual.value = response.data.data
    return response.data.data
  }

  async function deleteStand(eventoId: string, standId: string) {
    await api.delete(`/eventos/${eventoId}/stands/${standId}`)
    stands.value = stands.value.filter((s) => s.id !== standId)
  }

  return {
    stands,
    standAtual,
    loading,
    fetchStands,
    fetchStand,
    createStand,
    updateStand,
    deleteStand,
  }
})
