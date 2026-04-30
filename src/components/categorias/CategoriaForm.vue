<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Categoria } from '@/types'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

interface Props {
  categoria?: Categoria
  loading?: boolean
}

interface CategoriaFormData {
  nome: string
  descricao?: string
  preco: number
  quantidade?: number | null
  periodo_inicio?: string | null
  periodo_fim?: string | null
  cortesia: boolean
  ativo: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [data: CategoriaFormData]
  cancel: []
}>()

const nome = ref('')
const descricao = ref('')
const preco = ref<number>(0)
const quantidade = ref<number | undefined>(undefined)
const semLimiteQuantidade = ref(true)
const periodoInicio = ref('')
const periodoFim = ref('')
const cortesia = ref(false)
const ativo = ref(true)

const isGratuito = computed(() => cortesia.value || preco.value === 0)

watch(cortesia, (value) => {
  if (value) {
    preco.value = 0
  }
})

onMounted(() => {
  if (props.categoria) {
    nome.value = props.categoria.nome
    descricao.value = props.categoria.descricao || ''
    preco.value = props.categoria.preco ?? 0
    quantidade.value = props.categoria.quantidade ?? undefined
    semLimiteQuantidade.value = props.categoria.quantidade === null || props.categoria.quantidade === undefined
    periodoInicio.value = props.categoria.periodo_inicio
      ? formatDateTimeForInput(props.categoria.periodo_inicio)
      : ''
    periodoFim.value = props.categoria.periodo_fim
      ? formatDateTimeForInput(props.categoria.periodo_fim)
      : ''
    cortesia.value = props.categoria.cortesia ?? false
    ativo.value = props.categoria.ativo ?? true
  }
})

function formatDateTimeForInput(dateString: string): string {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

function handleSubmit() {
  emit('submit', {
    nome: nome.value,
    descricao: descricao.value || undefined,
    preco: cortesia.value ? 0 : preco.value,
    quantidade: semLimiteQuantidade.value ? null : (quantidade.value ?? null),
    periodo_inicio: periodoInicio.value || null,
    periodo_fim: periodoFim.value || null,
    cortesia: cortesia.value,
    ativo: ativo.value,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nome -->
    <div>
      <label for="nome" class="block text-sm font-medium text-gray-700">Nome *</label>
      <Input
        id="nome"
        v-model="nome"
        type="text"
        required
        placeholder="Ex: VIP, Standard, Premium"
        class="mt-1"
      />
    </div>

    <!-- Descricao -->
    <div>
      <label for="descricao" class="block text-sm font-medium text-gray-700">Descrição</label>
      <textarea
        id="descricao"
        v-model="descricao"
        rows="3"
        class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Descrição do tipo de ingresso (opcional)"
      />
    </div>

    <!-- Cortesia -->
    <div class="flex items-center gap-3">
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          v-model="cortesia"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">Cortesia (ingresso gratuito)</span>
      </label>
    </div>

    <!-- Preco -->
    <div v-if="!cortesia">
      <label for="preco" class="block text-sm font-medium text-gray-700">Preço (R$) *</label>
      <Input
        id="preco"
        v-model.number="preco"
        type="number"
        step="0.01"
        min="0"
        required
        placeholder="0.00"
        class="mt-1"
      />
      <p v-if="isGratuito && !cortesia" class="mt-1 text-sm text-green-600">
        Ingresso gratuito
      </p>
    </div>

    <!-- Quantidade -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Quantidade disponível</label>
      <div class="flex items-center gap-4">
        <label class="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            v-model="semLimiteQuantidade"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700">Sem limite (ilimitado)</span>
        </label>
      </div>
      <Input
        v-if="!semLimiteQuantidade"
        id="quantidade"
        v-model.number="quantidade"
        type="number"
        min="1"
        placeholder="Número máximo de ingressos"
        class="mt-2"
      />
    </div>

    <!-- Periodo de Venda -->
    <div class="space-y-4">
      <p class="text-sm font-medium text-gray-700">Período de venda (opcional)</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="periodo_inicio" class="block text-sm text-gray-600">Início das vendas</label>
          <input
            id="periodo_inicio"
            v-model="periodoInicio"
            type="datetime-local"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="periodo_fim" class="block text-sm text-gray-600">Fim das vendas</label>
          <input
            id="periodo_fim"
            v-model="periodoFim"
            type="datetime-local"
            :min="periodoInicio"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500">
        Deixe em branco para que o ingresso fique disponível durante todo o período do evento.
      </p>
    </div>

    <!-- Ativo -->
    <div class="flex items-center gap-3">
      <label class="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          v-model="ativo"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="ml-2 text-sm text-gray-700">Ativo (disponível para venda)</span>
      </label>
    </div>

    <!-- Acoes -->
    <div class="flex gap-3 pt-4 border-t border-gray-200">
      <Button type="submit" :loading="loading">
        {{ categoria ? 'Salvar' : 'Criar Tipo de Ingresso' }}
      </Button>
      <Button type="button" variant="secondary" @click="emit('cancel')">
        Cancelar
      </Button>
    </div>
  </form>
</template>
