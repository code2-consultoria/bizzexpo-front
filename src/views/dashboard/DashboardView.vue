<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import api from '@/services/api'
import type { Evento } from '@/types'

const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)

const metricas = ref({
  total_eventos: 0,
  eventos_ativos: 0,
  total_expositores: 0,
})
const eventosRecentes = ref<Evento[]>([])

onMounted(async () => {
  try {
    const response = await api.get('/dashboard')
    metricas.value = response.data.data.metricas
    eventosRecentes.value = response.data.data.eventos_recentes
  } catch (e: any) {
    if (e.response?.status === 403) {
      router.push('/organizador/cadastro')
    } else {
      error.value = 'Erro ao carregar dashboard'
    }
  } finally {
    loading.value = false
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'publicado':
      return { label: 'Ativo', class: 'bg-green-100 text-green-700' }
    case 'rascunho':
    case 'pago':
      return { label: 'Planeamento', class: 'bg-cyan-100 text-cyan-700' }
    case 'encerrado':
      return { label: 'Finalizado', class: 'bg-gray-100 text-gray-600' }
    default:
      return { label: status, class: 'bg-gray-100 text-gray-600' }
  }
}
</script>

<template>
  <AppLayout title="Dashboard">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-600">{{ error }}</p>
    </div>

    <!-- Conteudo -->
    <div v-else class="space-y-6">
      <!-- Cards de métricas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Total de eventos -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total de eventos</p>
            <p class="text-2xl font-bold text-gray-900">{{ metricas.total_eventos }}</p>
          </div>
        </div>

        <!-- Eventos ativos -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Eventos ativos</p>
            <p class="text-2xl font-bold text-gray-900">{{ metricas.eventos_ativos }}</p>
          </div>
        </div>

        <!-- Total de expositores -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total de expositores</p>
            <p class="text-2xl font-bold text-gray-900">{{ metricas.total_expositores }}</p>
          </div>
        </div>
      </div>

      <!-- Header eventos com botão -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Eventos recentes</h2>
        <div class="flex items-center gap-3">
          <router-link to="/eventos" class="text-sm text-primary font-medium hover:underline">
            Ver todos
          </router-link>
          <Button @click="router.push('/eventos/criar')">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo evento
          </Button>
        </div>
      </div>

      <!-- Tabela eventos recentes -->
      <div class="bg-white rounded-xl border border-gray-200">

        <!-- Tabela -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Expositores
                </th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="evento in eventosRecentes" :key="evento.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <span class="text-sm font-medium text-gray-900">{{ evento.nome }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600">{{ formatDate(evento.data_inicio) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600">{{ evento.expositores_count || 0 }}</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusBadge(evento.status).class"
                  >
                    {{ getStatusBadge(evento.status).label }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="router.push(`/eventos/${evento.id}`)"
                    class="text-sm text-gray-500 hover:text-primary font-medium"
                  >
                    Editar
                  </button>
                </td>
              </tr>

              <!-- Estado vazio -->
              <tr v-if="eventosRecentes.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  Nenhum evento encontrado. Crie seu primeiro evento!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
