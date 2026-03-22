<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Spinner from '@/components/ui/Spinner.vue'
import api from '@/services/api'
import type { Fatura, StatusFatura } from '@/types'

const router = useRouter()

const faturas = ref<Fatura[]>([])
const loading = ref(true)
const filtroStatus = ref<StatusFatura | 'todos'>('todos')
const busca = ref('')

const statusOptions: { value: StatusFatura | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'paga', label: 'Paga' },
  { value: 'vencida', label: 'Vencida' },
  { value: 'cancelada', label: 'Cancelada' },
]

const faturasFiltradas = computed(() => {
  let resultado = faturas.value

  if (filtroStatus.value !== 'todos') {
    resultado = resultado.filter(f => f.status === filtroStatus.value)
  }

  if (busca.value) {
    const termo = busca.value.toLowerCase()
    resultado = resultado.filter(f =>
      f.numero.toLowerCase().includes(termo) ||
      f.evento?.nome?.toLowerCase().includes(termo)
    )
  }

  return resultado
})

const metricas = computed(() => {
  const total = faturas.value.reduce((acc, f) => acc + f.total, 0)
  const pagas = faturas.value.filter(f => f.status === 'paga')
  const pendentes = faturas.value.filter(f => f.status === 'pendente')
  const totalPago = pagas.reduce((acc, f) => acc + f.total, 0)
  const totalPendente = pendentes.reduce((acc, f) => acc + f.total, 0)

  return {
    total,
    totalPago,
    totalPendente,
    qtdPagas: pagas.length,
    qtdPendentes: pendentes.length,
  }
})

async function carregarFaturas() {
  loading.value = true
  try {
    const response = await api.get('/admin/faturas', {
      params: { per_page: 100 }
    })
    faturas.value = response.data.data
  } catch (error) {
    console.error('Erro ao carregar faturas:', error)
  } finally {
    loading.value = false
  }
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

function getStatusVariant(status: StatusFatura): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'paga':
      return 'success'
    case 'pendente':
      return 'warning'
    case 'vencida':
      return 'danger'
    case 'cancelada':
      return 'default'
    case 'rascunho':
      return 'info'
    default:
      return 'default'
  }
}

function getStatusLabel(status: StatusFatura): string {
  switch (status) {
    case 'paga':
      return 'Paga'
    case 'pendente':
      return 'Pendente'
    case 'vencida':
      return 'Vencida'
    case 'cancelada':
      return 'Cancelada'
    case 'rascunho':
      return 'Rascunho'
    default:
      return status
  }
}

function verDetalhes(fatura: Fatura) {
  router.push(`/admin/faturas/${fatura.id}`)
}

onMounted(() => {
  carregarFaturas()
})
</script>

<template>
  <AppLayout title="Faturas">
    <div class="space-y-6">
      <!-- Header Editorial -->
      <div class="mb-10 max-w-5xl">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight font-headline">
              Faturas
            </h1>
            <p class="text-on-surface-variant text-lg mt-3 max-w-2xl">
              Gerencie todas as faturas do sistema.
            </p>
          </div>
        </div>
      </div>

      <!-- Metricas -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card class="p-5">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-secondary-container rounded-xl">
              <span class="material-symbols-outlined text-2xl text-primary">receipt_long</span>
            </div>
            <div>
              <p class="text-sm text-on-surface-variant">Total Faturas</p>
              <p class="text-2xl font-bold text-on-surface font-headline">
                {{ faturas.length }}
              </p>
            </div>
          </div>
        </Card>

        <Card class="p-5">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-tertiary-fixed rounded-xl">
              <span class="material-symbols-outlined text-2xl text-on-tertiary-container">schedule</span>
            </div>
            <div>
              <p class="text-sm text-on-surface-variant">Pendentes</p>
              <p class="text-2xl font-bold text-on-surface font-headline">
                {{ formatarMoeda(metricas.totalPendente) }}
              </p>
              <p class="text-xs text-on-surface-variant">{{ metricas.qtdPendentes }} faturas</p>
            </div>
          </div>
        </Card>

        <Card class="p-5">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-secondary-fixed rounded-xl">
              <span class="material-symbols-outlined text-2xl text-on-secondary-container">check_circle</span>
            </div>
            <div>
              <p class="text-sm text-on-surface-variant">Recebido</p>
              <p class="text-2xl font-bold text-primary font-headline">
                {{ formatarMoeda(metricas.totalPago) }}
              </p>
              <p class="text-xs text-on-surface-variant">{{ metricas.qtdPagas }} faturas</p>
            </div>
          </div>
        </Card>

        <Card class="p-5">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary/10 rounded-xl">
              <span class="material-symbols-outlined text-2xl text-primary">account_balance</span>
            </div>
            <div>
              <p class="text-sm text-on-surface-variant">Volume Total</p>
              <p class="text-2xl font-bold text-on-surface font-headline">
                {{ formatarMoeda(metricas.total) }}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px] max-w-sm">
          <Input v-model="busca" placeholder="Buscar por numero ou evento...">
            <template #prefix>
              <span class="material-symbols-outlined text-on-surface-variant">search</span>
            </template>
          </Input>
        </div>

        <div class="flex gap-1 bg-surface-container-high rounded-xl p-1">
          <button
            v-for="opt in statusOptions"
            :key="opt.value"
            @click="filtroStatus = opt.value"
            class="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            :class="filtroStatus === opt.value ? 'bg-surface-container-lowest text-on-surface signature-shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>

      <!-- Empty State -->
      <div v-else-if="faturasFiltradas.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 bg-secondary-container rounded-2xl flex items-center justify-center">
          <span class="material-symbols-outlined text-4xl text-primary">receipt_long</span>
        </div>
        <h3 class="text-xl font-bold text-on-surface font-headline">Nenhuma fatura</h3>
        <p class="mt-2 text-on-surface-variant max-w-md mx-auto">
          {{ busca || filtroStatus !== 'todos' ? 'Nenhuma fatura encontrada com os filtros aplicados.' : 'Nenhuma fatura registrada no sistema.' }}
        </p>
      </div>

      <!-- Lista de Faturas -->
      <Card v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-outline-variant/20">
                <th class="text-left px-6 py-4 text-sm font-semibold text-on-surface-variant">Numero</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-on-surface-variant">Evento</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-on-surface-variant">Status</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-on-surface-variant">Vencimento</th>
                <th class="text-right px-6 py-4 text-sm font-semibold text-on-surface-variant">Valor</th>
                <th class="text-right px-6 py-4 text-sm font-semibold text-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="fatura in faturasFiltradas"
                :key="fatura.id"
                class="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors cursor-pointer"
                @click="verDetalhes(fatura)"
              >
                <td class="px-6 py-4">
                  <span class="font-mono font-semibold text-on-surface">{{ fatura.numero }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-on-surface">{{ fatura.evento?.nome || '-' }}</span>
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="getStatusVariant(fatura.status)" size="sm">
                    {{ getStatusLabel(fatura.status) }}
                  </Badge>
                </td>
                <td class="px-6 py-4">
                  <span class="text-on-surface-variant">{{ formatarData(fatura.vencimento) }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="font-semibold text-on-surface">{{ formatarMoeda(fatura.total) }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <Button size="sm" variant="ghost" @click.stop="verDetalhes(fatura)">
                    <span class="material-symbols-outlined">chevron_right</span>
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
