<script setup lang="ts">
import type { CotaPatrocinio } from '@/types'
import Button from '@/components/ui/Button.vue'

interface Props {
  cota: CotaPatrocinio
  confirmDelete?: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <span class="inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-2 bg-yellow-100 text-yellow-800">
          Cota de patrocínio
        </span>
        <h3 class="font-semibold text-gray-900">{{ cota.nome }}</h3>
        <p v-if="cota.descricao" class="text-sm text-gray-500 mt-1 line-clamp-2">
          {{ cota.descricao }}
        </p>
        <div class="flex items-center gap-4 mt-2">
          <p class="text-lg font-bold text-gray-900">
            {{ formatCurrency(cota.preco) }}
          </p>
          <span class="text-sm text-gray-500">
            <svg class="inline-block w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {{ cota.limite_patrocinadores ? `Limite: ${cota.limite_patrocinadores}` : 'Ilimitado' }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <Button size="sm" variant="secondary" @click="emit('edit', cota.id)"> Editar </Button>
      <Button
        size="sm"
        :variant="confirmDelete ? 'danger' : 'ghost'"
        @click="emit('delete', cota.id)"
      >
        {{ confirmDelete ? 'Confirmar' : 'Excluir' }}
      </Button>
    </div>
  </div>
</template>
