<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoriaForm from '@/components/categorias/CategoriaForm.vue'
import Button from '@/components/ui/Button.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useCategoriasStore, type CategoriaFormData } from '@/stores/categorias'

const route = useRoute()
const router = useRouter()
const categoriasStore = useCategoriasStore()

const eventoId = route.params.eventoId as string
const categoriaId = route.params.id as string
const loading = ref(false)
const loadingData = ref(true)

onMounted(async () => {
  await categoriasStore.fetchCategoria(eventoId, categoriaId)
  loadingData.value = false
})

async function handleSubmit(data: Partial<CategoriaFormData>) {
  loading.value = true
  try {
    await categoriasStore.updateCategoria(eventoId, categoriaId, data)
    router.push(`/eventos/${eventoId}/categorias`)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="mb-6">
      <Button variant="ghost" size="sm" @click="router.push(`/eventos/${eventoId}/categorias`)">
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
      <h1 class="text-2xl font-bold text-gray-900 mt-2">Editar categoria</h1>
    </div>

    <div v-if="loadingData" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else class="max-w-xl">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CategoriaForm
          :categoria="categoriasStore.categoriaAtual!"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="router.push(`/eventos/${eventoId}/categorias`)"
        />
      </div>
    </div>
  </AppLayout>
</template>
