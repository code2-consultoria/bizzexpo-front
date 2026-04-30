<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import CategoriaForm from '@/components/categorias/CategoriaForm.vue'
import Button from '@/components/ui/Button.vue'
import { useCategoriasStore, type CategoriaFormData } from '@/stores/categorias'

const route = useRoute()
const router = useRouter()
const categoriasStore = useCategoriasStore()

const eventoId = route.params.eventoId as string
const loading = ref(false)

async function handleSubmit(data: CategoriaFormData) {
  loading.value = true
  try {
    await categoriasStore.createCategoria(eventoId, data)
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
      <h1 class="text-2xl font-bold text-gray-900 mt-2">Nova categoria</h1>
    </div>

    <div class="max-w-xl">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <CategoriaForm
          :loading="loading"
          @submit="handleSubmit"
          @cancel="router.push(`/eventos/${eventoId}/categorias`)"
        />
      </div>
    </div>
  </AppLayout>
</template>
