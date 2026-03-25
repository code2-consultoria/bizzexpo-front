<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckinStore } from '@/stores/checkin'
import { useEventosStore } from '@/stores/eventos'
import { useCategoriasStore } from '@/stores/categorias'
import type { InscricaoForm } from '@/types'
import WalkinForm from '@/components/checkin/WalkinForm.vue'
import CheckinConfirmacao from '@/components/checkin/CheckinConfirmacao.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Toast from '@/components/ui/Toast.vue'

const route = useRoute()
const router = useRouter()
const checkinStore = useCheckinStore()
const eventosStore = useEventosStore()
const categoriasStore = useCategoriasStore()

const eventoId = route.params.eventoId as string
const errors = ref<Record<string, string[]>>({})
const estado = ref<'formulario' | 'sucesso'>('formulario')

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
  await Promise.all([
    eventosStore.fetchEvento(eventoId),
    categoriasStore.fetchCategorias(eventoId),
  ])
})

const handleSubmit = async (dados: InscricaoForm) => {
  errors.value = {}

  try {
    await checkinStore.registrarWalkin(eventoId, dados)
    estado.value = 'sucesso'
  } catch (err: any) {
    if (err.response?.status === 422) {
      if (err.response.data.errors) {
        errors.value = err.response.data.errors
      } else if (err.response.data.message) {
        errors.value = { _general: [err.response.data.message] }
      }
    } else if (err.response?.status === 403) {
      mostrarToast('error', 'Voce nao tem permissao para registrar walk-in neste evento.')
    } else if (err.response?.status === 404) {
      mostrarToast('error', 'Evento nao encontrado.')
    } else if (err.response?.status >= 500) {
      mostrarToast('error', 'Erro no servidor. Tente novamente em alguns instantes.')
    } else if (err.code === 'ERR_NETWORK') {
      mostrarToast('error', 'Erro de conexao. Verifique sua internet.')
    } else {
      mostrarToast('error', 'Erro ao registrar walk-in. Tente novamente.')
    }
  }
}

const handleCancelar = () => {
  router.push({ name: 'checkin-staff', params: { eventoId } })
}

const handleNovoCheckin = () => {
  estado.value = 'formulario'
  checkinStore.limpar()
  errors.value = {}
}

const voltarParaCheckin = () => {
  router.push({ name: 'checkin-staff', params: { eventoId } })
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <button
          @click="voltarParaCheckin"
          class="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao check-in
        </button>
        <h1 class="text-2xl font-bold text-slate-900">Walk-in</h1>
        <p class="text-slate-500">{{ eventosStore.eventoAtual?.nome }}</p>
      </div>

      <!-- Loading -->
      <div v-if="categoriasStore.loading" class="text-center py-12">
        <Spinner class="mx-auto mb-4" />
        <p class="text-slate-500">Carregando categorias...</p>
      </div>

      <!-- Conteudo -->
      <div v-else class="bg-white rounded-2xl border border-slate-200 p-6">
        <!-- Estado: Formulario -->
        <template v-if="estado === 'formulario'">
          <!-- Erro geral -->
          <div
            v-if="errors._general"
            class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p class="text-red-700 text-sm">{{ errors._general[0] }}</p>
          </div>

          <WalkinForm
            :categorias="categoriasStore.categorias"
            :loading="checkinStore.loading"
            :errors="errors"
            @submit="handleSubmit"
            @cancelar="handleCancelar"
          />
        </template>

        <!-- Estado: Sucesso -->
        <template v-else-if="estado === 'sucesso' && checkinStore.checkinResult">
          <CheckinConfirmacao
            :result="checkinStore.checkinResult"
            @novo-checkin="handleNovoCheckin"
          />
        </template>
      </div>
    </div>

    <!-- Toast de feedback -->
    <Toast
      :show="showToast"
      :type="toastType"
      :message="toastMessage"
      @close="fecharToast"
    />
  </AppLayout>
</template>
