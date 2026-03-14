<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import StatusBadge from '@/components/eventos/StatusBadge.vue'
import { useEventosStore } from '@/stores/eventos'

const route = useRoute()
const router = useRouter()
const eventosStore = useEventosStore()

const confirmDelete = ref(false)
const statusLoading = ref(false)
const linkCopiado = ref(false)

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
      return 'pago'
    case 'pago':
      return 'publicado'
    case 'publicado':
      return 'encerrado'
    default:
      return null
  }
}

function getNextStatusLabel(status: string): string {
  switch (status) {
    case 'pago':
      return 'Marcar como Pago'
    case 'publicado':
      return 'Publicar'
    case 'encerrado':
      return 'Encerrar'
    default:
      return ''
  }
}
</script>

<template>
  <AppLayout>
    <div v-if="eventosStore.loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else-if="eventosStore.eventoAtual" class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" size="sm" @click="router.push('/eventos')">
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/editar`)"
          >
            Editar
          </Button>
          <Button variant="danger" @click="handleDelete">
            {{ confirmDelete ? 'Confirmar Exclusao' : 'Excluir' }}
          </Button>
        </div>
      </div>

      <Card>
        <div class="flex items-start justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ eventosStore.eventoAtual.nome }}</h1>
            <p class="text-gray-500 mt-1">{{ eventosStore.eventoAtual.local }}</p>
          </div>
          <StatusBadge :status="eventosStore.eventoAtual.status" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 class="text-sm font-medium text-gray-500">Data de Inicio</h3>
            <p class="mt-1 text-gray-900">{{ formatDate(eventosStore.eventoAtual.data_inicio) }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500">Data de Termino</h3>
            <p class="mt-1 text-gray-900">{{ formatDate(eventosStore.eventoAtual.data_fim) }}</p>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-sm font-medium text-gray-500">Descricao</h3>
          <p class="mt-1 text-gray-900 whitespace-pre-wrap">
            {{ eventosStore.eventoAtual.descricao }}
          </p>
        </div>

        <!-- Link para divulgacao -->
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 class="text-sm font-medium text-blue-800 mb-2">Link para divulgacao</h3>
          <div class="flex items-center gap-2">
            <input
              type="text"
              readonly
              :value="linkEvento"
              class="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-gray-700 select-all"
              @focus="($event.target as HTMLInputElement).select()"
            />
            <Button
              variant="secondary"
              size="sm"
              @click="copiarLink"
            >
              <svg v-if="!linkCopiado" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ linkCopiado ? 'Copiado!' : 'Copiar' }}
            </Button>
          </div>
          <p class="text-xs text-blue-600 mt-2">
            Compartilhe este link para visitantes se inscreverem no evento.
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/expositores`)"
          >
            Expositores
          </Button>
          <Button
            variant="secondary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/categorias`)"
          >
            Categorias
          </Button>
          <Button
            variant="secondary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/staff`)"
          >
            Staff
          </Button>
          <Button
            variant="secondary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/inscricoes`)"
          >
            Inscricoes
          </Button>
        </div>

        <div
          v-if="eventosStore.eventoAtual.status === 'publicado'"
          class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4"
        >
          <Button
            variant="primary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/checkin`)"
          >
            <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Check-in Staff
          </Button>
          <Button
            variant="secondary"
            @click="router.push(`/eventos/${eventosStore.eventoAtual.id}/checkin/walkin`)"
          >
            Walk-in
          </Button>
          <Button
            variant="ghost"
            @click="router.push({ name: 'checkin-totem', params: { slug: eventosStore.eventoAtual.slug } })"
          >
            Totem
          </Button>
        </div>

        <div class="flex items-center justify-end pt-4 border-t border-gray-200 mt-4">
          <div v-if="getNextStatus(eventosStore.eventoAtual.status)" class="flex items-center gap-2">
            <Button
              :loading="statusLoading"
              @click="handleStatusChange(getNextStatus(eventosStore.eventoAtual.status)!)"
            >
              {{ getNextStatusLabel(getNextStatus(eventosStore.eventoAtual.status)!) }}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
