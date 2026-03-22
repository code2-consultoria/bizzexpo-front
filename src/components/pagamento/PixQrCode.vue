<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from '@/components/ui/Button.vue'

const props = defineProps<{
  qrCodeUrl?: string
  qrCodeBase64?: string
  copiaCola?: string
  expiraEm?: string
  valor: number
}>()

const emit = defineEmits<{
  (e: 'expirado'): void
  (e: 'copiar'): void
}>()

const copiado = ref(false)
const tempoRestante = ref('')
const expirado = ref(false)
let intervalo: ReturnType<typeof setInterval> | null = null

const qrCodeSrc = computed(() => {
  if (props.qrCodeBase64) {
    return `data:image/png;base64,${props.qrCodeBase64}`
  }
  return props.qrCodeUrl || ''
})

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function calcularTempoRestante() {
  if (!props.expiraEm) {
    tempoRestante.value = ''
    return
  }

  const agora = new Date()
  const expiracao = new Date(props.expiraEm)
  const diff = expiracao.getTime() - agora.getTime()

  if (diff <= 0) {
    tempoRestante.value = 'Expirado'
    expirado.value = true
    emit('expirado')
    if (intervalo) {
      clearInterval(intervalo)
    }
    return
  }

  const minutos = Math.floor(diff / 60000)
  const segundos = Math.floor((diff % 60000) / 1000)
  tempoRestante.value = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
}

async function copiarCodigoColaCola() {
  if (!props.copiaCola) return

  try {
    await navigator.clipboard.writeText(props.copiaCola)
    copiado.value = true
    emit('copiar')
    setTimeout(() => {
      copiado.value = false
    }, 3000)
  } catch {
    // Fallback para navegadores antigos
    const textarea = document.createElement('textarea')
    textarea.value = props.copiaCola
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiado.value = true
    emit('copiar')
    setTimeout(() => {
      copiado.value = false
    }, 3000)
  }
}

onMounted(() => {
  calcularTempoRestante()
  intervalo = setInterval(calcularTempoRestante, 1000)
})

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo)
  }
})
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Valor -->
    <div class="text-center mb-6">
      <p class="text-sm text-on-surface-variant">Valor a pagar</p>
      <p class="text-3xl font-bold text-primary font-headline">
        {{ formatarMoeda(valor) }}
      </p>
    </div>

    <!-- QR Code -->
    <div
      class="relative p-4 bg-white rounded-2xl shadow-lg"
      :class="{ 'opacity-50': expirado }"
    >
      <img
        v-if="qrCodeSrc"
        :src="qrCodeSrc"
        alt="QR Code PIX"
        class="w-56 h-56"
      />
      <div v-else class="w-56 h-56 bg-surface-container-high rounded-xl flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant">qr_code_2</span>
      </div>

      <!-- Overlay expirado -->
      <div
        v-if="expirado"
        class="absolute inset-0 bg-surface/80 rounded-2xl flex items-center justify-center"
      >
        <div class="text-center">
          <span class="material-symbols-outlined text-4xl text-error">timer_off</span>
          <p class="text-sm font-medium text-error mt-2">PIX expirado</p>
        </div>
      </div>
    </div>

    <!-- Timer -->
    <div v-if="tempoRestante && !expirado" class="flex items-center gap-2 mt-4 text-on-surface-variant">
      <span class="material-symbols-outlined text-lg">schedule</span>
      <span class="text-sm">Expira em {{ tempoRestante }}</span>
    </div>

    <!-- Instrucoes -->
    <div class="mt-6 text-center max-w-sm">
      <p class="text-sm text-on-surface-variant">
        Abra o app do seu banco, escaneie o QR Code ou copie o codigo abaixo
      </p>
    </div>

    <!-- Copia e Cola -->
    <div v-if="copiaCola && !expirado" class="w-full mt-4">
      <div class="flex gap-2">
        <div class="flex-1 p-3 bg-surface-container-high rounded-lg overflow-hidden">
          <p class="text-xs text-on-surface-variant truncate font-mono">
            {{ copiaCola }}
          </p>
        </div>
        <Button
          variant="secondary"
          @click="copiarCodigoColaCola"
          :disabled="copiado"
        >
          <span class="material-symbols-outlined text-lg mr-1">
            {{ copiado ? 'check' : 'content_copy' }}
          </span>
          {{ copiado ? 'Copiado!' : 'Copiar' }}
        </Button>
      </div>
    </div>

    <!-- Status -->
    <div v-if="!expirado" class="mt-6 flex items-center gap-2 text-on-surface-variant">
      <div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
      <span class="text-sm">Aguardando pagamento...</span>
    </div>
  </div>
</template>
