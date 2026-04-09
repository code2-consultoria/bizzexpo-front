<script setup lang="ts">
import { computed } from 'vue'
import type { EventoPublico } from '@/types'

interface Props {
  evento: EventoPublico
}

const props = defineProps<Props>()

const dataFormatada = computed(() => {
  const inicio = new Date(props.evento.data_inicio)
  const fim = new Date(props.evento.data_fim)

  const formatoData = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (inicio.toDateString() === fim.toDateString()) {
    return formatoData.format(inicio)
  }

  return `${formatoData.format(inicio)} - ${formatoData.format(fim)}`
})

const bannerUrl = computed(() => {
  return props.evento.banner || '/images/evento-default-banner.jpg'
})
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- Banner de fundo -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${bannerUrl})` }"
    >
      <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80"></div>
    </div>

    <!-- Conteúdo -->
    <div class="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
      <div class="flex flex-col items-center text-center">
        <!-- Logo do evento -->
        <div v-if="evento.logo" class="mb-6">
          <img
            :src="evento.logo"
            :alt="evento.nome"
            class="h-24 md:h-32 w-auto object-contain"
          />
        </div>

        <!-- Nome do evento -->
        <h1 class="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight mb-4">
          {{ evento.nome }}
        </h1>

        <!-- Data e local -->
        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-white/90 mb-8">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-lg">{{ dataFormatada }}</span>
          </div>
          <div class="hidden md:block w-1.5 h-1.5 rounded-full bg-white/50"></div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="text-lg">{{ evento.local }}</span>
          </div>
        </div>

        <!-- Botão de inscrição -->
        <router-link
          :to="{ name: 'evento-inscricao', params: { slug: evento.slug } }"
          class="inline-flex items-center justify-center h-14 px-10 rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] transition-transform active:scale-95 text-white"
          style="background-color: var(--evento-primary, #006b44); box-shadow: 0 10px 15px -3px color-mix(in srgb, var(--evento-primary, #006b44) 30%, transparent)"
        >
          Inscreva-se agora
          <svg class="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </router-link>

        <!-- Contador de inscritos -->
        <p v-if="evento.total_inscricoes > 0" class="mt-4 text-white/70 text-sm">
          {{ evento.total_inscricoes }} participantes inscritos
        </p>
      </div>
    </div>
  </section>
</template>
