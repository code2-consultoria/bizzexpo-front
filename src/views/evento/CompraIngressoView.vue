<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventoPublicoStore } from '@/stores/eventoPublico'
import { useIngressosStore } from '@/stores/ingressos'
import type { TipoIngresso, CompraIngressoForm } from '@/types'
import Spinner from '@/components/ui/Spinner.vue'
import Toast from '@/components/ui/Toast.vue'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const router = useRouter()
const eventoStore = useEventoPublicoStore()
const ingressosStore = useIngressosStore()

const slug = route.params.slug as string
const errors = ref<Record<string, string[]>>({})

// Parse da query string para obter seleção
const selecaoInicial = computed(() => {
  const tipo = route.query.tipo as string
  const qtd = parseInt(route.query.qtd as string) || 1

  if (tipo) {
    return [{ tipoId: tipo, quantidade: qtd }]
  }

  const selecao = route.query.selecao as string
  if (selecao) {
    return selecao.split(',').map(item => {
      const partes = item.split(':')
      const tipoId = partes[0] || ''
      const q = partes[1] || '1'
      return { tipoId, quantidade: parseInt(q) || 1 }
    })
  }

  return []
})

// Tipo de ingresso selecionado
const tipoSelecionado = ref<TipoIngresso | null>(null)

// Formulário
const form = ref<CompraIngressoForm>({
  tipo_ingresso_id: '',
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cargo: '',
  cidade_uf: '',
  aceite_termos: false,
})

// Toast state
const showToast = ref(false)
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const toastMessage = ref('')

function mostrarToast(tipo: typeof toastType.value, mensagem: string) {
  toastType.value = tipo
  toastMessage.value = mensagem
  showToast.value = true
}

function fecharToast() {
  showToast.value = false
}

