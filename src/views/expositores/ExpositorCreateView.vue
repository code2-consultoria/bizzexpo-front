<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import ExpositorForm from '@/components/expositores/ExpositorForm.vue'
import TipoDocumentoSelector from '@/components/documento/TipoDocumentoSelector.vue'
import DocumentoInput from '@/components/documento/DocumentoInput.vue'
import PessoaEncontradaCard from '@/components/documento/PessoaEncontradaCard.vue'
import { useForm } from '@/composables/useForm'
import { useBuscaDocumento } from '@/composables/useBuscaDocumento'
import { useExpositoresStore } from '@/stores/expositores'

const route = useRoute()
const router = useRouter()
const expositoresStore = useExpositoresStore()

const eventoId = route.params.eventoId as string

// Busca de documento
const {
  tipoDocumento,
  documento,
  loading: buscando,
  pessoa,
  dadosReceita,
  erro: erroBusca,
  estado,
  selecionarTipo,
  buscar,
  limpar,
  voltarParaBusca
} = useBuscaDocumento()

// Formulário
const { form, loading, errors, submit } = useForm({
  nome_empresa: '',
  cnpj: '',
  nome_contato: '',
  email_contato: '',
  telefone: '',
  site: '',
  descricao: '',
})

// Campos read-only baseados no estado
const camposReadOnly = computed(() => {
  if (estado.value === 'encontrado_receita') {
    return ['nome_empresa', 'cnpj']
  }
  return []
})

// Preencher formulário com dados da Receita
watch(dadosReceita, (dados) => {
  if (dados) {
    form.nome_empresa = dados.nome_fantasia || dados.razao_social
    form.cnpj = dados.cnpj
    form.telefone = dados.telefone || ''
    form.email_contato = dados.email || ''
  }
})

// Título dinâmico
const titulo = computed(() => {
  switch (estado.value) {
    case 'inicial':
      return 'Novo expositor'
    case 'busca':
    case 'buscando':
      return tipoDocumento.value === 'cpf' ? 'Buscar por CPF' : 'Buscar por CNPJ'
    case 'encontrado_local':
      return 'Expositor encontrado'
    case 'buscando_receita':
      return 'Consultando Receita Federal...'
    case 'encontrado_receita':
      return 'Empresa encontrada'
    case 'nao_encontrado_cpf':
    case 'erro_receita':
      return 'Cadastrar expositor'
    default:
      return 'Novo expositor'
  }
})

// Subtítulo dinâmico
const subtitulo = computed(() => {
  switch (estado.value) {
    case 'inicial':
      return 'Selecione o tipo de documento para iniciar'
    case 'busca':
      return 'Digite o documento para verificar se já está cadastrado'
    case 'encontrado_local':
      return 'Este expositor já está na nossa base'
    case 'encontrado_receita':
      return 'Complete os dados de contato para finalizar'
    case 'nao_encontrado_cpf':
      return 'Preencha os dados do novo expositor'
    case 'erro_receita':
      return 'Não foi possível consultar a Receita. Preencha os dados manualmente.'
    default:
      return ''
  }
})

function handleConfirmarPessoaLocal() {
  if (pessoa.value) {
    // Preencher form com dados da pessoa e continuar
    form.nome_empresa = pessoa.value.nome
    form.cnpj = pessoa.value.documento
    form.email_contato = pessoa.value.email || ''
    form.telefone = pessoa.value.telefone || ''
    estado.value = 'nao_encontrado_cpf'
  }
}

function handleConfirmarDadosReceita() {
  // Os dados já estão no form via watch
  // Avança para o formulário híbrido
}

async function handleSubmit() {
  await submit(
    async (data) => {
      await expositoresStore.createExpositor(eventoId, data)
    },
    {
      onSuccess: () => {
        router.push(`/eventos/${eventoId}/expositores`)
      },
    }
  )
}

function handleCancel() {
  router.push(`/eventos/${eventoId}/expositores`)
}

function handleVoltar() {
  if (estado.value === 'busca') {
    limpar()
  } else {
    voltarParaBusca()
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <button
            v-if="estado !== 'inicial'"
            type="button"
            class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            @click="handleVoltar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">{{ titulo }}</h1>
        </div>
        <p v-if="subtitulo" class="text-gray-500">{{ subtitulo }}</p>
      </div>

      <!-- Estado: Inicial - Seleção de tipo de documento -->
      <Card v-if="estado === 'inicial'">
        <TipoDocumentoSelector
          v-model="tipoDocumento"
          @update:model-value="selecionarTipo"
        />
      </Card>

      <!-- Estado: Busca - Input de documento -->
      <Card v-else-if="estado === 'busca' || estado === 'buscando'">
        <div class="space-y-6">
          <DocumentoInput
            v-model="documento"
            :tipo="tipoDocumento!"
            :loading="buscando"
            :error="erroBusca || undefined"
            @buscar="buscar"
          />

          <div class="flex justify-end gap-4">
            <Button variant="ghost" @click="limpar">
              Cancelar
            </Button>
          </div>
        </div>
      </Card>

      <!-- Estado: Encontrado Local - Card de confirmação -->
      <div v-else-if="estado === 'encontrado_local'">
        <PessoaEncontradaCard
          :pessoa="pessoa"
          modo="local"
          @confirmar="handleConfirmarPessoaLocal"
          @cancelar="voltarParaBusca"
        />
      </div>

      <!-- Estado: Buscando Receita - Loading -->
      <Card v-else-if="estado === 'buscando_receita'">
        <div class="flex flex-col items-center justify-center py-12">
          <svg
            class="w-12 h-12 text-blue-500 animate-spin mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p class="text-gray-600">Consultando Receita Federal...</p>
          <p class="text-sm text-gray-400 mt-1">Isso pode levar alguns segundos</p>
        </div>
      </Card>

      <!-- Estado: Encontrado Receita - Card com dados + Form híbrido -->
      <div v-else-if="estado === 'encontrado_receita'" class="space-y-6">
        <PessoaEncontradaCard
          :dados-receita="dadosReceita"
          modo="receita"
          @confirmar="handleConfirmarDadosReceita"
          @cancelar="voltarParaBusca"
        />

        <Card>
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Complete os dados do contato
          </h2>
          <ExpositorForm
            v-model:form="form"
            :loading="loading"
            :errors="errors"
            :modo="'confirmar'"
            :campos-read-only="camposReadOnly"
            submit-label="Adicionar expositor"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </Card>
      </div>

      <!-- Estado: Não encontrado CPF ou Erro Receita - Form editável -->
      <Card v-else-if="estado === 'nao_encontrado_cpf' || estado === 'erro_receita'">
        <div v-if="estado === 'erro_receita'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="font-medium text-yellow-800">{{ erroBusca }}</p>
              <p class="text-sm text-yellow-700 mt-1">
                Você pode preencher os dados manualmente ou tentar novamente mais tarde.
              </p>
            </div>
          </div>
        </div>

        <ExpositorForm
          v-model:form="form"
          :loading="loading"
          :errors="errors"
          :modo="'criar'"
          submit-label="Adicionar expositor"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </Card>
    </div>
  </AppLayout>
</template>
