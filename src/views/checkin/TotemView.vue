<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCheckinStore } from '@/stores/checkin'
import { useEventoPublicoStore } from '@/stores/eventoPublico'
import QRScanner from '@/components/checkin/QRScanner.vue'
import CheckinConfirmacao from '@/components/checkin/CheckinConfirmacao.vue'
import Spinner from '@/components/ui/Spinner.vue'

const route = useRoute()
const checkinStore = useCheckinStore()
const eventoStore = useEventoPublicoStore()

const slug = route.params.slug as string
const scannerRef = ref<InstanceType<typeof QRScanner> | null>(null)
const estado = ref<'scanner' | 'processando' | 'sucesso' | 'erro'>('scanner')
const mensagemErro = ref('')

onMounted(async () => {
  await eventoStore.fetchEvento(slug)
})

const handleScan = async (qrcode: string) => {
  if (estado.value === 'processando') return

  estado.value = 'processando'
  scannerRef.value?.pause()

  try {
    await checkinStore.autoatendimento(slug, qrcode)
    estado.value = 'sucesso'
  } catch {
    estado.value = 'erro'
    mensagemErro.value = checkinStore.error || 'Erro ao realizar check-in'

    // Volta ao scanner apos 5 segundos
    setTimeout(() => {
      resetarScanner()
    }, 5000)
  }
}

const resetarScanner = () => {
  estado.value = 'scanner'
  mensagemErro.value = ''
  checkinStore.limpar()
  scannerRef.value?.resume()
}

const handleNovoCheckin = () => {
  resetarScanner()
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <!-- Header -->
    <header class="bg-slate-800 py-6 px-4">
      <div class="max-w-lg mx-auto text-center">
        <img
          v-if="eventoStore.evento?.logo"
          :src="eventoStore.evento.logo"
          :alt="eventoStore.evento.nome"
          class="h-12 mx-auto mb-2"
        />
        <h1 class="text-white text-xl font-bold">
          {{ eventoStore.evento?.nome || 'Carregando...' }}
        </h1>
        <p class="text-slate-400 text-sm">Autoatendimento - Check-in</p>
      </div>
    </header>

    <!-- Conteudo principal -->
    <main class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <!-- Estado: Scanner -->
        <div v-if="estado === 'scanner'" class="space-y-6">
          <div class="text-center mb-6">
            <h2 class="text-white text-2xl font-bold mb-2">Escaneie seu QR Code</h2>
            <p class="text-slate-400">Posicione o QR Code da sua inscricao na camera</p>
          </div>

          <QRScanner
            ref="scannerRef"
            @scan="handleScan"
          />
        </div>

        <!-- Estado: Processando -->
        <div v-else-if="estado === 'processando'" class="text-center py-12">
          <Spinner class="w-16 h-16 mx-auto mb-4 text-primary" />
          <p class="text-white text-lg">Processando check-in...</p>
        </div>

        <!-- Estado: Sucesso -->
        <div v-else-if="estado === 'sucesso' && checkinStore.checkinResult">
          <CheckinConfirmacao
            :result="checkinStore.checkinResult"
            :modo-totem="true"
            :auto-reset-segundos="10"
            @novo-checkin="handleNovoCheckin"
          />
        </div>

        <!-- Estado: Erro -->
        <div v-else-if="estado === 'erro'" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-white text-2xl font-bold mb-2">Erro no Check-in</h2>
          <p class="text-slate-400 mb-6">{{ mensagemErro }}</p>
          <p class="text-slate-500 text-sm">Voltando ao scanner em 5 segundos...</p>

          <button
            @click="resetarScanner"
            class="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-slate-800 py-4 px-4 text-center">
      <p class="text-slate-500 text-sm">
        Powered by <span class="text-primary">BizzExpo</span>
      </p>
    </footer>
  </div>
</template>
