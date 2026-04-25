<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
    <div class="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <!-- Logo duevento -->
      <div class="flex items-center gap-2">
        <img src="/logo-icon.png" alt="" class="h-9" />
        <span class="text-xl font-bold text-primary">duevento</span>
      </div>

      <!-- Menu -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#inicio" class="text-gray-600 hover:text-primary font-medium text-sm transition-colors">Início</a>
        <a href="#solucoes" class="text-gray-600 hover:text-primary font-medium text-sm transition-colors">Soluções</a>
        <a href="#precos" class="text-gray-600 hover:text-primary font-medium text-sm transition-colors">Preços</a>
        <a href="#contato" class="text-gray-600 hover:text-primary font-medium text-sm transition-colors">Contato</a>
      </div>

      <!-- CTA -->
      <button
        @click="router.push('/login')"
        class="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
      >
        Entrar
      </button>
    </div>
  </nav>
</template>
