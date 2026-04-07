<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Spinner from '@/components/ui/Spinner.vue'
import Modal from '@/components/ui/Modal.vue'
import { useCatalogoStore } from '@/stores/catalogo'
import type { CategoriaProduto, Produto, TipoProduto } from '@/types'

const catalogoStore = useCatalogoStore()

// Tabs
const abaAtiva = ref<'categorias' | 'produtos'>('categorias')

// Modal state
const showModal = ref(false)
const modalTipo = ref<'categoria' | 'produto'>('categoria')
const modalModo = ref<'criar' | 'editar'>('criar')
const itemEditando = ref<CategoriaProduto | Produto | null>(null)

// Form state - Categoria
const categoriaForm = ref({
  nome: '',
  descricao: '',
})

// Form state - Produto
const produtoForm = ref({
  categoria_id: '',
  nome: '',
  descricao: '',
  tipo: 'estande' as TipoProduto,
  preco_base: 0,
})

const tiposProduto: { value: TipoProduto; label: string }[] = [
  { value: 'estande', label: 'Estande' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'servico', label: 'Serviço' },
]

// Computed
const modalTitulo = computed(() => {
  if (modalTipo.value === 'categoria') {
    return modalModo.value === 'criar' ? 'Nova categoria' : 'Editar categoria'
  }
  return modalModo.value === 'criar' ? 'Novo produto' : 'Editar produto'
})

// Methods
function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function abrirModalCategoria(categoria?: CategoriaProduto) {
  modalTipo.value = 'categoria'
  if (categoria) {
    modalModo.value = 'editar'
    itemEditando.value = categoria
    categoriaForm.value = {
      nome: categoria.nome,
      descricao: categoria.descricao || '',
    }
  } else {
    modalModo.value = 'criar'
    itemEditando.value = null
    categoriaForm.value = { nome: '', descricao: '' }
  }
  showModal.value = true
}

function abrirModalProduto(produto?: Produto) {
  modalTipo.value = 'produto'
  if (produto) {
    modalModo.value = 'editar'
    itemEditando.value = produto
    produtoForm.value = {
      categoria_id: produto.categoria_id,
      nome: produto.nome,
      descricao: produto.descricao || '',
      tipo: produto.tipo,
      preco_base: produto.preco_base,
    }
  } else {
    modalModo.value = 'criar'
    itemEditando.value = null
    produtoForm.value = {
      categoria_id: catalogoStore.categorias[0]?.id || '',
      nome: '',
      descricao: '',
      tipo: 'estande',
      preco_base: 0,
    }
  }
  showModal.value = true
}

function fecharModal() {
  showModal.value = false
  itemEditando.value = null
}

async function salvarCategoria() {
  try {
    if (modalModo.value === 'criar') {
      await catalogoStore.criarCategoria(categoriaForm.value)
    } else if (itemEditando.value) {
      await catalogoStore.atualizarCategoria(itemEditando.value.id, categoriaForm.value)
    }
    fecharModal()
  } catch {
    // Erro tratado no store
  }
}

async function salvarProduto() {
  try {
    if (modalModo.value === 'criar') {
      await catalogoStore.criarProduto(produtoForm.value)
    } else if (itemEditando.value) {
      await catalogoStore.atualizarProduto(itemEditando.value.id, produtoForm.value)
    }
    fecharModal()
  } catch {
    // Erro tratado no store
  }
}

async function toggleAtivoCategoria(categoria: CategoriaProduto) {
  await catalogoStore.atualizarCategoria(categoria.id, { ativo: !categoria.ativo })
}

async function toggleAtivoProduto(produto: Produto) {
  await catalogoStore.atualizarProduto(produto.id, { ativo: !produto.ativo })
}

async function removerCategoria(categoria: CategoriaProduto) {
  if (confirm(`Remover categoria "${categoria.nome}"?`)) {
    await catalogoStore.removerCategoria(categoria.id)
  }
}

async function removerProduto(produto: Produto) {
  if (confirm(`Remover produto "${produto.nome}"?`)) {
    await catalogoStore.removerProduto(produto.id)
  }
}

onMounted(async () => {
  await Promise.all([
    catalogoStore.fetchCategorias(),
    catalogoStore.fetchProdutos(),
  ])
})
</script>

