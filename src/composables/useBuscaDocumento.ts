import { ref, computed } from 'vue'
import api from '@/services/api'
import type { Pessoa, DadosReceita, TipoDocumento } from '@/types'

export type EstadoFormExpositor =
  | 'inicial'           // Seleção CPF/CNPJ
  | 'busca'             // Campo de busca ativo
  | 'buscando'          // Loading busca local
  | 'encontrado_local'  // Form read-only - pessoa já existe
  | 'nao_encontrado_cpf'// Form editável para CPF
  | 'buscando_receita'  // Loading API externa (Brasil API)
  | 'encontrado_receita'// Form híbrido - dados RF + campos editáveis
  | 'erro_receita'      // Erro na API externa

export function useBuscaDocumento() {
  const tipoDocumento = ref<TipoDocumento | null>(null)
  const documento = ref('')
  const loading = ref(false)
  const pessoa = ref<Pessoa | null>(null)
  const dadosReceita = ref<DadosReceita | null>(null)
  const erro = ref<string | null>(null)
  const estado = ref<EstadoFormExpositor>('inicial')

  const documentoLimpo = computed(() => documento.value.replace(/\D/g, ''))

  const documentoValido = computed(() => {
    const doc = documentoLimpo.value
    if (tipoDocumento.value === 'cpf') {
      return doc.length === 11 && validarCpf(doc)
    }
    if (tipoDocumento.value === 'cnpj') {
      return doc.length === 14 && validarCnpj(doc)
    }
    return false
  })

  function validarCpf(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(9))) return false

    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    return resto === parseInt(cpf.charAt(10))
  }

  function validarCnpj(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false

    const multiplicadores1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const multiplicadores2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    let soma = 0
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * multiplicadores1[i]
    }
    let resto = soma % 11
    const digito1 = resto < 2 ? 0 : 11 - resto
    if (parseInt(cnpj.charAt(12)) !== digito1) return false

    soma = 0
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj.charAt(i)) * multiplicadores2[i]
    }
    resto = soma % 11
    const digito2 = resto < 2 ? 0 : 11 - resto
    return parseInt(cnpj.charAt(13)) === digito2
  }

  function selecionarTipo(tipo: TipoDocumento) {
    tipoDocumento.value = tipo
    documento.value = ''
    pessoa.value = null
    dadosReceita.value = null
    erro.value = null
    estado.value = 'busca'
  }

  async function buscarLocal(): Promise<boolean> {
    if (!documentoValido.value) return false

    loading.value = true
    estado.value = 'buscando'
    erro.value = null

    try {
      const response = await api.get('/pessoas/buscar', {
        params: { documento: documentoLimpo.value }
      })

      if (response.data.data) {
        pessoa.value = response.data.data
        estado.value = 'encontrado_local'
        return true
      }

      return false
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      erro.value = 'Erro ao buscar pessoa na base local'
      return false
    } finally {
      loading.value = false
    }
  }

  async function buscarReceita(): Promise<boolean> {
    if (tipoDocumento.value !== 'cnpj' || !documentoValido.value) return false

    loading.value = true
    estado.value = 'buscando_receita'
    erro.value = null

    try {
      const response = await api.get('/cnpj/consultar', {
        params: { cnpj: documentoLimpo.value }
      })

      dadosReceita.value = response.data.data
      estado.value = 'encontrado_receita'
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        erro.value = 'CNPJ não encontrado na Receita Federal'
        estado.value = 'erro_receita'
        return false
      }
      if (error.response?.status === 503) {
        erro.value = 'Serviço de consulta temporariamente indisponível'
        estado.value = 'erro_receita'
        return false
      }
      erro.value = 'Erro ao consultar CNPJ na Receita Federal'
      estado.value = 'erro_receita'
      return false
    } finally {
      loading.value = false
    }
  }

  async function buscar() {
    // Primeiro, busca na base local
    const encontradoLocal = await buscarLocal()

    if (encontradoLocal) {
      return
    }

    // Se não encontrou e é CPF, vai para form editável
    if (tipoDocumento.value === 'cpf') {
      estado.value = 'nao_encontrado_cpf'
      return
    }

    // Se é CNPJ, busca na Receita Federal
    if (tipoDocumento.value === 'cnpj') {
      await buscarReceita()
    }
  }

  function limpar() {
    tipoDocumento.value = null
    documento.value = ''
    pessoa.value = null
    dadosReceita.value = null
    erro.value = null
    estado.value = 'inicial'
  }

  function voltarParaBusca() {
    pessoa.value = null
    dadosReceita.value = null
    erro.value = null
    estado.value = 'busca'
  }

  return {
    tipoDocumento,
    documento,
    documentoLimpo,
    documentoValido,
    loading,
    pessoa,
    dadosReceita,
    erro,
    estado,
    selecionarTipo,
    buscarLocal,
    buscarReceita,
    buscar,
    limpar,
    voltarParaBusca
  }
}
