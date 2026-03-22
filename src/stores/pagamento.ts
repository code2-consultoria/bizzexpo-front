import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Parcela, Pagamento, MetodoPagamento } from '@/types'

export interface DadosCartao {
  numero: string
  nome: string
  validade: string
  cvv: string
}

export interface ResultadoPagamento {
  pagamento: Pagamento
  sucesso: boolean
  mensagem?: string
}

export const usePagamentoStore = defineStore('pagamento', () => {
  // State
  const parcelas = ref<Parcela[]>([])
  const parcelaSelecionada = ref<number>(1)
  const metodoSelecionado = ref<MetodoPagamento>('pix')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagamentoAtual = ref<Pagamento | null>(null)

  // Getters
  const parcelaAtual = computed(() =>
    parcelas.value.find(p => p.quantidade === parcelaSelecionada.value)
  )

  const valorTotal = computed(() =>
    parcelaAtual.value?.valor_total ?? 0
  )

  const valorParcela = computed(() =>
    parcelaAtual.value?.valor_parcela ?? 0
  )

  const temJuros = computed(() =>
    parcelaAtual.value?.tem_juros ?? false
  )

  // Actions
  async function fetchParcelas(faturaId: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/faturas/${faturaId}/parcelas`)
      parcelas.value = response.data.data
      // Seleciona 1x por padrao
      parcelaSelecionada.value = 1
      return parcelas.value
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao carregar parcelas'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function pagarComPix(faturaId: string): Promise<ResultadoPagamento> {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/faturas/${faturaId}/pagar`, {
        metodo: 'pix',
      })
      pagamentoAtual.value = response.data.data
      return {
        pagamento: response.data.data,
        sucesso: true,
      }
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao gerar PIX'
      return {
        pagamento: null as any,
        sucesso: false,
        mensagem: error.value ?? undefined,
      }
    } finally {
      loading.value = false
    }
  }

  async function pagarComCartao(
    faturaId: string,
    dadosCartao: DadosCartao,
    parcelas: number = 1
  ): Promise<ResultadoPagamento> {
    loading.value = true
    error.value = null
    try {
      const response = await api.post(`/faturas/${faturaId}/pagar`, {
        metodo: 'credit_card',
        parcelas,
        cartao: {
          numero: dadosCartao.numero.replace(/\s/g, ''),
          nome: dadosCartao.nome,
          validade: dadosCartao.validade,
          cvv: dadosCartao.cvv,
        },
      })
      pagamentoAtual.value = response.data.data
      return {
        pagamento: response.data.data,
        sucesso: response.data.data.status === 'pago',
        mensagem: response.data.data.status !== 'pago' ? 'Pagamento nao aprovado' : undefined,
      }
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao processar pagamento'
      return {
        pagamento: null as any,
        sucesso: false,
        mensagem: error.value ?? undefined,
      }
    } finally {
      loading.value = false
    }
  }

  async function consultarStatus(pagamentoId: string): Promise<Pagamento> {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/pagamentos/${pagamentoId}`)
      pagamentoAtual.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message ?? 'Erro ao consultar status'
      throw e
    } finally {
      loading.value = false
    }
  }

  function selecionarMetodo(metodo: MetodoPagamento) {
    metodoSelecionado.value = metodo
  }

  function selecionarParcelas(quantidade: number) {
    parcelaSelecionada.value = quantidade
  }

  function limpar() {
    parcelas.value = []
    parcelaSelecionada.value = 1
    metodoSelecionado.value = 'pix'
    pagamentoAtual.value = null
    error.value = null
  }

  return {
    // State
    parcelas,
    parcelaSelecionada,
    metodoSelecionado,
    loading,
    error,
    pagamentoAtual,
    // Getters
    parcelaAtual,
    valorTotal,
    valorParcela,
    temJuros,
    // Actions
    fetchParcelas,
    pagarComPix,
    pagarComCartao,
    consultarStatus,
    selecionarMetodo,
    selecionarParcelas,
    limpar,
  }
})