<template>
  <AppLayout title="Catálogo">
    <div class="space-y-6">
      <!-- Header Editorial -->
      <div class="mb-10 max-w-5xl">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight font-headline">
              Catálogo
            </h1>
            <p class="text-on-surface-variant text-lg mt-3 max-w-2xl">
              Gerencie categorias e produtos disponíveis para eventos.
            </p>
          </div>
          <Button
            @click="abaAtiva === 'categorias' ? abrirModalCategoria() : abrirModalProduto()"
            variant="primary"
          >
            <span class="material-symbols-outlined text-xl mr-2">add</span>
            {{ abaAtiva === 'categorias' ? 'Nova categoria' : 'Novo produto' }}
          </Button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex gap-1 bg-surface-container-high rounded-xl p-1">
          <button
            @click="abaAtiva = 'categorias'"
            class="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            :class="abaAtiva === 'categorias' ? 'bg-surface-container-lowest text-on-surface signature-shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
          >
            Categorias
          </button>
          <button
            @click="abaAtiva = 'produtos'"
            class="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            :class="abaAtiva === 'produtos' ? 'bg-surface-container-lowest text-on-surface signature-shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
          >
            Produtos
          </button>
        </div>
        <div class="hidden md:flex items-center gap-2">
          <span class="h-px w-12 bg-outline-variant/30"></span>
          <span class="text-sm font-medium text-on-surface-variant">
            {{ abaAtiva === 'categorias' ? catalogoStore.categorias.length : catalogoStore.produtos.length }} itens
          </span>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="catalogoStore.loading" class="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>

      <!-- Categorias -->
      <div v-else-if="abaAtiva === 'categorias'">
        <div v-if="catalogoStore.categorias.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 bg-secondary-container rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-primary">category</span>
          </div>
          <h3 class="text-xl font-bold text-on-surface font-headline">Nenhuma categoria</h3>
          <p class="mt-2 text-on-surface-variant max-w-md mx-auto">
            Crie categorias para organizar seus produtos.
          </p>
          <div class="mt-8">
            <Button @click="abrirModalCategoria()" variant="primary">
              <span class="material-symbols-outlined mr-2">add</span>
              Criar categoria
            </Button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="categoria in catalogoStore.categorias"
            :key="categoria.id"
            class="group hover:signature-shadow transition-all duration-300"
          >
            <div class="p-5">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-on-surface truncate font-headline">
                    {{ categoria.nome }}
                  </h3>
                  <p v-if="categoria.descricao" class="text-sm text-on-surface-variant mt-1 line-clamp-2">
                    {{ categoria.descricao }}
                  </p>
                </div>
                <Badge :variant="categoria.ativo ? 'success' : 'default'" size="sm">
                  {{ categoria.ativo ? 'Ativo' : 'Inativo' }}
                </Badge>
              </div>

              <div class="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                <span class="material-symbols-outlined text-lg">inventory_2</span>
                <span>{{ categoria.produtos_count || 0 }} produtos</span>
              </div>

              <div class="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
                <Button size="sm" variant="ghost" @click="abrirModalCategoria(categoria)">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </Button>
                <Button size="sm" variant="ghost" @click="toggleAtivoCategoria(categoria)">
                  <span class="material-symbols-outlined text-lg">
                    {{ categoria.ativo ? 'visibility_off' : 'visibility' }}
                  </span>
                </Button>
                <Button
                  v-if="!categoria.produtos_count"
                  size="sm"
                  variant="ghost"
                  class="text-error"
                  @click="removerCategoria(categoria)"
                >
                  <span class="material-symbols-outlined text-lg">delete</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Produtos -->
      <div v-else>
        <!-- Filtros -->
        <div class="flex flex-wrap gap-4 mb-6">
          <div class="flex-1 min-w-[200px] max-w-sm">
            <Input
              v-model="catalogoStore.busca"
              placeholder="Buscar produto..."
              class="w-full"
            >
              <template #prefix>
                <span class="material-symbols-outlined text-on-surface-variant">search</span>
              </template>
            </Input>
          </div>
          <select
            v-model="catalogoStore.filtroCategoria"
            class="px-4 py-2 bg-surface-container-high rounded-lg text-on-surface border-0 focus:ring-2 focus:ring-primary/40"
          >
            <option :value="null">Todas categorias</option>
            <option v-for="cat in catalogoStore.categorias" :key="cat.id" :value="cat.id">
              {{ cat.nome }}
            </option>
          </select>
          <select
            v-model="catalogoStore.filtroTipo"
            class="px-4 py-2 bg-surface-container-high rounded-lg text-on-surface border-0 focus:ring-2 focus:ring-primary/40"
          >
            <option :value="null">Todos tipos</option>
            <option v-for="tipo in tiposProduto" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </option>
          </select>
        </div>

        <div v-if="catalogoStore.produtosFiltrados.length === 0" class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 bg-secondary-container rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-primary">inventory_2</span>
          </div>
          <h3 class="text-xl font-bold text-on-surface font-headline">Nenhum produto</h3>
          <p class="mt-2 text-on-surface-variant max-w-md mx-auto">
            {{ catalogoStore.busca ? 'Nenhum produto encontrado com os filtros aplicados.' : 'Crie produtos para oferecer nos eventos.' }}
          </p>
          <div v-if="!catalogoStore.busca && catalogoStore.categorias.length > 0" class="mt-8">
            <Button @click="abrirModalProduto()" variant="primary">
              <span class="material-symbols-outlined mr-2">add</span>
              Criar produto
            </Button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Card
            v-for="produto in catalogoStore.produtosFiltrados"
            :key="produto.id"
            class="group hover:signature-shadow transition-all duration-300"
          >
            <div class="p-5">
              <div class="flex items-start justify-between mb-2">
                <Badge :variant="produto.ativo ? 'info' : 'default'" size="sm">
                  {{ catalogoStore.getTipoLabel(produto.tipo) }}
                </Badge>
                <Badge :variant="produto.ativo ? 'success' : 'default'" size="sm">
                  {{ produto.ativo ? 'Ativo' : 'Inativo' }}
                </Badge>
              </div>

              <h3 class="text-lg font-bold text-on-surface truncate font-headline mt-3">
                {{ produto.nome }}
              </h3>
              <p v-if="produto.descricao" class="text-sm text-on-surface-variant mt-1 line-clamp-2">
                {{ produto.descricao }}
              </p>

              <div class="flex items-center gap-2 text-sm text-on-surface-variant mt-3">
                <span class="material-symbols-outlined text-lg">folder</span>
                <span>{{ produto.categoria?.nome || 'Sem categoria' }}</span>
              </div>

              <div class="mt-4 pt-4 border-t border-outline-variant/20">
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-primary font-headline">
                    {{ formatarMoeda(produto.preco_base) }}
                  </span>
                </div>

                <div class="flex items-center gap-2 mt-4">
                  <Button size="sm" variant="ghost" @click="abrirModalProduto(produto)">
                    <span class="material-symbols-outlined text-lg">edit</span>
                  </Button>
                  <Button size="sm" variant="ghost" @click="toggleAtivoProduto(produto)">
                    <span class="material-symbols-outlined text-lg">
                      {{ produto.ativo ? 'visibility_off' : 'visibility' }}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-error"
                    @click="removerProduto(produto)"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Modal Categoria/Produto -->
    <Modal
      :open="showModal"
      :title="modalTitulo"
      @update:open="showModal = $event"
      @close="fecharModal"
    >
      <!-- Form Categoria -->
      <form v-if="modalTipo === 'categoria'" @submit.prevent="salvarCategoria" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Nome</label>
          <Input v-model="categoriaForm.nome" required placeholder="Nome da categoria" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Descrição</label>
          <textarea
            v-model="categoriaForm.descricao"
            rows="3"
            class="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder:text-gray-400 border-0 focus:ring-2 focus:ring-primary/40 transition-all"
            placeholder="Descrição opcional"
          ></textarea>
        </div>

        <!-- Error -->
        <p v-if="catalogoStore.error" class="text-red-600 text-sm">
          {{ catalogoStore.error }}
        </p>
      </form>

      <!-- Form Produto -->
      <form v-else @submit.prevent="salvarProduto" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Categoria</label>
          <select
            v-model="produtoForm.categoria_id"
            required
            class="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-primary/40"
          >
            <option value="" disabled>Selecione uma categoria</option>
            <option v-for="cat in catalogoStore.categorias" :key="cat.id" :value="cat.id">
              {{ cat.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Nome</label>
          <Input v-model="produtoForm.nome" required placeholder="Nome do produto" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
          <select
            v-model="produtoForm.tipo"
            required
            class="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-primary/40"
          >
            <option v-for="tipo in tiposProduto" :key="tipo.value" :value="tipo.value">
              {{ tipo.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Preço base (R$)</label>
          <Input
            v-model.number="produtoForm.preco_base"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0,00"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">Descrição</label>
          <textarea
            v-model="produtoForm.descricao"
            rows="3"
            class="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900 placeholder:text-gray-400 border-0 focus:ring-2 focus:ring-primary/40 transition-all"
            placeholder="Descrição opcional"
          ></textarea>
        </div>

        <!-- Error -->
        <p v-if="catalogoStore.error" class="text-red-600 text-sm">
          {{ catalogoStore.error }}
        </p>
      </form>

      <template #footer>
        <Button type="button" variant="ghost" @click="fecharModal">Cancelar</Button>
        <Button
          type="submit"
          variant="primary"
          :disabled="catalogoStore.loading"
          @click="modalTipo === 'categoria' ? salvarCategoria() : salvarProduto()"
        >
          {{ modalModo === 'criar' ? 'Criar' : 'Salvar' }}
        </Button>
      </template>
    </Modal>
  </AppLayout>
</template>
