<script setup lang="ts">
import { computed } from 'vue'
import type { EventoPublico } from '@/types'

interface Props {
  evento: EventoPublico
}

const props = defineProps<Props>()

const googleMapsUrl = computed(() => {
  const endereco = encodeURIComponent(props.evento.local)
  return `https://www.google.com/maps/search/?api=1&query=${endereco}`
})

const dataHoraFormatada = computed(() => {
  const inicio = new Date(props.evento.data_inicio)
  const fim = new Date(props.evento.data_fim)

  const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return {
    inicio: formatoDataHora.format(inicio),
    fim: formatoDataHora.format(fim),
  }
})
</script>

<template>
  <div>
    <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
      Quando e onde
    </h2>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Data e Hora -->
      <div class="bg-slate-50 rounded-2xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 mb-2">Data e horário</h3>
            <p class="text-slate-600 text-sm mb-1">
              <span class="font-medium">Início:</span> {{ dataHoraFormatada.inicio }}
            </p>
            <p class="text-slate-600 text-sm">
              <span class="font-medium">Término:</span> {{ dataHoraFormatada.fim }}
            </p>
          </div>
        </div>
      </div>

      <!-- Local -->
      <div class="bg-slate-50 rounded-2xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-slate-900 mb-2">Local</h3>
            <p class="text-slate-600 text-sm mb-3">{{ evento.local }}</p>
            <a
              :href="googleMapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center text-primary text-sm font-medium hover:underline"
            >
              Ver no Google Maps
              <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
