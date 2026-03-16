<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header id="inicio" class="relative overflow-hidden py-16 px-6 max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Conteudo -->
      <div class="flex flex-col gap-6">
        <div class="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold w-fit uppercase tracking-wider">
          A REVOLUCAO DO CREDENCIAMENTO
        </div>

        <h1 class="text-gray-900 text-4xl md:text-5xl font-bold leading-tight">
          Transforme seu evento em
          <span class="text-primary">inteligencia comercial</span>
        </h1>

        <p class="text-gray-500 text-lg leading-relaxed">
          Abandone planilhas e processos manuais. Tenha controle total, dados
          em tempo real e maximize o ROI da sua participacao de desenvolvedores e apoio.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            @click="router.push('/register')"
            class="flex items-center justify-center bg-primary hover:bg-primary-dark text-white h-12 px-8 rounded-lg font-semibold transition-colors"
          >
            Comecar Agora
          </button>
          <button
            class="flex items-center justify-center bg-white text-gray-700 border border-gray-200 h-12 px-8 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Ver Planos
          </button>
        </div>
      </div>

      <!-- Mockup Interface -->
      <div class="relative">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-xl p-6">
          <!-- Header do mockup -->
          <div class="flex items-center gap-2 mb-4">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-red-400"></div>
              <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div class="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div class="flex-1 h-6 bg-gray-100 rounded-md mx-4"></div>
          </div>

          <!-- Campos simulados -->
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600 font-medium">Relatorio Inovacaoville</span>
                <span class="text-xs text-gray-400">Hoje</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full w-full"></div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600 font-medium">Marketplace</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                Atraia compradores e fornecedores do mundo todo para o seu marketplace.
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600 font-medium">Nextland Platform Preview</span>
              </div>
              <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-500">
                Para o participante fazer o download dos arquivos que quiserem ter offline e visualizar o que e do seu interesse ou interesse futuramente.
              </div>
            </div>

            <div>
              <span class="text-sm text-gray-600 font-medium">Solucoes para feiras e convencoes, eventos.</span>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <div class="text-xs text-gray-400 mb-2">EXCON ASSESSMENT</div>
              <div class="h-1.5 bg-primary/20 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>

        <!-- Decoracao -->
        <div class="absolute -z-10 top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full"></div>
      </div>
    </div>
  </header>
</template>
