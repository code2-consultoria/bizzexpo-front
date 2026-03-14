<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCheckinStore } from '@/stores/checkin'
import { useEventosStore } from '@/stores/eventos'
import type { InscricaoCompleta } from '@/types'
import QRScanner from '@/components/checkin/QRScanner.vue'
import BuscaParticipante from '@/components/checkin/BuscaParticipante.vue'
import ParticipanteInfo from '@/components/checkin/ParticipanteInfo.vue'
import CheckinConfirmacao from '@/components/checkin/CheckinConfirmacao.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'

const route = useRoute()
const router = useRouter()
const checkinStore = useCheckinStore()
const eventosStore = useEventosStore()

const eventoId = route.params.eventoId as string
const scannerRef = ref<InstanceType<typeof QRScanner> | null>(null)

const modo = ref<'scanner' | 'busca'>('scanner')
const estado = ref<'aguardando' | 'validando' | 'confirmacao' | 'sucesso'>('aguardando')
const inscricaoSelecionada = ref<InscricaoCompleta | null>(null)

onMounted(async () => {
  await eventosStore.fetchEvento(eventoId)
})

// Scanner: QR Code lido
const handleScan = async (qrcode: string) => {
  if (estado.value === 'validando') return

  estado.value = 'validando'
  scannerRef.value?.pause()

  try {
    const inscricao = await checkinStore.validarQrCode(eventoId, qrcode)
    inscricaoSelecionada.value = inscricao
    estado.value = 'confirmacao'
  } catch {
    // Volta ao scanner
    estado.value = 'aguardando'
    scannerRef.value?.resume()
  }
}

// Busca: participante selecionado
const handleBuscar = async (termo: string) => {
  await checkinStore.buscarParticipante(eventoId, termo)
}

const handleSelecionarParticipante = (inscricao: InscricaoCompleta) => {
  inscricaoSelecionada.value = inscricao
  estado.value = 'confirmacao'
}

// Confirmar check-in
const handleConfirmarCheckin = async () => {
  if (!inscricaoSelecionada.value) return

  estado.value = 'validando'

  try {
    await checkinStore.realizarCheckin(eventoId, inscricaoSelecionada.value.qrcode)
    estado.value = 'sucesso'
  } catch {
    estado.value = 'confirmacao'
  }
}

// Cancelar e voltar
const handleCancelar = () => {
  estado.value = 'aguardando'
  inscricaoSelecionada.value = null
  checkinStore.limpar()

  if (modo.value === 'scanner') {
    scannerRef.value?.resume()
  }
}

// Novo check-in
const handleNovoCheckin = () => {
  estado.value = 'aguardando'
  inscricaoSelecionada.value = null
  checkinStore.limpar()

  if (modo.value === 'scanner') {
    scannerRef.value?.resume()
  }
}

// Alternar modo
const alternarModo = (novoModo: 'scanner' | 'busca') => {
  modo.value = novoModo
  estado.value = 'aguardando'
  inscricaoSelecionada.value = null
  checkinStore.limpar()
}

// Ir para walk-in
const irParaWalkin = () => {
  router.push({ name: 'checkin-walkin', params: { eventoId } })
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Check-in</h1>
          <RouterLink
            :to="{ name: 'evento-detalhes', params: { id: eventoId } }"
            class="text-slate-500 hover:text-primary hover:underline transition-colors flex items-center gap-1"
          >
            <span>&larr;</span>
            {{ eventosStore.eventoAtual?.nome }}
          </RouterLink>
        </div>
        <Button variant="secondary" @click="irParaWalkin">
          Walk-in
        </Button>
      </div>

      <!-- Tabs de modo -->
      <div class="flex gap-2 mb-6">
        <button
          @click="alternarModo('scanner')"
          :class="[
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors',
            modo === 'scanner'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          ]"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scanner QR
          </span>
        </button>
        <button
          @click="alternarModo('busca')"
          :class="[
            'flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors',
            modo === 'busca'
              ? 'bg-primary text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
          ]"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </span>
        </button>
      </div>

      <!-- Conteudo -->
      <div class="bg-white rounded-2xl border border-slate-200 p-6">
        <!-- Estado: Aguardando (Scanner) -->
        <div v-if="estado === 'aguardando' && modo === 'scanner'">
          <QRScanner ref="scannerRef" @scan="handleScan" />
        </div>

        <!-- Estado: Aguardando (Busca) -->
        <div v-else-if="estado === 'aguardando' && modo === 'busca'">
          <BuscaParticipante
            :resultados="checkinStore.resultadosBusca"
            :loading="checkinStore.loading"
            @buscar="handleBuscar"
            @selecionar="handleSelecionarParticipante"
          />
        </div>

        <!-- Estado: Validando -->
        <div v-else-if="estado === 'validando'" class="text-center py-12">
          <Spinner class="w-12 h-12 mx-auto mb-4" />
          <p class="text-slate-500">Processando...</p>
        </div>

        <!-- Estado: Confirmacao -->
        <div v-else-if="estado === 'confirmacao' && inscricaoSelecionada">
          <ParticipanteInfo :inscricao="inscricaoSelecionada" />

          <!-- Erro -->
          <div v-if="checkinStore.error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-700 text-sm">{{ checkinStore.error }}</p>
          </div>

          <div class="mt-6 flex gap-3">
            <Button variant="secondary" @click="handleCancelar" class="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              @click="handleConfirmarCheckin"
              :loading="checkinStore.loading"
              :disabled="!!inscricaoSelecionada.checkin_at"
              class="flex-1"
            >
              {{ inscricaoSelecionada.checkin_at ? 'Ja realizado' : 'Confirmar Check-in' }}
            </Button>
          </div>
        </div>

        <!-- Estado: Sucesso -->
        <div v-else-if="estado === 'sucesso' && checkinStore.checkinResult">
          <CheckinConfirmacao
            :result="checkinStore.checkinResult"
            @novo-checkin="handleNovoCheckin"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
