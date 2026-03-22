<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Spinner from '@/components/ui/Spinner.vue'
import AdicionarItemForm from '@/components/fatura/AdicionarItemForm.vue'
import api from '@/services/api'
import type { Fatura, StatusFatura } from '@/types'

const route = useRoute()
const router = useRouter()

const fatura = ref<Fatura | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)

const faturaId = computed(() => route.params.id as string)

const podeEditarItens = computed(() => fatura.value?.status === 'rascunho')
const podeFinalizar = computed(() => fatura.value?.status === 'rascunho' && (fatura.value?.itens?.length ?? 0) > 0)
const podeCancelar = computed(() => ['rascunho', 'pendente'].includes(fatura.value?.status || ''))

async function carregarFatura() {
  loading.value = true
  error.value = null
  try {
    const response = await api.get(`/admin/faturas/${faturaId.value}`)
    fatura.value = response.data.data
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao carregar fatura'
  } finally {
    loading.value = false
  }
}

async function finalizarFatura() {
  if (!confirm('Finalizar esta fatura? Ela sera enviada para o cliente.')) return

  actionLoading.value = true
  try {
    await api.post(`/admin/faturas/${faturaId.value}/finalizar`)
    await carregarFatura()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao finalizar fatura'
  } finally {
    actionLoading.value = false
  }
}

async function cancelarFatura() {
  if (!confirm('Cancelar esta fatura? Esta acao nao pode ser desfeita.')) return

  actionLoading.value = true
  try {
    await api.post(`/admin/faturas/${faturaId.value}/cancelar`)
    await carregarFatura()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao cancelar fatura'
  } finally {
    actionLoading.value = false
  }
}

async function removerItem(itemId: string) {
  if (!confirm('Remover este item da fatura?')) return

  actionLoading.value = true
  try {
    await api.delete(`/admin/faturas/${faturaId.value}/itens/${itemId}`)
    await carregarFatura()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao remover item'
  } finally {
    actionLoading.value = false
  }
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR')
}

function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString('pt-BR')
}

function getStatusVariant(status: StatusFatura): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'paga':
      return 'success'
    case 'pendente':
      return 'warning'
    case 'vencida':
      return 'danger'
    case 'cancelada':
      return 'default'
    case 'rascunho':
      return 'info'
    default:
      return 'default'
  }
}

function getStatusLabel(status: StatusFatura): string {
  switch (status) {
    case 'paga':
      return 'Paga'
    case 'pendente':
      return 'Pendente'
    case 'vencida':
      return 'Vencida'
    case 'cancelada':
      return 'Cancelada'
    case 'rascunho':
      return 'Rascunho'
    default:
      return status
  }
}

function voltar() {
  router.push('/admin/faturas')
}

onMounted(() => {
  carregarFatura()
})
</script>

