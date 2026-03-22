<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import StatusBadge from './StatusBadge.vue'
import type { Evento } from '@/types'

interface Props {
  evento: Evento
}

const props = defineProps<Props>()

const statusFatura = computed(() => {
  if (props.evento.fatura_paga) {
    return { label: 'Pago', class: 'bg-green-100 text-green-700' }
  }
  return { label: 'Nao pago', class: 'bg-amber-100 text-amber-700' }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <Card padding="none" class="overflow-hidden">
    <RouterLink :to="`/eventos/${evento.id}`" class="block">
      <div class="p-6">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ evento.nome }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ evento.local }}</p>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <StatusBadge :status="evento.status" />
            <span
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              :class="statusFatura.class"
            >
              {{ statusFatura.label }}
            </span>
          </div>
        </div>

        <div class="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{{ formatDate(evento.data_inicio) }}</span>
          </div>
        </div>
      </div>
    </RouterLink>
  </Card>
</template>
