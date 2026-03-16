<script setup lang="ts">
const features = [
  { title: 'Check-in inteligente', description: 'Reduza filas em ate 70% com QR Code e offline mode.' },
  { title: 'Analytics em Tempo Real', description: 'Acompanhe metricas de visitantes e expositores em tempo real.' },
  { title: 'Gestao Centralizada 360', description: 'Administre tudo de um unico painel de controle.' },
  { title: 'Suporte Comercial 24/7', description: 'Equipe dedicada disponivel quando voce precisar.' },
]
</script>

<template>
  <section id="solucoes" class="py-20 px-6 bg-gray-50">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <!-- Logo grande -->
        <div class="flex flex-col items-center lg:items-start">
          <img src="/logo-icon.png" alt="" class="h-32 mb-4" />
          <span class="text-4xl font-bold text-primary">duevento</span>
        </div>

        <!-- Conteudo -->
        <div>
          <h2 class="text-gray-900 text-3xl md:text-4xl font-bold mb-4">
            duevento resolve tudo isso
          </h2>
          <p class="text-gray-500 text-lg mb-8">
            Nossa plataforma foi desenvolvida para dar controle total aos organizadores, oferecendo uma solucao 360 para todo o ciclo de vida do evento.
          </p>

          <!-- Lista de features -->
          <div class="space-y-4">
            <div
              v-for="feature in features"
              :key="feature.title"
              class="flex items-start gap-3"
            >
              <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span class="font-semibold text-gray-900">{{ feature.title }}</span>
                <span class="text-gray-500"> - {{ feature.description }}</span>
              </div>
            </div>
          </div>

          <!-- Link -->
          <button class="mt-8 text-primary font-semibold hover:underline inline-flex items-center gap-2">
            Conheca todas as funcionalidades
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
