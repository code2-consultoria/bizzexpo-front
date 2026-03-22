<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Toast from '@/components/ui/Toast.vue'
import { useFaturasStore } from '@/stores/faturas'
import type { Parcela } from '@/types'

const route = useRoute()
const router = useRouter()
const faturasStore = useFaturasStore()

const faturaId = computed(() => route.params.id as string)

const metodoPagamento = ref<'pix' | 'credit_card' | 'debit_card'>('pix')
const parcelaSelecionada = ref<number>(1)
const processando = ref(false)
const erroLocal = ref<string | null>(null)

// PIX
const pixGerado = ref(false)
const copiado = ref(false)
const pixExpirado = ref(false)

// Toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

onMounted(async () => {
  await faturasStore.fetchFatura(faturaId.value)
  await faturasStore.fetchParcelas(faturaId.value)

  // Verificar se ja existe pagamento PIX pendente
  const fatura = faturasStore.faturaAtual
  if (fatura?.pagamentos?.length) {
    // Buscar PIX pendente e valido
    const pagamentoPix = fatura.pagamentos.find(
      (p) => p.metodo === 'pix' && p.status === 'pendente' && p.pix_valido
    )
    if (pagamentoPix) {
      // Setar o pagamento existente na store
      faturasStore.pagamentoAtual = pagamentoPix
      pixGerado.value = true
    } else {
      // Verificar se existe PIX expirado
      const pixExpiradoExistente = fatura.pagamentos.find(
        (p) => p.metodo === 'pix' && p.status === 'pendente' && p.pix_valido === false
      )
      if (pixExpiradoExistente) {
        pixExpirado.value = true
      }
    }
  }
})

