<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import CotaCard from '@/components/cotasPatrocinio/CotaCard.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useCotasPatrocinioStore } from '@/stores/cotasPatrocinio'
import { useEventosStore } from '@/stores/eventos'

const route = useRoute()
const router = useRouter()
const cotasStore = useCotasPatrocinioStore()
const eventosStore = useEventosStore()

const eventoId = route.params.eventoId as string
const deleteConfirm = ref<string | null>(null)

onMounted(async () => {
  await eventosStore.fetchEvento(eventoId)
  await cotasStore.fetchCotas(eventoId)
})

function handleEdit(id: string) {
  router.push(`/eventos/${eventoId}/cotas-patrocinio/${id}/editar`)
}

async function handleDelete(id: string) {
  if (deleteConfirm.value !== id) {
    deleteConfirm.value = id
    return
  }

  await cotasStore.deleteCota(eventoId, id)
  deleteConfirm.value = null
}
</script>

<template>
  <AppLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <Button variant="ghost" size="sm" @click="router.push(`/eventos/${eventoId}`)">
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Voltar
        </Button>
        <h1 class="text-2xl font-bold text-gray-900 mt-2">
          Cotas de patrocínio
          <span v-if="eventosStore.eventoAtual" class="text-gray-500 font-normal">
            - {{ eventosStore.eventoAtual.nome }}
          </span>
        </h1>
        <p class="text-gray-500 mt-1 text-sm">Gerencie as cotas de patrocínio do evento</p>
      </div>
      <Button @click="router.push(`/eventos/${eventoId}/cotas-patrocinio/criar`)">
        Nova cota
      </Button>
    </div>

    <div v-if="cotasStore.loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else-if="cotasStore.cotas.length === 0" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma cota de patrocínio</h3>
      <p class="mt-1 text-sm text-gray-500">Adicione a primeira cota de patrocínio ao evento.</p>
      <div class="mt-6">
        <Button @click="router.push(`/eventos/${eventoId}/cotas-patrocinio/criar`)">
          Adicionar cota
        </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CotaCard
        v-for="cota in cotasStore.cotas"
        :key="cota.id"
        :cota="cota"
        :confirm-delete="deleteConfirm === cota.id"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </AppLayout>
</template>
