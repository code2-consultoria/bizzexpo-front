<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

interface Props {
  title?: string
}

defineProps<Props>()

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="bg-white border-b border-gray-200">
    <div class="flex items-center justify-between h-16 px-6">
      <!-- Titulo da pagina -->
      <div class="flex items-center gap-4">
        <!-- Botao menu mobile -->
        <button class="lg:hidden p-2 text-gray-600 hover:text-gray-900 -ml-2">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 v-if="title" class="text-xl font-semibold text-gray-900">{{ title }}</h1>
      </div>

      <!-- Acoes (slot) + Logout -->
      <div class="flex items-center gap-3">
        <slot name="actions" />

        <!-- Botao logout -->
        <button
          @click="handleLogout"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Sair"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
