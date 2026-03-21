<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useEventosStore } from '@/stores/eventos'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const eventosStore = useEventosStore()
const authStore = useAuthStore()

const confirmDelete = ref(false)
const statusLoading = ref(false)
const linkCopiado = ref(false)

// Modal de pagamento (admin)
const showPagamentoModal = ref(false)
const pagamentoForm = ref({
  valor: '',
  observacao: '',
})
const pagamentoLoading = ref(false)
const pagamentoError = ref('')

const linkEvento = computed(() => {
  if (!eventosStore.eventoAtual?.slug) return ''
  return `${window.location.origin}/evento/${eventosStore.eventoAtual.slug}`
})

async function copiarLink() {
  if (!linkEvento.value) return
  await navigator.clipboard.writeText(linkEvento.value)
  linkCopiado.value = true
  setTimeout(() => {
    linkCopiado.value = false
  }, 2000)
}

onMounted(() => {
  eventosStore.fetchEvento(route.params.id as string)
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleDelete() {
  if (!confirmDelete.value) {
    confirmDelete.value = true
    return
  }
  await eventosStore.deleteEvento(route.params.id as string)
  router.push('/eventos')
}

async function handleStatusChange(newStatus: string) {
  statusLoading.value = true
  try {
    await eventosStore.alterarStatus(route.params.id as string, newStatus)
  } finally {
    statusLoading.value = false
  }
}

function getNextStatus(currentStatus: string): string | null {
  switch (currentStatus) {
    case 'rascunho':
      return null // Somente admin pode marcar como pago via endpoint específico
    case 'pago':
      return 'publicado'
    case 'publicado':
      return 'encerrado'
    default:
      return null
  }
}

// Verifica se admin pode marcar como pago
const canMarkAsPaid = computed(() => {
  return authStore.isAdmin && eventosStore.eventoAtual?.status === 'rascunho'
})

async function handleMarcarComoPago() {
  if (!pagamentoForm.value.valor) {
    pagamentoError.value = 'Informe o valor do pagamento'
    return
  }

  const valor = parseFloat(pagamentoForm.value.valor.replace(',', '.'))
  if (isNaN(valor) || valor <= 0) {
    pagamentoError.value = 'Valor inválido'
    return
  }

  pagamentoLoading.value = true
  pagamentoError.value = ''

  try {
    await eventosStore.marcarComoPago(
      route.params.id as string,
      valor,
      pagamentoForm.value.observacao || undefined
    )
    showPagamentoModal.value = false
    pagamentoForm.value = { valor: '', observacao: '' }
  } catch (error: any) {
    pagamentoError.value = error.response?.data?.message || 'Erro ao marcar como pago'
  } finally {
    pagamentoLoading.value = false
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'publicado':
      return { label: 'Publicado', class: 'bg-green-100 text-green-700' }
    case 'rascunho':
      return { label: 'Rascunho', class: 'bg-gray-100 text-gray-600' }
    case 'pago':
      return { label: 'Pago', class: 'bg-cyan-100 text-cyan-700' }
    case 'encerrado':
      return { label: 'Encerrado', class: 'bg-red-100 text-red-600' }
    default:
      return { label: status, class: 'bg-gray-100 text-gray-600' }
  }
}
</script>

<template>
  <AppLayout>
    <!-- Loading -->
    <div v-if="eventosStore.loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else-if="eventosStore.eventoAtual" class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/eventos')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 class="text-2xl font-bold text-gray-900">{{ eventosStore.eventoAtual.nome }}</h1>
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="getStatusBadge(eventosStore.eventoAtual.status).class"
          >
            {{ getStatusBadge(eventosStore.eventoAtual.status).label }}
          </span>
        </div>
        <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <!-- Conteudo -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Coluna Principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Card Detalhes -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Detalhes do Evento</h2>

            <!-- Data e Hora -->
            <div class="flex items-start gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Data e Hora</p>
                <p class="text-sm text-gray-900">
                  {{ formatDate(eventosStore.eventoAtual.data_inicio) }} as {{ formatTime(eventosStore.eventoAtual.data_inicio) }}
                </p>
              </div>
            </div>

            <!-- Localizacao -->
            <div class="flex items-start gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Localizacao</p>
                <p class="text-sm text-gray-900">{{ eventosStore.eventoAtual.local }}</p>
              </div>
            </div>

            <!-- Descricao -->
            <div class="mb-6">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descricao</p>
              <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {{ eventosStore.eventoAtual.descricao }}
              </p>
            </div>

            <!-- Botoes de navegacao -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-gray-100">
              <button
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/expositores`)"
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Expositores</span>
              </button>
              <button
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/categorias`)"
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Categorias</span>
              </button>
              <button
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/staff`)"
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Staff</span>
              </button>
              <button
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/inscricoes`)"
                class="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span class="text-sm font-medium text-gray-700">Inscricoes</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Card de Fatura -->
          <div
            v-if="eventosStore.eventoAtual.fatura"
            class="bg-white rounded-xl border border-gray-200 p-5"
            :class="{
              'border-amber-300 bg-amber-50': eventosStore.eventoAtual.fatura.status === 'pendente',
              'border-green-300 bg-green-50': eventosStore.eventoAtual.fatura.status === 'paga',
            }"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Fatura do Evento</h3>
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="{
                  'bg-amber-100 text-amber-700': eventosStore.eventoAtual.fatura.status === 'pendente',
                  'bg-green-100 text-green-700': eventosStore.eventoAtual.fatura.status === 'paga',
                  'bg-gray-100 text-gray-600': !['pendente', 'paga'].includes(eventosStore.eventoAtual.fatura.status),
                }"
              >
                {{ eventosStore.eventoAtual.fatura.status === 'pendente' ? 'Pendente' :
                   eventosStore.eventoAtual.fatura.status === 'paga' ? 'Paga' :
                   eventosStore.eventoAtual.fatura.status }}
              </span>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Numero:</span>
                <span class="font-medium text-gray-900">#{{ eventosStore.eventoAtual.fatura.numero }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Valor:</span>
                <span class="font-semibold text-gray-900">
                  {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(eventosStore.eventoAtual.fatura.total) }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Vencimento:</span>
                <span class="text-gray-900">
                  {{ new Date(eventosStore.eventoAtual.fatura.vencimento).toLocaleDateString('pt-BR') }}
                </span>
              </div>
            </div>

            <router-link
              v-if="eventosStore.eventoAtual.fatura.status === 'pendente'"
              :to="`/faturas/${eventosStore.eventoAtual.fatura.id}/pagar`"
              class="block w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-center font-semibold rounded-lg transition-colors"
            >
              Pagar Fatura
            </router-link>
            <router-link
              v-else
              :to="`/faturas/${eventosStore.eventoAtual.fatura.id}`"
              class="block w-full py-2.5 border border-gray-300 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver Detalhes
            </router-link>
          </div>

          <!-- Link de Promocao -->
          <div class="bg-primary/5 rounded-xl border border-primary/20 p-5">
            <h3 class="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Link de Promocao</h3>
            <div class="flex items-center gap-2">
              <input
                type="text"
                readonly
                :value="linkEvento"
                class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 truncate"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <button
                @click="copiarLink"
                class="p-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                <svg v-if="!linkCopiado" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-primary/70 mt-2">
              Compartilhe este link para atrair mais participantes.
            </p>
          </div>

          <!-- Acoes Rapidas -->
          <div class="bg-white rounded-xl border border-gray-200 p-5">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Acoes Rapidas</h3>
            <div class="space-y-2">
              <button
                v-if="eventosStore.eventoAtual.status === 'publicado'"
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/checkin`)"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Check-in Staff</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="eventosStore.eventoAtual.status === 'publicado'"
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/checkin/walkin`)"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Inscricao Walk-in</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                v-if="eventosStore.eventoAtual.status === 'publicado'"
                @click="router.push({ name: 'checkin-totem', params: { slug: eventosStore.eventoAtual.slug } })"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Configurar Totem</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/editar`)"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Editar Evento</span>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Botao Marcar como Pago (Admin) -->
          <div v-if="canMarkAsPaid" class="bg-amber-50 rounded-xl border border-amber-200 p-5">
            <h3 class="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">Acao Administrativa</h3>
            <p class="text-sm text-amber-600 mb-4">
              Este evento esta em rascunho. Marque como pago para liberar a publicacao.
            </p>
            <button
              @click="showPagamentoModal = true"
              class="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Marcar como Pago
            </button>
          </div>

          <!-- Botao Encerrar/Excluir -->
          <div class="space-y-3">
            <button
              v-if="getNextStatus(eventosStore.eventoAtual.status)"
              :disabled="statusLoading"
              @click="handleStatusChange(getNextStatus(eventosStore.eventoAtual.status)!)"
              class="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {{ eventosStore.eventoAtual.status === 'publicado' ? 'Encerrar Evento' : 'Publicar Evento' }}
            </button>

            <button
              @click="handleDelete"
              class="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
            >
              {{ confirmDelete ? 'Confirmar Exclusao' : 'Excluir Evento' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Marcar como Pago -->
    <Teleport to="body">
      <div
        v-if="showPagamentoModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="showPagamentoModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="p-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-900">Marcar Evento como Pago</h2>
            <p class="text-sm text-gray-500 mt-1">
              {{ eventosStore.eventoAtual?.nome }}
            </p>
          </div>

          <div class="p-6 space-y-4">
            <div v-if="pagamentoError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {{ pagamentoError }}
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Valor do Pagamento *
              </label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                <input
                  v-model="pagamentoForm.valor"
                  type="text"
                  inputmode="decimal"
                  placeholder="0,00"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Observacao (opcional)
              </label>
              <textarea
                v-model="pagamentoForm.observacao"
                rows="3"
                placeholder="Ex: Pagamento via transferencia bancaria"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-gray-100 flex gap-3">
            <button
              @click="showPagamentoModal = false"
              :disabled="pagamentoLoading"
              class="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              @click="handleMarcarComoPago"
              :disabled="pagamentoLoading"
              class="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Spinner v-if="pagamentoLoading" size="sm" />
              <span v-else>Confirmar Pagamento</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
