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
const estado = ref<'scanner' | 'processando' | 'sucesso' | 'erro' | 'manual'>('scanner')
const mensagemErro = ref('')
const codigoManual = ref('')

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

    setTimeout(() => {
      resetarScanner()
    }, 5000)
  }
}

const handleCodigoManual = async () => {
  if (!codigoManual.value.trim()) return
  estado.value = 'processando'

  try {
    await checkinStore.autoatendimento(slug, codigoManual.value)
    estado.value = 'sucesso'
  } catch {
    estado.value = 'erro'
    mensagemErro.value = checkinStore.error || 'Codigo invalido'

    setTimeout(() => {
      resetarScanner()
    }, 5000)
  }
}

const resetarScanner = () => {
  estado.value = 'scanner'
  mensagemErro.value = ''
  codigoManual.value = ''
  checkinStore.limpar()
  scannerRef.value?.resume()
}

const handleNovoCheckin = () => {
  resetarScanner()
}
</script>

<template>
  <div class="min-h-screen bg-[#004028] flex flex-col">
    <!-- Header -->
    <header class="py-12 px-4 text-center">
      <h1 class="text-white text-4xl md:text-5xl font-bold mb-2">
        {{ eventoStore.evento?.nome || 'Carregando...' }}
      </h1>
      <p class="text-white/60 text-lg">Autoatendimento - Check-in</p>
    </header>

    <!-- Conteudo principal -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 pb-12">
      <!-- Estado: Scanner -->
      <div v-if="estado === 'scanner'" class="w-full max-w-lg space-y-8">
        <div class="text-center">
          <h2 class="text-white text-2xl font-bold mb-2">Escaneie seu QR Code</h2>
          <p class="text-white/50">Posicione o codigo no centro da marcacao abaixo</p>
        </div>

        <!-- Scanner com moldura -->
        <div class="relative mx-auto w-full max-w-sm aspect-square">
          <!-- Fundo escuro -->
          <div class="absolute inset-0 bg-[#002a1a] rounded-2xl overflow-hidden">
            <QRScanner
              ref="scannerRef"
              @scan="handleScan"
              class="w-full h-full"
            />
          </div>

          <!-- Moldura nos cantos -->
          <div class="absolute inset-8 pointer-events-none">
            <!-- Canto superior esquerdo -->
            <div class="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
            <!-- Canto superior direito -->
            <div class="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
            <!-- Canto inferior esquerdo -->
            <div class="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
            <!-- Canto inferior direito -->
            <div class="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
          </div>

          <!-- Icone de pessoa no centro (placeholder) -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <svg class="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>

        <!-- Botao digitar manualmente -->
        <button
          @click="estado = 'manual'"
          class="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
        >
          Digitar codigo manualmente
        </button>
      </div>

      <!-- Estado: Manual -->
      <div v-else-if="estado === 'manual'" class="w-full max-w-lg space-y-6">
        <div class="text-center">
          <h2 class="text-white text-2xl font-bold mb-2">Digite seu codigo</h2>
          <p class="text-white/50">Insira o codigo da sua inscricao</p>
        </div>

        <div class="space-y-4">
          <input
            v-model="codigoManual"
            type="text"
            placeholder="Ex: ABC123"
            class="w-full px-6 py-4 bg-[#002a1a] border-2 border-primary/30 rounded-xl text-white text-center text-2xl font-mono placeholder-white/30 focus:outline-none focus:border-primary"
            @keyup.enter="handleCodigoManual"
          />

          <div class="flex gap-4">
            <button
              @click="resetarScanner"
              class="flex-1 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Voltar
            </button>
            <button
              @click="handleCodigoManual"
              class="flex-1 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <!-- Estado: Processando -->
      <div v-else-if="estado === 'processando'" class="text-center py-12">
        <Spinner class="w-20 h-20 mx-auto mb-6 text-primary" />
        <p class="text-white text-xl">Processando check-in...</p>
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
      <div v-else-if="estado === 'erro'" class="text-center py-12 max-w-md">
        <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg class="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 class="text-white text-2xl font-bold mb-3">Erro no Check-in</h2>
        <p class="text-white/60 mb-6">{{ mensagemErro }}</p>
        <p class="text-white/40 text-sm mb-6">Voltando ao scanner em 5 segundos...</p>

        <button
          @click="resetarScanner"
          class="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 px-4 text-center">
      <p class="text-white/40 text-sm tracking-wider">
        POWERED BY <span class="font-bold text-white/60">DUEVENTO</span>
      </p>
    </footer>
  </div>
</template>
