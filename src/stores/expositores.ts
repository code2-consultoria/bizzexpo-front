import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Expositor, Pessoa, DadosReceita } from '@/types'

export const useExpositoresStore = defineStore('expositores', () => {
  const expositores = ref<Expositor[]>([])
  const expositorAtual = ref<Expositor | null>(null)
  const loading = ref(false)

  async function fetchExpositores(eventoId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/expositores`)
      expositores.value = response.data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchExpositor(eventoId: string, expositorId: string) {
    loading.value = true
    try {
      const response = await api.get(`/eventos/${eventoId}/expositores/${expositorId}`)
      expositorAtual.value = response.data.data
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  async function createExpositor(
    eventoId: string,
    data: {
      nome_empresa: string
      cnpj?: string
      nome_contato: string
      email_contato: string
      telefone: string
      site?: string
      descricao?: string
      redes_sociais?: Record<string, string>
    }
  ) {
    const response = await api.post(`/eventos/${eventoId}/expositores`, data)
    expositores.value.unshift(response.data.data)
    return response.data.data
  }

  async function updateExpositor(
    eventoId: string,
    expositorId: string,
    data: {
      nome_empresa?: string
      cnpj?: string
      nome_contato?: string
      email_contato?: string
      telefone?: string
      site?: string
      descricao?: string
      redes_sociais?: Record<string, string>
    }
  ) {
    const response = await api.put(`/eventos/${eventoId}/expositores/${expositorId}`, data)
    const index = expositores.value.findIndex((e) => e.id === expositorId)
    if (index !== -1) {
      expositores.value[index] = response.data.data
    }
    expositorAtual.value = response.data.data
    return response.data.data
  }

  async function deleteExpositor(eventoId: string, expositorId: string) {
    await api.delete(`/eventos/${eventoId}/expositores/${expositorId}`)
    expositores.value = expositores.value.filter((e) => e.id !== expositorId)
  }

  async function buscarPessoa(documento: string): Promise<Pessoa | null> {
    try {
      const response = await api.get('/pessoas/buscar', {
        params: { documento }
      })
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  async function consultarCnpj(cnpj: string): Promise<DadosReceita | null> {
    try {
      const response = await api.get('/cnpj/consultar', {
        params: { cnpj }
      })
      return response.data.data || null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  return {
    expositores,
    expositorAtual,
    loading,
    fetchExpositores,
    fetchExpositor,
    createExpositor,
    updateExpositor,
    deleteExpositor,
    buscarPessoa,
    consultarCnpj,
  }
})
