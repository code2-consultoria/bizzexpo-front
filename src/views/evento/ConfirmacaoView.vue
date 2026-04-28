<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEventoPublicoStore } from '@/stores/eventoPublico'
import { useIngressosStore } from '@/stores/ingressos'
import QRCodeIngressoConfirmacao from '@/components/evento/QRCodeIngressoConfirmacao.vue'
import AdicionarCalendario from '@/components/evento/AdicionarCalendario.vue'
import Spinner from '@/components/ui/Spinner.vue'

const route = useRoute()
const eventoStore = useEventoPublicoStore()
const ingressosStore = useIngressosStore()

const slug = route.params.slug as string
const qrcodeParam = route.params.qrcode as string

// Titulo dinamico baseado no status do ingresso
const titulo = computed(() => {
  const ingresso = ingressosStore.ingressoAtual
  if (!ingresso) return 'Ingresso'

  if (ingresso.status === 'confirmado') {
    return 'Ingresso confirmado!'
  }
  if (ingresso.status === 'aguardando_pagamento') {
    return 'Aguardando pagamento'
  }
  return 'Ingresso'
})

onMounted(async () => {
  // Carrega evento se ainda nao foi carregado
  if (!eventoStore.evento || eventoStore.evento.slug !== slug) {
    await eventoStore.fetchEvento(slug)
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Loading state -->
    <div v-if="eventoStore.loading && !eventoStore.evento" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Spinner class="mx-auto mb-4" />
        <p class="text-slate-500">Carregando...</p>
      </div>
    </div>

    <!-- Confirmacao -->
    <template v-else>
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 py-4 px-4">
        <div class="max-w-2xl mx-auto flex items-center gap-4">
          <router-link
            :to="{ name: 'evento-publico', params: { slug } }"
            class="text-slate-500 hover:text-slate-700"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          <div>
            <h1 class="font-semibold text-slate-900">{{ titulo }}</h1>
            <p v-if="eventoStore.evento" class="text-sm text-slate-500">{{ eventoStore.evento.nome }}</p>
          </div>
        </div>
      </header>

      <!-- Conteudo -->
      <main class="py-8 px-4">
        <div class="max-w-lg mx-auto">
          <!-- QR Code e dados do ingresso -->
          <QRCodeIngressoConfirmacao
            v-if="ingressosStore.ingressoAtual"
            :ingresso="ingressosStore.ingressoAtual"
          />

          <!-- Fallback se nao tiver ingresso no store (usuario acessou direto) -->
          <div
            v-else
            class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div class="bg-gradient-to-r from-primary to-primary/80 text-white p-6 text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold mb-1">Ingresso</h2>
              <p class="text-white/80">Codigo: {{ qrcodeParam }}</p>
            </div>

            <div class="p-6 text-center">
              <p class="text-slate-600">
                Verifique seu e-mail para mais detalhes sobre o ingresso.
              </p>
            </div>
          </div>

          <!-- Acoes adicionais -->
          <div class="mt-6 flex flex-col items-center gap-4">
            <AdicionarCalendario v-if="eventoStore.evento" :evento="eventoStore.evento" />

            <router-link
              :to="{ name: 'evento-publico', params: { slug } }"
              class="text-primary hover:underline text-sm font-medium"
            >
              Voltar para a pagina do evento
            </router-link>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>
