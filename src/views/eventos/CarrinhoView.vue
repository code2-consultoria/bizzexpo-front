<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Spinner from '@/components/ui/Spinner.vue'
import CarrinhoItem from '@/components/carrinho/CarrinhoItem.vue'
import CarrinhoResumo from '@/components/carrinho/CarrinhoResumo.vue'
import CarrinhoVazio from '@/components/carrinho/CarrinhoVazio.vue'
import { useCarrinhoStore } from '@/stores/carrinho'
import { useEventosStore } from '@/stores/eventos'

const route = useRoute()
const router = useRouter()
const carrinhoStore = useCarrinhoStore()
const eventosStore = useEventosStore()

const eventoId = computed(() => route.params.id as string)
const eventoNome = computed(() => eventosStore.eventoAtual?.nome ?? 'Evento')

onMounted(async () => {
  // Carrega evento se nao tiver
  if (!eventosStore.eventoAtual || eventosStore.eventoAtual.id !== eventoId.value) {
    await eventosStore.fetchEvento(eventoId.value)
  }
  // Carrega carrinho
  await carrinhoStore.fetchCarrinho(eventoId.value)
})

async function handleAtualizarQuantidade(itemId: string, quantidade: number) {
  await carrinhoStore.atualizarQuantidade(eventoId.value, itemId, quantidade)
}

async function handleRemoverItem(itemId: string) {
  await carrinhoStore.removerItem(eventoId.value, itemId)
}

async function handleFinalizar() {
  try {
    const resultado = await carrinhoStore.fecharCarrinho(eventoId.value)
    router.push({
      name: 'fatura-pagar',
      params: { id: resultado.fatura?.id ?? resultado.fatura_id },
    })
  } catch {
    // Erro ja tratado no store
  }
}

function handleAdicionarProdutos() {
  router.push(`/eventos/${eventoId.value}/marketplace`)
}
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="router.push(`/eventos/${eventoId}/marketplace`)"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Meu Carrinho</h1>
          <p class="text-gray-500">{{ eventoNome }}</p>
        </div>
      </div>

      <div v-if="carrinhoStore.loading && !carrinhoStore.carrinho" class="flex justify-center py-12">
        <Spinner />
      </div>

      <template v-else>
        <div v-if="carrinhoStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-600">{{ carrinhoStore.error }}</p>
        </div>

        <div v-if="carrinhoStore.estaVazio">
          <Card>
            <CarrinhoVazio @adicionar="handleAdicionarProdutos" />
          </Card>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-4">
            <CarrinhoItem
              v-for="item in carrinhoStore.carrinho?.itens"
              :key="item.id"
              :item="item"
              :loading="carrinhoStore.loading"
              @update:quantidade="(qtd) => handleAtualizarQuantidade(item.id, qtd)"
              @remover="handleRemoverItem(item.id)"
            />
          </div>

          <div>
            <CarrinhoResumo
              :total="carrinhoStore.total"
              :quantidade-itens="carrinhoStore.quantidadeItens"
              :loading="carrinhoStore.loading"
              @finalizar="handleFinalizar"
            />
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
