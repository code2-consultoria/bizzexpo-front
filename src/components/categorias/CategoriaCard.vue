<script setup lang="ts">
import { computed } from 'vue'
import type { Categoria } from '@/types'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

interface Props {
  categoria: Categoria
  eventoId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const precoFormatado = computed(() => {
  if (props.categoria.cortesia || props.categoria.preco === 0) {
    return 'Gratuito'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(props.categoria.preco)
})

const quantidadeTexto = computed(() => {
  if (props.categoria.quantidade === null || props.categoria.quantidade === undefined) {
    return 'Ilimitado'
  }
  const vendidos = props.categoria.quantidade_vendida ?? 0
  const reservados = props.categoria.quantidade_reservada ?? 0
  const disponiveis = props.categoria.quantidade_disponivel ?? props.categoria.quantidade - vendidos - reservados
  return `${disponiveis} / ${props.categoria.quantidade}`
})

const periodoTexto = computed(() => {
  if (!props.categoria.periodo_inicio && !props.categoria.periodo_fim) {
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  if (props.categoria.periodo_inicio && props.categoria.periodo_fim) {
    return `${formatDate(props.categoria.periodo_inicio)} até ${formatDate(props.categoria.periodo_fim)}`
  }

  if (props.categoria.periodo_inicio) {
    return `A partir de ${formatDate(props.categoria.periodo_inicio)}`
  }

  return `Até ${formatDate(props.categoria.periodo_fim!)}`
})
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    :class="{ 'opacity-60': !categoria.ativo }"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <!-- Nome e Badges -->
        <div class="flex items-center gap-2 flex-wrap">
          <h3 class="text-lg font-semibold text-gray-900 truncate">{{ categoria.nome }}</h3>
          <Badge v-if="categoria.cortesia" variant="info" size="sm">Cortesia</Badge>
          <Badge v-if="!categoria.ativo" variant="warning" size="sm">Inativo</Badge>
          <Badge v-if="categoria.esgotado" variant="danger" size="sm">Esgotado</Badge>
        </div>

        <!-- Descricao -->
        <p v-if="categoria.descricao" class="mt-1 text-sm text-gray-600 line-clamp-2">
          {{ categoria.descricao }}
        </p>

        <!-- Informacoes principais -->
        <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <!-- Preco -->
          <div class="flex items-center gap-1">
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              class="font-medium"
              :class="categoria.cortesia || categoria.preco === 0 ? 'text-green-600' : 'text-gray-900'"
            >
              {{ precoFormatado }}
            </span>
          </div>

          <!-- Quantidade -->
          <div class="flex items-center gap-1">
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span class="text-gray-700">{{ quantidadeTexto }}</span>
          </div>
        </div>

        <!-- Periodo de venda -->
        <div v-if="periodoTexto" class="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ periodoTexto }}</span>
        </div>
      </div>
    </div>

    <!-- Acoes -->
    <div class="mt-4 flex gap-2">
      <Button variant="secondary" size="sm" @click="emit('edit', categoria.id)">
        Editar
      </Button>
      <Button variant="danger" size="sm" @click="emit('delete', categoria.id)">
        Excluir
      </Button>
    </div>
  </div>
</template>
