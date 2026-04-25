<script setup lang="ts">
import type { DashboardExpositor } from '@/types'

interface Props {
  dashboard: DashboardExpositor
}

defineProps<Props>()

const getInteresseColor = (nivel: string) => {
  const cores: Record<string, string> = {
    orcamento: 'bg-red-500',
    profissional: 'bg-amber-500',
    entusiasta: 'bg-blue-500',
    conhecendo: 'bg-slate-400',
  }
  return cores[nivel] || 'bg-slate-400'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cards de metricas principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Total de leads -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Total de leads</p>
            <p class="text-3xl font-bold text-slate-900">{{ dashboard.metricas.total_leads }}</p>
          </div>
        </div>
      </div>

      <!-- Leads hoje -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Leads hoje</p>
            <p class="text-3xl font-bold text-slate-900">{{ dashboard.metricas.leads_hoje }}</p>
          </div>
        </div>
      </div>

      <!-- Info do evento -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm text-slate-500">Evento</p>
            <p class="text-lg font-semibold text-slate-900 truncate">{{ dashboard.evento.nome }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Distribuição por nível de interesse -->
    <div class="bg-white rounded-xl border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">Leads por nível de interesse</h3>

      <div class="space-y-4">
        <div
          v-for="item in dashboard.metricas.leads_por_interesse"
          :key="item.nivel"
          class="flex items-center gap-4"
        >
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium text-slate-700">{{ item.label }}</span>
              <span class="text-sm text-slate-500">{{ item.total }}</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                :class="getInteresseColor(item.nivel)"
                :style="{
                  width: dashboard.metricas.total_leads > 0
                    ? `${(item.total / dashboard.metricas.total_leads) * 100}%`
                    : '0%',
                }"
                class="h-full rounded-full transition-all"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="dashboard.metricas.total_leads === 0" class="text-center py-8">
        <p class="text-slate-500">Nenhum lead capturado ainda</p>
      </div>
    </div>
  </div>
</template>
