<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoriaCard from '@/components/categorias/CategoriaCard.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useCategoriasStore } from '@/stores/categorias'
import { useEventosStore } from '@/stores/eventos'

const route = useRoute()
const router = useRouter()
const categoriasStore = useCategoriasStore()
const eventosStore = useEventosStore()

const eventoId = route.params.eventoId as string
const deleteConfirm = ref<string | null>(null)

onMounted(async () => {
  await eventosStore.fetchEvento(eventoId)
  await categoriasStore.fetchCategorias(eventoId)
})

function handleEdit(id: string) {
  router.push(`/eventos/${eventoId}/categorias/${id}/editar`)
}

async function handleDelete(id: string) {
  if (deleteConfirm.value !== id) {
    deleteConfirm.value = id
    return
  }

  await categoriasStore.deleteCategoria(eventoId, id)
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
          Categorias de ticket
          <span v-if="eventosStore.eventoAtual" class="text-gray-500 font-normal">
            - {{ eventosStore.eventoAtual.nome }}
          </span>
        </h1>
        <p class="text-gray-500 mt-1 text-sm">
          Todos os tickets cadastrados aqui serão apresentados na página do evento
        </p>
      </div>
      <Button @click="router.push(`/eventos/${eventoId}/categorias/criar`)">
        Nova categoria
      </Button>
    </div>

    <div v-if="categoriasStore.loading" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else-if="categoriasStore.categorias.length === 0" class="text-center py-12">
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Nenhuma categoria</h3>
      <p class="mt-1 text-sm text-gray-500">Adicione a primeira categoria ao evento.</p>
      <div class="mt-6">
        <Button @click="router.push(`/eventos/${eventoId}/categorias/criar`)">
          Adicionar categoria
        </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CategoriaCard
        v-for="categoria in categoriasStore.categorias"
        :key="categoria.id"
        :categoria="categoria"
        :evento-id="eventoId"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </AppLayout>
</template>
