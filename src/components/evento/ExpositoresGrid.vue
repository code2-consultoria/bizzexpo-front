<script setup lang="ts">
import type { ExpositorPublico } from '@/types'

interface Props {
  expositores: ExpositorPublico[]
}

defineProps<Props>()
</script>

<template>
  <div class="bg-slate-50 rounded-2xl p-6 lg:p-8">
    <div class="text-center mb-8">
      <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        Expositores Confirmados
      </h2>
      <p class="text-slate-600">
        Conhea as empresas e marcas que estarao presentes no evento
      </p>
    </div>

    <div
      v-if="expositores.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
    >
      <div
        v-for="expositor in expositores"
        :key="expositor.id"
        class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md hover:border-primary/30 transition-all group"
      >
        <!-- Logo ou placeholder -->
        <div class="aspect-square flex items-center justify-center mb-3">
          <img
            v-if="expositor.logo"
            :src="expositor.logo"
            :alt="expositor.nome_empresa"
            class="max-h-16 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
          />
          <div
            v-else
            class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center"
          >
            <span class="text-xl font-bold text-slate-400">
              {{ expositor.nome_empresa.charAt(0) }}
            </span>
          </div>
        </div>

        <!-- Nome da empresa -->
        <h3 class="text-sm font-semibold text-slate-900 text-center line-clamp-2">
          {{ expositor.nome_empresa }}
        </h3>

        <!-- Estandes -->
        <p v-if="expositor.estandes && expositor.estandes.length > 0" class="mt-2 text-xs text-slate-500 text-center">
          {{ expositor.estandes.map(e => e.nome).join(', ') }}
        </p>
      </div>
    </div>

    <div v-else class="text-center py-8">
      <svg class="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-slate-500">Em breve divulgaremos os expositores</p>
    </div>
  </div>
</template>
