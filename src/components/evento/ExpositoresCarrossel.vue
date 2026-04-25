<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ExpositorPublico } from '@/types'

interface Props {
  expositores: ExpositorPublico[]
  autoPlay?: boolean
  autoPlayInterval?: number
  itemsPerView?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: true,
  autoPlayInterval: 5000,
  itemsPerView: () => ({ mobile: 2, tablet: 3, desktop: 5 }),
})

const currentIndex = ref(0)
const containerRef = ref<HTMLElement | null>(null)
const autoPlayTimer = ref<ReturnType<typeof setInterval> | null>(null)
const isPaused = ref(false)

// Calcula items por pagina baseado na tela
const itemsPerPage = computed(() => {
  if (typeof window === 'undefined') return props.itemsPerView.desktop
  const width = window.innerWidth
  if (width < 640) return props.itemsPerView.mobile
  if (width < 1024) return props.itemsPerView.tablet
  return props.itemsPerView.desktop
})

// Calcula numero total de paginas
const totalPages = computed(() => {
  if (props.expositores.length === 0) return 0
  return Math.ceil(props.expositores.length / itemsPerPage.value)
})

// Expositores visiveis na pagina atual
const visibleExpositores = computed(() => {
  const start = currentIndex.value * itemsPerPage.value
  const end = start + itemsPerPage.value
  return props.expositores.slice(start, end)
})

// Navega para a proxima pagina
function nextPage() {
  if (currentIndex.value < totalPages.value - 1) {
    currentIndex.value++
  } else {
    currentIndex.value = 0
  }
}

// Navega para a pagina anterior
function prevPage() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  } else {
    currentIndex.value = totalPages.value - 1
  }
}

// Navega para uma pagina especifica
function goToPage(page: number) {
  currentIndex.value = page
}

// Inicia autoplay
function startAutoPlay() {
  if (props.autoPlay && totalPages.value > 1) {
    autoPlayTimer.value = setInterval(() => {
      if (!isPaused.value) {
        nextPage()
      }
    }, props.autoPlayInterval)
  }
}

// Para autoplay
function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

// Pausa ao passar o mouse
function pauseAutoPlay() {
  isPaused.value = true
}

// Retoma ao sair com o mouse
function resumeAutoPlay() {
  isPaused.value = false
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div
    v-if="expositores.length > 0"
    class="bg-slate-50 rounded-2xl p-6 lg:p-8"
    @mouseenter="pauseAutoPlay"
    @mouseleave="resumeAutoPlay"
  >
    <div class="text-center mb-8">
      <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
        Expositores confirmados
      </h2>
      <p class="text-slate-600">
        Conheca as empresas e marcas que estarao presentes no evento
      </p>
    </div>

    <!-- Carrossel -->
    <div ref="containerRef" class="relative">
      <!-- Botao anterior -->
      <button
        v-if="totalPages > 1"
        @click="prevPage"
        class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        aria-label="Anterior"
      >
        <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Grid de expositores -->
      <div
        class="grid gap-4 transition-opacity duration-300"
        :class="{
          'grid-cols-2': itemsPerPage === 2,
          'grid-cols-3': itemsPerPage === 3,
          'grid-cols-4': itemsPerPage === 4,
          'grid-cols-5': itemsPerPage === 5,
        }"
      >
        <div
          v-for="expositor in visibleExpositores"
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

      <!-- Botao proximo -->
      <button
        v-if="totalPages > 1"
        @click="nextPage"
        class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
        aria-label="Proximo"
      >
        <svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Indicadores (dots) -->
    <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-6">
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page - 1)"
        class="w-2 h-2 rounded-full transition-all"
        :class="currentIndex === page - 1
          ? 'bg-primary w-6'
          : 'bg-slate-300 hover:bg-slate-400'
        "
        :aria-label="`Pagina ${page}`"
      />
    </div>
  </div>
</template>
