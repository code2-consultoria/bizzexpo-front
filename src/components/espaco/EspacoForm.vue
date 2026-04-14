<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Stand, EspacoAtivacao } from '@/types'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'

interface Props {
  tipo: 'stand' | 'espacoAtivacao'
  espaco?: Stand | EspacoAtivacao
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  submit: [
    data: {
      nome: string
      descricao?: string
      localizacao?: string
      largura?: number
      profundidade?: number
      preco?: number
      quantidade?: number
      imagem?: string
    },
  ]
  cancel: []
}>()

const nome = ref('')
const descricao = ref('')
const localizacao = ref('')
const largura = ref<number | undefined>(undefined)
const profundidade = ref<number | undefined>(undefined)
const preco = ref<number>(0)
const quantidade = ref<number>(1)
const imagem = ref<string | undefined>(undefined)

const labels = computed(() => {
  if (props.tipo === 'stand') {
    return {
      titulo: 'Stand',
      nomePlaceholder: 'Ex: Stand A1, Stand Premium',
      localizacaoPlaceholder: 'Ex: Pavilhão 1, Corredor A',
    }
  }
  return {
    titulo: 'Espaço de Ativação',
    nomePlaceholder: 'Ex: Espaço Lounge, Área VIP',
    localizacaoPlaceholder: 'Ex: Entrada Principal, Hall',
  }
})

onMounted(() => {
  if (props.espaco) {
    nome.value = props.espaco.nome
    descricao.value = props.espaco.descricao || ''
    localizacao.value = props.espaco.localizacao || ''
    largura.value = props.espaco.largura
    profundidade.value = props.espaco.profundidade
    preco.value = props.espaco.preco
    imagem.value = props.espaco.imagem
    // Quantidade so existe em Stand
    if (props.tipo === 'stand' && 'quantidade' in props.espaco) {
      quantidade.value = (props.espaco as Stand).quantidade || 1
    }
  }
})

function handleSubmit() {
  const data: {
    nome: string
    descricao?: string
    localizacao?: string
    largura?: number
    profundidade?: number
    preco?: number
    quantidade?: number
    imagem?: string
  } = {
    nome: nome.value,
    descricao: descricao.value || undefined,
    localizacao: localizacao.value || undefined,
    largura: largura.value || undefined,
    profundidade: profundidade.value || undefined,
    preco: preco.value,
    imagem: imagem.value,
  }

  // Quantidade so para Stand
  if (props.tipo === 'stand') {
    data.quantidade = quantidade.value
  }

  emit('submit', data)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div>
      <label for="nome" class="block text-sm font-medium text-gray-700">Nome *</label>
      <Input
        id="nome"
        v-model="nome"
        type="text"
        required
        :placeholder="labels.nomePlaceholder"
        class="mt-1"
      />
    </div>

    <div>
      <label for="descricao" class="block text-sm font-medium text-gray-700">Descrição</label>
      <textarea
        id="descricao"
        v-model="descricao"
        rows="3"
        class="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
        placeholder="Descrição do espaço (opcional)"
      />
    </div>

    <div>
      <label for="localizacao" class="block text-sm font-medium text-gray-700">Localização</label>
      <Input
        id="localizacao"
        v-model="localizacao"
        type="text"
        :placeholder="labels.localizacaoPlaceholder"
        class="mt-1"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="largura" class="block text-sm font-medium text-gray-700">Largura (m)</label>
        <Input
          id="largura"
          v-model.number="largura"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 3.5"
          class="mt-1"
        />
      </div>
      <div>
        <label for="profundidade" class="block text-sm font-medium text-gray-700"
          >Profundidade (m)</label
        >
        <Input
          id="profundidade"
          v-model.number="profundidade"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 4.0"
          class="mt-1"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="preco" class="block text-sm font-medium text-gray-700">Preço (R$)</label>
        <Input
          id="preco"
          v-model.number="preco"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          class="mt-1"
        />
      </div>
      <div v-if="tipo === 'stand'">
        <label for="quantidade" class="block text-sm font-medium text-gray-700">Quantidade</label>
        <Input
          id="quantidade"
          v-model.number="quantidade"
          type="number"
          min="1"
          placeholder="1"
          class="mt-1"
        />
      </div>
    </div>

    <ImageUpload v-model="imagem" label="Imagem" />

    <div class="flex gap-3">
      <Button type="submit" :loading="loading">
        {{ espaco ? 'Salvar' : `Criar ${labels.titulo}` }}
      </Button>
      <Button type="button" variant="secondary" @click="emit('cancel')"> Cancelar </Button>
    </div>
  </form>
</template>
