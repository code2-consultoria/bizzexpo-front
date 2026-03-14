<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { CheckinResult } from '@/stores/checkin'

interface Props {
  result: CheckinResult
  modoTotem?: boolean
  autoResetSegundos?: number
}

const props = withDefaults(defineProps<Props>(), {
  modoTotem: false,
  autoResetSegundos: 0,
})

const emit = defineEmits<{
  (e: 'novo-checkin'): void
}>()

const contador = ref(props.autoResetSegundos)
let intervalId: ReturnType<typeof setInterval> | null = null

const iniciarContador = () => {
  if (props.autoResetSegundos > 0) {
    contador.value = props.autoResetSegundos
    intervalId = setInterval(() => {
      contador.value--
      if (contador.value <= 0) {
        pararContador()
        emit('novo-checkin')
      }
    }, 1000)
  }
}

const pararContador = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  iniciarContador()
})

onBeforeUnmount(() => {
  pararContador()
})

watch(() => props.result, () => {
  pararContador()
  iniciarContador()
})

const dataCheckin = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(props.result.checkin_at))
})

const isJaRealizado = computed(() => props.result.ja_realizado === true)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    <!-- Cabecalho -->
    <div
      :class="[
        'text-white p-8 text-center',
        isJaRealizado
          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
          : 'bg-gradient-to-r from-green-500 to-green-600',
      ]"
    >
      <div
        :class="[
          'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
          isJaRealizado ? 'bg-white/20' : 'bg-white/20',
        ]"
      >
        <svg v-if="!isJaRealizado" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h2 class="text-3xl font-bold mb-2">
        {{ isJaRealizado ? 'Ja Registrado!' : 'Check-in OK!' }}
      </h2>
      <p v-if="isJaRealizado" class="text-amber-100">
        Este participante ja realizou check-in
      </p>
      <p v-else class="text-green-100">
        Participante credenciado com sucesso
      </p>
    </div>

    <!-- Dados do participante -->
    <div class="p-6 space-y-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span class="text-xl font-bold text-primary">
            {{ result.inscricao.participante.nome.charAt(0) }}
          </span>
        </div>
        <div class="min-w-0">
          <h3 class="text-xl font-bold text-slate-900 truncate">
            {{ result.inscricao.participante.nome }}
          </h3>
          <p v-if="modoTotem && result.inscricao.participante.cargo" class="text-slate-600 text-sm truncate">
            {{ result.inscricao.participante.cargo }}
          </p>
          <p v-if="modoTotem" class="text-slate-500 text-sm truncate">
            {{ result.inscricao.categoria.nome }}
          </p>
          <p v-if="!modoTotem" class="text-slate-500 text-sm truncate">
            {{ result.inscricao.participante.email }}
          </p>
        </div>
      </div>

      <div v-if="!modoTotem" class="flex flex-wrap gap-2">
        <span class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {{ result.inscricao.categoria.nome }}
        </span>
      </div>

      <div class="pt-4 border-t border-slate-200">
        <p class="text-slate-500 text-sm">
          Check-in realizado em: <span class="font-medium text-slate-700">{{ dataCheckin }}</span>
        </p>
      </div>
    </div>

    <!-- Contador de auto-reset (modo totem) -->
    <div v-if="modoTotem && autoResetSegundos > 0" class="px-6 pb-4">
      <div class="flex items-center justify-center gap-2 text-slate-500 text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Voltando em <span class="font-bold text-primary">{{ contador }}</span> segundos...</span>
      </div>
    </div>

    <!-- Botao novo check-in -->
    <div class="p-6 pt-0">
      <button
        @click="emit('novo-checkin')"
        class="w-full flex items-center justify-center gap-2 bg-primary text-white h-12 rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo Check-in
      </button>
    </div>
  </div>
</template>