<template>
  <AppLayout title="Detalhes da Fatura">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <div class="w-20 h-20 mx-auto mb-6 bg-error-container rounded-2xl flex items-center justify-center">
        <span class="material-symbols-outlined text-4xl text-on-error-container">error</span>
      </div>
      <h3 class="text-xl font-bold text-on-surface font-headline">Erro</h3>
      <p class="mt-2 text-on-surface-variant">{{ error }}</p>
      <Button class="mt-6" variant="secondary" @click="voltar">Voltar</Button>
    </div>

    <!-- Content -->
    <div v-else-if="fatura" class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <button @click="voltar" class="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-4 transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="text-sm font-medium">Voltar</span>
          </button>

          <div class="flex items-center gap-4">
            <h1 class="text-3xl font-bold text-on-surface font-headline">
              Fatura {{ fatura.numero }}
            </h1>
            <Badge :variant="getStatusVariant(fatura.status)" size="md">
              {{ getStatusLabel(fatura.status) }}
            </Badge>
          </div>

          <p v-if="fatura.evento" class="text-on-surface-variant mt-2">
            Evento: {{ fatura.evento.nome }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Button
            v-if="podeFinalizar"
            variant="primary"
            :disabled="actionLoading"
            @click="finalizarFatura"
          >
            <span class="material-symbols-outlined mr-2">send</span>
            Finalizar
          </Button>
          <Button
            v-if="podeCancelar"
            variant="ghost"
            class="text-error"
            :disabled="actionLoading"
            @click="cancelarFatura"
          >
            <span class="material-symbols-outlined mr-2">cancel</span>
            Cancelar
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Itens -->
        <div class="lg:col-span-2">
          <Card>
            <div class="p-6 border-b border-outline-variant/20">
              <h2 class="text-lg font-semibold text-on-surface font-headline">Itens</h2>
            </div>

            <div v-if="!fatura.itens?.length" class="p-12 text-center text-on-surface-variant">
              Nenhum item adicionado
            </div>

            <div v-else class="divide-y divide-outline-variant/10">
              <div
                v-for="item in fatura.itens"
                :key="item.id"
                class="p-6 flex items-center justify-between group"
              >
                <div class="flex-1">
                  <p class="font-medium text-on-surface">{{ item.descricao }}</p>
                  <p class="text-sm text-on-surface-variant mt-1">
                    {{ item.quantidade }}x {{ formatarMoeda(item.preco_unitario) }}
                  </p>
                </div>
                <div class="flex items-center gap-4">
                  <p class="font-semibold text-on-surface">
                    {{ formatarMoeda(item.subtotal) }}
                  </p>
                  <button
                    v-if="podeEditarItens"
                    @click="removerItem(item.id)"
                    class="opacity-0 group-hover:opacity-100 text-error hover:bg-error-container p-2 rounded-lg transition-all"
                    title="Remover item"
                  >
                    <span class="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Adicionar Item -->
            <div v-if="podeEditarItens" class="p-6 border-t border-outline-variant/20">
              <AdicionarItemForm
                :fatura-id="faturaId"
                @item-adicionado="carregarFatura"
              />
            </div>

            <!-- Totais -->
            <div class="p-6 bg-surface-container-low/50">
              <div class="space-y-2">
                <div class="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>{{ formatarMoeda(fatura.subtotal) }}</span>
                </div>
                <div v-if="fatura.desconto > 0" class="flex justify-between text-on-surface-variant">
                  <span>Desconto</span>
                  <span class="text-primary">-{{ formatarMoeda(fatura.desconto) }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold text-on-surface pt-2 border-t border-outline-variant/20">
                  <span>Total</span>
                  <span>{{ formatarMoeda(fatura.total) }}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Info -->
        <div class="space-y-6">
          <Card class="p-6">
            <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              Informacoes
            </h3>

            <div class="space-y-4">
              <div>
                <p class="text-sm text-on-surface-variant">Numero</p>
                <p class="font-mono font-semibold text-on-surface">{{ fatura.numero }}</p>
              </div>

              <div>
                <p class="text-sm text-on-surface-variant">Vencimento</p>
                <p class="font-medium text-on-surface">{{ formatarData(fatura.vencimento) }}</p>
              </div>

              <div>
                <p class="text-sm text-on-surface-variant">Criada em</p>
                <p class="text-on-surface">{{ formatarDataHora(fatura.created_at) }}</p>
              </div>

              <div v-if="fatura.evento">
                <p class="text-sm text-on-surface-variant">Evento</p>
                <p class="text-on-surface">{{ fatura.evento.nome }}</p>
              </div>
            </div>
          </Card>

          <!-- Pagamentos -->
          <Card v-if="fatura.pagamentos?.length" class="p-6">
            <h3 class="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">
              Pagamentos
            </h3>

            <div class="space-y-4">
              <div
                v-for="pagamento in fatura.pagamentos"
                :key="pagamento.id"
                class="p-4 bg-surface-container-high rounded-xl"
              >
                <div class="flex items-center justify-between mb-2">
                  <Badge
                    :variant="pagamento.status === 'pago' ? 'success' : pagamento.status === 'falhou' ? 'danger' : 'warning'"
                    size="sm"
                  >
                    {{ pagamento.status }}
                  </Badge>
                  <span class="text-sm text-on-surface-variant">{{ pagamento.metodo }}</span>
                </div>
                <p class="font-semibold text-on-surface">{{ formatarMoeda(pagamento.valor) }}</p>
                <p v-if="pagamento.paid_at" class="text-xs text-on-surface-variant mt-1">
                  Pago em {{ formatarDataHora(pagamento.paid_at) }}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