// Formata telefone
function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '')
  if (numeros.length <= 2) return numeros
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  if (numeros.length <= 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`
}

function onTelefoneInput(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.telefone = formatarTelefone(target.value)
}

// Preço formatado
const precoFormatado = computed(() => {
  if (!tipoSelecionado.value) return ''
  if (tipoSelecionado.value.preco === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(tipoSelecionado.value.preco)
})

const isGratuito = computed(() => tipoSelecionado.value?.preco === 0)

onMounted(async () => {
  // Carrega evento se ainda não foi carregado
  if (!eventoStore.evento || eventoStore.evento.slug !== slug) {
    await eventoStore.fetchEvento(slug)
  }

  // Carrega tipos de ingresso
  if (eventoStore.tiposIngresso.length === 0) {
    await eventoStore.fetchTiposIngresso(slug)
  }

  // Define o tipo selecionado baseado na query
  const primeiraSelecao = selecaoInicial.value[0]
  if (primeiraSelecao) {
    const tipoId = primeiraSelecao.tipoId
    tipoSelecionado.value = eventoStore.tiposIngresso.find(t => t.id === tipoId) || null
    if (tipoSelecionado.value) {
      form.value.tipo_ingresso_id = tipoSelecionado.value.id
    }
  }
})

const handleSubmit = async () => {
  errors.value = {}

  // Validação básica
  if (!form.value.nome) {
    errors.value.nome = ['O nome é obrigatório']
    return
  }
  if (!form.value.email) {
    errors.value.email = ['O email é obrigatório']
    return
  }
  if (!form.value.telefone) {
    errors.value.telefone = ['O telefone é obrigatório']
    return
  }
  if (!form.value.aceite_termos) {
    errors.value.aceite_termos = ['Você precisa aceitar os termos']
    return
  }

  try {
    const ingresso = await ingressosStore.comprarIngresso(slug, form.value)

    // Redireciona para página de confirmação
    router.push({
      name: 'evento-confirmacao',
      params: { slug, qrcode: ingresso.qrcode },
    })
  } catch (err: unknown) {
    const errorObj = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } }; code?: string }

    if (errorObj.response?.status === 422) {
      if (errorObj.response.data?.errors) {
        errors.value = errorObj.response.data.errors
      } else if (errorObj.response.data?.message) {
        errors.value = { _general: [errorObj.response.data.message] }
      }
    } else if (errorObj.response?.status === 404) {
      mostrarToast('error', 'Evento não encontrado.')
    } else if (errorObj.response?.status && errorObj.response.status >= 500) {
      mostrarToast('error', 'Erro no servidor. Tente novamente em alguns instantes.')
    } else if (errorObj.code === 'ERR_NETWORK') {
      mostrarToast('error', 'Erro de conexão. Verifique sua internet.')
    } else {
      mostrarToast('error', 'Erro ao comprar ingresso. Tente novamente.')
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading state -->
    <div v-if="eventoStore.loading && !eventoStore.evento" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Spinner class="mx-auto mb-4" />
        <p class="text-slate-500">Carregando...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="eventoStore.error && !eventoStore.evento" class="min-h-screen flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-slate-900 mb-2">Erro ao carregar evento</h2>
        <p class="text-slate-600 mb-6">{{ eventoStore.error }}</p>
        <router-link
          to="/"
          class="inline-flex items-center justify-center bg-primary text-white h-11 px-6 rounded-lg font-medium"
        >
          Voltar para o início
        </router-link>
      </div>
    </div>

    <!-- Formulário de compra -->
    <template v-else-if="eventoStore.evento">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 py-4 px-4">
        <div class="max-w-2xl mx-auto flex items-center gap-4">
          <router-link
            :to="{ name: 'evento-publico', params: { slug } }"
            class="text-slate-500 hover:text-slate-700"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          <div>
            <h1 class="font-semibold text-slate-900">Comprar Ingresso</h1>
            <p class="text-sm text-slate-500">{{ eventoStore.evento.nome }}</p>
          </div>
        </div>
      </header>

      <!-- Conteúdo -->
      <main class="py-8 px-4">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <!-- Ingresso selecionado -->
            <div v-if="tipoSelecionado" class="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-slate-900">{{ tipoSelecionado.nome }}</h3>
                  <p v-if="tipoSelecionado.descricao" class="text-sm text-slate-500 mt-1">
                    {{ tipoSelecionado.descricao }}
                  </p>
                </div>
                <div class="text-right">
                  <span
                    class="font-bold text-lg"
                    :class="isGratuito ? 'text-green-600' : 'text-primary'"
                  >
                    {{ precoFormatado }}
                  </span>
                </div>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-slate-900 mb-2">
              Seus dados
            </h2>
            <p class="text-slate-600 mb-8">
              Preencha seus dados para {{ isGratuito ? 'garantir seu ingresso' : 'continuar com a compra' }}
            </p>

            <!-- Erro geral -->
            <div
              v-if="errors._general"
              class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-red-700 text-sm">{{ errors._general[0] }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <Input
                v-model="form.nome"
                label="Nome completo"
                placeholder="Seu nome"
                required
                :error="errors.nome?.[0]"
              />

              <Input
                v-model="form.email"
                type="email"
                label="Email"
                placeholder="seu@email.com"
                required
                :error="errors.email?.[0]"
              />

              <Input
                :model-value="form.telefone"
                label="Telefone"
                placeholder="(00) 00000-0000"
                required
                :error="errors.telefone?.[0]"
                @input="onTelefoneInput"
              />

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  v-model="form.empresa"
                  label="Empresa"
                  placeholder="Nome da empresa (opcional)"
                  :error="errors.empresa?.[0]"
                />

                <Input
                  v-model="form.cargo"
                  label="Cargo"
                  placeholder="Seu cargo (opcional)"
                  :error="errors.cargo?.[0]"
                />
              </div>

              <Input
                v-model="form.cidade_uf"
                label="Cidade/UF"
                placeholder="Ex: São Paulo/SP (opcional)"
                :error="errors.cidade_uf?.[0]"
              />

              <div class="flex items-start gap-3">
                <input
                  id="aceite_termos"
                  v-model="form.aceite_termos"
                  type="checkbox"
                  class="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label for="aceite_termos" class="text-sm text-slate-600">
                  Concordo com os
                  <a href="#" class="text-primary hover:underline">termos de uso</a>
                  e a
                  <a href="#" class="text-primary hover:underline">política de privacidade</a>
                </label>
              </div>
              <p v-if="errors.aceite_termos" class="text-sm text-red-500 -mt-4">
                {{ errors.aceite_termos[0] }}
              </p>

              <Button
                type="submit"
                :loading="ingressosStore.loading"
                class="w-full"
              >
                {{ isGratuito ? 'Garantir ingresso gratuito' : 'Continuar para pagamento' }}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </template>

    <!-- Toast de feedback -->
    <Toast
      :show="showToast"
      :type="toastType"
      :message="toastMessage"
      @close="fecharToast"
    />
  </div>
</template>
