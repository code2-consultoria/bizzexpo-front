<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventoPublicoStore } from '@/stores/eventoPublico'
import { useInscricoesStore } from '@/stores/inscricoes'
import type { InscricaoForm } from '@/types'
import InscricaoFormComponent from '@/components/evento/InscricaoForm.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Toast from '@/components/ui/Toast.vue'

const route = useRoute()
const router = useRouter()
const eventoStore = useEventoPublicoStore()
const inscricoesStore = useInscricoesStore()

const slug = route.params.slug as string
const errors = ref<Record<string, string[]>>({})

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

onMounted(async () => {
  // Carrega evento e categorias se ainda nao foram carregados
  if (!eventoStore.evento || eventoStore.evento.slug !== slug) {
    await eventoStore.fetchEvento(slug)
  }

  if (eventoStore.categorias.length === 0) {
    await eventoStore.fetchCategorias(slug)
  }
})

const handleSubmit = async (dados: InscricaoForm) => {
  errors.value = {}

  try {
    const inscricao = await inscricoesStore.criarInscricao(slug, dados)

    // Redireciona para pagina de confirmacao
    router.push({
      name: 'evento-confirmacao',
      params: { slug, qrcode: inscricao.qrcode },
    })
  } catch (err: any) {
    if (err.response?.status === 422) {
      // Erros de validacao
      if (err.response.data.errors) {
        errors.value = err.response.data.errors
      } else if (err.response.data.message) {
        // Mensagem de erro de negocio (ex: inscricao duplicada)
        errors.value = { _general: [err.response.data.message] }
      }
    } else if (err.response?.status === 404) {
      mostrarToast('error', 'Evento nao encontrado.')
    } else if (err.response?.status >= 500) {
      mostrarToast('error', 'Erro no servidor. Tente novamente em alguns instantes.')
    } else if (err.code === 'ERR_NETWORK') {
      mostrarToast('error', 'Erro de conexao. Verifique sua internet.')
    } else {
      mostrarToast('error', 'Erro ao realizar inscricao. Tente novamente.')
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
          Voltar para o inicio
        </router-link>
      </div>
    </div>

    <!-- Formulario de inscricao -->
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
            <h1 class="font-semibold text-slate-900">Inscricao</h1>
            <p class="text-sm text-slate-500">{{ eventoStore.evento.nome }}</p>
          </div>
        </div>
      </header>

      <!-- Conteudo -->
      <main class="py-8 px-4">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h2 class="text-2xl font-bold text-slate-900 mb-2">
              Faca sua inscricao
            </h2>
            <p class="text-slate-600 mb-8">
              Preencha seus dados para se inscrever no evento
            </p>

            <!-- Erro geral -->
            <div
              v-if="errors._general"
              class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p class="text-red-700 text-sm">{{ errors._general[0] }}</p>
            </div>

            <InscricaoFormComponent
              :categorias="eventoStore.categorias"
              :loading="inscricoesStore.loading"
              :errors="errors"
              @submit="handleSubmit"
            />
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
