<script setup lang="ts">
const problems = [
  {
    icon: 'timer',
    title: 'Filas Longas',
    description: 'Visitantes passam mais tempo nas filas do credenciamento do que explorando o evento, impactando sua experiencia.',
  },
  {
    icon: 'database',
    title: 'Dados Perdidos',
    description: 'Informacoes valiosas sobre visitantes e leads nao sao capturadas ou se perdem em planilhas desorganizadas.',
  },
  {
    icon: 'chart',
    title: 'ROI Invisivel',
    description: 'Impossivel medir o retorno real do investimento sem metricas claras e dados de conversao em tempo real.',
  },
  {
    icon: 'cog',
    title: 'Processos Manuais',
    description: 'Equipes sobrecarregadas com tarefas repetitivas que poderiam ser automatizadas de forma inteligente.',
  },
]
</script>

<template>
  <section class="bg-white py-20 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-gray-900 text-3xl md:text-4xl font-bold mb-4">
          O que esta custando o sucesso do seu evento?
        </h2>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto">
          Identifique os principais obstaculos que impedem o organizador de alcancar o verdadeiro potencial do evento.
        </p>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="problem in problems"
          :key="problem.title"
          class="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all"
        >
          <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <svg v-if="problem.icon === 'timer'" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-if="problem.icon === 'database'" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <svg v-if="problem.icon === 'chart'" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <svg v-if="problem.icon === 'cog'" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-gray-900 text-lg font-bold mb-2">{{ problem.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ problem.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