const parcelaInfo = computed(() => {
  return faturasStore.parcelas.find((p) => p.quantidade === parcelaSelecionada.value)
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleGerarPix() {
  processando.value = true
  erroLocal.value = null

  try {
    await faturasStore.pagarComPix(faturaId.value)
    pixGerado.value = true
  } catch {
    erroLocal.value = faturasStore.error ?? 'Erro ao gerar PIX'
  } finally {
    processando.value = false
  }
}

async function copiarCodigoPix() {
  const codigoPix = faturasStore.pagamentoAtual?.pix_copia_cola
  if (codigoPix) {
    try {
      await navigator.clipboard.writeText(codigoPix)
      copiado.value = true
      toastMessage.value = 'Codigo PIX copiado!'
      toastType.value = 'success'
      showToast.value = true
      setTimeout(() => {
        copiado.value = false
      }, 2000)
    } catch {
      toastMessage.value = 'Erro ao copiar codigo'
      toastType.value = 'error'
      showToast.value = true
    }
  } else {
    toastMessage.value = 'Codigo PIX nao disponivel'
    toastType.value = 'error'
    showToast.value = true
  }
}

function onToastClose() {
  showToast.value = false
}

function handleVoltar() {
  router.push(`/faturas/${faturaId.value}`)
}

function getParcelaLabel(parcela: Parcela) {
  if (parcela.tem_juros) {
    return `${parcela.quantidade}x de ${formatPrice(parcela.valor_parcela)} (Total: ${formatPrice(parcela.valor_total)})`
  }
  return `${parcela.quantidade}x de ${formatPrice(parcela.valor_parcela)} sem juros`
}

// Watch para verificar status do pagamento PIX
watch(
  () => faturasStore.pagamentoAtual?.status,
  (status) => {
    if (status === 'pago') {
      router.push(`/pagamento/${faturasStore.pagamentoAtual?.id}/confirmado`)
    }
  }
)
</script>

<template>
  <AppLayout title="Pagamento">
    <Toast
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="onToastClose"
    />
    <div class="max-w-2xl mx-auto">
      <div v-if="faturasStore.loading && !faturasStore.faturaAtual" class="flex justify-center py-12">
        <Spinner size="lg" />
      </div>

      <template v-else-if="faturasStore.faturaAtual">
        <div class="mb-6">
          <button
            @click="handleVoltar"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
        </div>

        <!-- Resumo da Fatura -->
        <Card class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Fatura</p>
              <p class="text-lg font-semibold text-gray-900">
                {{ faturasStore.faturaAtual.numero }}
              </p>
              <p v-if="faturasStore.faturaAtual.evento" class="text-sm text-gray-500">
                {{ faturasStore.faturaAtual.evento.nome }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-500">Total a pagar</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ formatPrice(faturasStore.faturaAtual.total) }}
              </p>
            </div>
          </div>
        </Card>

        <!-- Erro -->
        <div v-if="erroLocal || faturasStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-600">{{ erroLocal || faturasStore.error }}</p>
        </div>

        <!-- PIX Gerado -->
        <Card v-if="pixGerado && faturasStore.pagamentoAtual">
          <div class="text-center">
            <div class="mb-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                PIX gerado com sucesso
              </span>
            </div>

            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              Escaneie o QR Code ou copie o codigo
            </h3>

            <!-- QR Code -->
            <div v-if="faturasStore.pagamentoAtual.pix_qrcode_url" class="flex justify-center mb-6">
              <img
                :src="faturasStore.pagamentoAtual.pix_qrcode_url"
                alt="QR Code PIX"
                class="w-64 h-64 border rounded-lg"
              />
            </div>

            <!-- Copia e Cola -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <p class="text-xs text-gray-500 mb-2">Codigo PIX (copia e cola)</p>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  readonly
                  :value="faturasStore.pagamentoAtual.pix_copia_cola"
                  class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 truncate"
                />
                <Button @click="copiarCodigoPix" :variant="copiado ? 'secondary' : 'primary'">
                  {{ copiado ? 'Copiado!' : 'Copiar' }}
                </Button>
              </div>
            </div>

            <!-- Expiracao -->
            <div v-if="faturasStore.pagamentoAtual.pix_expira_em" class="text-sm text-gray-500">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Expira em: {{ formatDate(faturasStore.pagamentoAtual.pix_expira_em) }}
            </div>

            <div class="mt-6 p-4 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-700">
                Apos o pagamento, a confirmacao sera automatica. Aguarde alguns segundos.
              </p>
            </div>
          </div>
        </Card>

        <!-- Selecao de Metodo -->
        <Card v-else>
          <!-- Aviso de PIX expirado -->
          <div v-if="pixExpirado" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-800">PIX anterior expirado</p>
                <p class="text-sm text-amber-600 mt-1">
                  O QR Code PIX gerado anteriormente expirou. Gere um novo para continuar.
                </p>
              </div>
            </div>
          </div>

          <h3 class="text-lg font-semibold text-gray-900 mb-6">Forma de pagamento</h3>

          <!-- Opcoes de Metodo -->
          <div class="space-y-3 mb-6">
            <!-- PIX -->
            <label
              class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="{
                'border-blue-500 bg-blue-50': metodoPagamento === 'pix',
                'border-gray-200 hover:border-gray-300': metodoPagamento !== 'pix',
              }"
            >
              <input
                type="radio"
                v-model="metodoPagamento"
                value="pix"
                class="w-5 h-5 text-blue-600"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.365 17.859a5.5 5.5 0 01-2.73 0l-3.04 3.04a8.5 8.5 0 008.81 0l-3.04-3.04zM17.859 13.365a5.5 5.5 0 010-2.73l3.04-3.04a8.5 8.5 0 010 8.81l-3.04-3.04zM10.635 6.141a5.5 5.5 0 012.73 0l3.04-3.04a8.5 8.5 0 00-8.81 0l3.04 3.04zM6.141 10.635a5.5 5.5 0 000 2.73l-3.04 3.04a8.5 8.5 0 010-8.81l3.04 3.04z"/>
                  </svg>
                  <span class="font-medium text-gray-900">PIX</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Pagamento instantaneo</p>
              </div>
              <span class="text-sm font-medium text-green-600">Sem juros</span>
            </label>

            <!-- Cartao de Credito -->
            <label
              class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="{
                'border-blue-500 bg-blue-50': metodoPagamento === 'credit_card',
                'border-gray-200 hover:border-gray-300': metodoPagamento !== 'credit_card',
              }"
            >
              <input
                type="radio"
                v-model="metodoPagamento"
                value="credit_card"
                class="w-5 h-5 text-blue-600"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="font-medium text-gray-900">Cartao de Credito</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Parcele em ate 12x</p>
              </div>
            </label>

            <!-- Cartao de Debito -->
            <label
              class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all"
              :class="{
                'border-blue-500 bg-blue-50': metodoPagamento === 'debit_card',
                'border-gray-200 hover:border-gray-300': metodoPagamento !== 'debit_card',
              }"
            >
              <input
                type="radio"
                v-model="metodoPagamento"
                value="debit_card"
                class="w-5 h-5 text-blue-600"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span class="font-medium text-gray-900">Cartao de Debito</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">Pagamento a vista</p>
              </div>
              <span class="text-sm font-medium text-green-600">Sem juros</span>
            </label>
          </div>

          <!-- Parcelamento (apenas credito) -->
          <div v-if="metodoPagamento === 'credit_card' && faturasStore.parcelas.length > 0" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Parcelamento
            </label>
            <select
              v-model="parcelaSelecionada"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option
                v-for="parcela in faturasStore.parcelas"
                :key="parcela.quantidade"
                :value="parcela.quantidade"
              >
                {{ getParcelaLabel(parcela) }}
              </option>
            </select>
            <div v-if="parcelaInfo?.tem_juros" class="mt-2 text-sm text-amber-600">
              Juros de {{ formatPrice(parcelaInfo.juros) }} inclusos
            </div>
          </div>

          <!-- Aviso Cartao (em desenvolvimento) -->
          <div v-if="metodoPagamento !== 'pix'" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p class="text-sm text-amber-700">
              <strong>Em desenvolvimento:</strong> O pagamento com cartao sera integrado em breve.
              Por enquanto, utilize o PIX.
            </p>
          </div>

          <!-- Botao de Pagar -->
          <Button
            class="w-full"
            size="lg"
            :loading="processando"
            :disabled="metodoPagamento !== 'pix'"
            @click="handleGerarPix"
          >
            <template v-if="metodoPagamento === 'pix'">
              Gerar QR Code PIX
            </template>
            <template v-else>
              Continuar
            </template>
          </Button>
        </Card>
      </template>
    </div>
  </AppLayout>
</template>
