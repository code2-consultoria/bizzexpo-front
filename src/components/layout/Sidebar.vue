<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'grid',
  },
  {
    name: 'Eventos',
    path: '/eventos',
    icon: 'calendar',
  },
]

function isActive(path: string) {
  return route.path.startsWith(path)
}

function getInitials(name: string | undefined) {
  if (!name) return 'AD'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <aside class="hidden lg:flex lg:flex-col w-56 bg-white border-r border-gray-200">
    <!-- Logo -->
    <div class="flex items-center gap-2 h-16 px-4">
      <img src="/logo-icon.png" alt="" class="h-8" />
      <span class="text-lg font-bold text-primary">duevento</span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium"
        :class="{
          'bg-primary/10 text-primary': isActive(item.path),
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900': !isActive(item.path),
        }"
      >
        <svg v-if="item.icon === 'grid'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <svg v-if="item.icon === 'calendar'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Usuario -->
    <div class="px-3 py-4 border-t border-gray-200">
      <div class="flex items-center gap-3 px-3">
        <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {{ getInitials(authStore.user?.name) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ authStore.user?.name || 'Admin' }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ authStore.user?.email || 'admin@duevento.pt' }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>
