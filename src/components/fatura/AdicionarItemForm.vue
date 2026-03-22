<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import api from '@/services/api'

interface Props {
  faturaId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'item-adicionado'): void
}>()

const descricao = ref('')
const quantidade = ref(1)
const precoUnitario = ref<number | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)

const subtotal = computed(() => {
  if (!precoUnitario.value || !quantidade.value) return 0
  return precoUnitario.value * quantidade.value
})

const formValido = computed(() => {
  return descricao.value.trim().length > 0 &&
    quantidade.value > 0 &&
    precoUnitario.value !== null &&
    precoUnitario.value > 0
})

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function limparForm() {
  descricao.value = ''
  quantidade.value = 1
  precoUnitario.value = null
  error.value = null
}

function abrirForm() {
  showForm.value = true
  limparForm()
}

function fecharForm() {
  showForm.value = false
  limparForm()
}

async function adicionarItem() {
  if (!formValido.value) return

  loading.value = true
  error.value = null

  try {
    await api.post(`/admin/faturas/${props.faturaId}/itens`, {
      descricao: descricao.value.trim(),
      quantidade: quantidade.value,
      preco_unitario: precoUnitario.value,
    })

    emit('item-adicionado')
    fecharForm()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erro ao adicionar item'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Botao para abrir form -->
    <Button
      v-if="!showForm"
      variant="secondary"
      class="w-full"
      @click="abrirForm"
    >
      <span class="material-symbols-outlined mr-2">add</span>
      Adicionar Item
    </Button>

    <!-- Formulario -->
    <div
      v-else
      class="p-6 bg-surface-container-low rounded-2xl space-y-4"
    >
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold text-on-surface">Novo Item</h4>
        <button
          @click="fecharForm"
          class="text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Erro -->
      <div
        v-if="error"
        class="p-3 bg-error-container text-on-error-container rounded-xl text-sm"
      >
        {{ error }}
      </div>

      <!-- Descricao -->
      <div>
        <label class="block text-sm font-medium text-on-surface-variant mb-2">
          Descricao
        </label>
        <input
          v-model="descricao"
          type="text"
          placeholder="Ex: Estande Premium 3x3m"
          class="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl
                 placeholder:text-on-surface-variant/50
                 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <!-- Quantidade e Preco -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface-variant mb-2">
            Quantidade
          </label>
          <input
            v-model.number="quantidade"
            type="number"
            min="1"
            step="1"
            class="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface-variant mb-2">
            Preco Unitario (R$)
          </label>
          <input
            v-model.number="precoUnitario"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            class="w-full px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      <!-- Subtotal -->
      <div
        v-if="subtotal > 0"
        class="flex justify-between items-center py-3 border-t border-outline-variant/20"
      >
        <span class="text-on-surface-variant">Subtotal</span>
        <span class="font-semibold text-on-surface">{{ formatarMoeda(subtotal) }}</span>
      </div>

      <!-- Acoes -->
      <div class="flex gap-3 pt-2">
        <Button
          variant="ghost"
          class="flex-1"
          :disabled="loading"
          @click="fecharForm"
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          class="flex-1"
          :disabled="!formValido || loading"
          @click="adicionarItem"
        >
          <span v-if="loading" class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
          {{ loading ? 'Adicionando...' : 'Adicionar' }}
        </Button>
      </div>
    </div>
  </div>
</template>
