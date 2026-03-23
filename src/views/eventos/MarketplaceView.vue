<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useMarketplaceStore, type ProdutoMarketplace } from '@/stores/marketplace'
import { useCarrinhoStore } from '@/stores/carrinho'
import { useEventosStore } from '@/stores/eventos'

const route = useRoute()
const router = useRouter()
const marketplaceStore = useMarketplaceStore()
const carrinhoStore = useCarrinhoStore()
const eventosStore = useEventosStore()

const eventoId = computed(() => route.params.id as string)
const addingProduct = ref<string | null>(null)

const tiposProduto = [
  { value: 'estande', label: 'Estande' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'servico', label: 'Servico' },
]

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

async function adicionarAoCarrinho(produto: ProdutoMarketplace) {
  addingProduct.value = produto.id
  try {
    await carrinhoStore.adicionarItem(eventoId.value, produto.id, 1)
  } finally {
    addingProduct.value = null
  }
}

function irParaCarrinho() {
  router.push(`/eventos/${eventoId.value}/carrinho`)
}

onMounted(async () => {
  // Carrega evento se nao tiver
  if (!eventosStore.eventoAtual || eventosStore.eventoAtual.id !== eventoId.value) {
    await eventosStore.fetchEvento(eventoId.value)
  }
  // Carrega produtos
  await marketplaceStore.fetchProdutos(eventoId.value)
  // Carrega carrinho
  await carrinhoStore.fetchCarrinho(eventoId.value)
})
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <button
            @click="router.push(`/eventos/${eventoId}`)"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Marketplace</h1>
            <p class="text-gray-500">{{ eventosStore.eventoAtual?.nome }}</p>
          </div>
        </div>

        <!-- Carrinho Badge -->
        <button
          @click="irParaCarrinho"
          class="relative p-3 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span
            v-if="carrinhoStore.quantidadeItens > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {{ carrinhoStore.quantidadeItens }}
          </span>
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div class="flex-1 min-w-[200px] max-w-sm">
          <Input
            v-model="marketplaceStore.busca"
            placeholder="Buscar produto..."
            class="w-full"
          >
            <template #prefix>
              <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </Input>
        </div>
        <select
          v-model="marketplaceStore.filtroCategoria"
          class="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-primary/40"
        >
          <option :value="null">Todas categorias</option>
          <option v-for="cat in marketplaceStore.categorias" :key="cat.id" :value="cat.id">
            {{ cat.nome }}
          </option>
        </select>
        <select
          v-model="marketplaceStore.filtroTipo"
          class="px-4 py-2 bg-gray-100 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-primary/40"
        >
          <option :value="null">Todos tipos</option>
          <option v-for="tipo in tiposProduto" :key="tipo.value" :value="tipo.value">
            {{ tipo.label }}
          </option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="marketplaceStore.loading" class="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>

      <!-- Error -->
      <div v-else-if="marketplaceStore.error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600">{{ marketplaceStore.error }}</p>
        <Button variant="secondary" class="mt-4" @click="marketplaceStore.fetchProdutos(eventoId)">
          Tentar novamente
        </Button>
      </div>

      <!-- Empty State -->
      <div v-else-if="marketplaceStore.produtosFiltrados.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
          <svg class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900">Nenhum produto disponivel</h3>
        <p class="mt-2 text-gray-500 max-w-md mx-auto">
          {{ marketplaceStore.busca ? 'Nenhum produto encontrado com os filtros aplicados.' : 'Nao ha produtos disponiveis no momento.' }}
        </p>
        <Button v-if="marketplaceStore.busca" variant="secondary" class="mt-4" @click="marketplaceStore.limparFiltros">
          Limpar filtros
        </Button>
      </div>

      <!-- Produtos Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card
          v-for="produto in marketplaceStore.produtosFiltrados"
          :key="produto.id"
          class="group hover:shadow-lg transition-all duration-300"
        >
          <div class="p-5">
            <div class="flex items-start justify-between mb-2">
              <Badge variant="info" size="sm">
                {{ marketplaceStore.getTipoLabel(produto.tipo) }}
              </Badge>
            </div>

            <h3 class="text-lg font-bold text-gray-900 truncate mt-3">
              {{ produto.nome }}
            </h3>
            <p v-if="produto.descricao" class="text-sm text-gray-500 mt-1 line-clamp-2">
              {{ produto.descricao }}
            </p>

            <div v-if="produto.categoria" class="flex items-center gap-2 text-sm text-gray-500 mt-3">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{{ produto.categoria.nome }}</span>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <span
                    v-if="produto.preco !== produto.preco_base"
                    class="text-sm text-gray-400 line-through mr-2"
                  >
                    {{ formatarMoeda(produto.preco_base) }}
                  </span>
                  <span class="text-xl font-bold text-primary">
                    {{ formatarMoeda(produto.preco) }}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                class="w-full"
                :disabled="addingProduct === produto.id"
                @click="adicionarAoCarrinho(produto)"
              >
                <Spinner v-if="addingProduct === produto.id" size="sm" class="mr-2" />
                <svg v-else class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar ao carrinho
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Floating Cart Summary -->
      <div
        v-if="carrinhoStore.quantidadeItens > 0"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4"
      >
        <span class="text-sm">
          {{ carrinhoStore.quantidadeItens }} {{ carrinhoStore.quantidadeItens === 1 ? 'item' : 'itens' }} no carrinho
        </span>
        <span class="font-bold">{{ formatarMoeda(carrinhoStore.total) }}</span>
        <Button variant="primary" size="sm" @click="irParaCarrinho">
          Ver carrinho
        </Button>
      </div>
    </div>
  </AppLayout>
</template>
