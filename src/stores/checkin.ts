import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { InscricaoCompleta, InscricaoForm } from '@/types'

export interface CheckinResult {
  inscricao: InscricaoCompleta
  checkin_at: string
  ja_realizado?: boolean
}

export const useCheckinStore = defineStore('checkin', () => {
  const inscricaoValidada = ref<InscricaoCompleta | null>(null)
  const checkinResult = ref<CheckinResult | null>(null)
  const resultadosBusca = ref<InscricaoCompleta[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Validar QR Code
  async function validarQrCode(eventoId: string, qrcode: string) {
    loading.value = true
    error.value = null
    inscricaoValidada.value = null
    try {
      const response = await api.get(`/eventos/${eventoId}/checkin/validar/${qrcode}`)
      inscricaoValidada.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'QR Code invalido'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Realizar check-in
  async function realizarCheckin(eventoId: string, qrcode: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/eventos/${eventoId}/checkin`, {
        qrcode,
      })
      const inscricao = response.data.data
      checkinResult.value = {
        inscricao,
        checkin_at: inscricao.checkin_at,
        ja_realizado: false,
      }
      return checkinResult.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao realizar check-in'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar participante por nome ou email
  async function buscarParticipante(eventoId: string, busca: string) {
    loading.value = true
    error.value = null
    resultadosBusca.value = []
    try {
      const response = await api.get(`/eventos/${eventoId}/checkin/buscar`, {
        params: { q: busca },
      })
      resultadosBusca.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao buscar participante'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Walk-in: criar inscricao e check-in ao mesmo tempo
  async function registrarWalkin(eventoId: string, dados: InscricaoForm) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/eventos/${eventoId}/checkin/walkin`, dados)
      checkinResult.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao registrar walk-in'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Autoatendimento (totem): check-in publico por QR Code
  async function autoatendimento(slug: string, qrcode: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/evento/${slug}/autoatendimento`, {
        qrcode,
      })
      checkinResult.value = response.data.data
      return response.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erro ao realizar check-in'
      throw err
    } finally {
      loading.value = false
    }
  }

  function limpar() {
    inscricaoValidada.value = null
    checkinResult.value = null
    resultadosBusca.value = []
    error.value = null
  }

  return {
    inscricaoValidada,
    checkinResult,
    resultadosBusca,
    loading,
    error,
    validarQrCode,
    realizarCheckin,
    buscarParticipante,
    registrarWalkin,
    autoatendimento,
    limpar,
  }
})
