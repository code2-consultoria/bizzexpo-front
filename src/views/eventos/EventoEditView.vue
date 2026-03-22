<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Spinner from '@/components/ui/Spinner.vue'
import EventoForm from '@/components/eventos/EventoForm.vue'
import { useForm } from '@/composables/useForm'
import { useEventosStore } from '@/stores/eventos'
import type { PlanoEvento } from '@/types'

const route = useRoute()
const router = useRouter()
const eventosStore = useEventosStore()

const { form, loading, errors, submit } = useForm({
  nome: '',
  slug: '',
  descricao: '',
  data_inicio: '',
  data_fim: '',
  local: '',
  plano: undefined as PlanoEvento | undefined,
})

const faturaPaga = computed(() => {
  return eventosStore.eventoAtual?.fatura_paga ?? false
})

onMounted(async () => {
  await eventosStore.fetchEvento(route.params.id as string)
})

watch(
  () => eventosStore.eventoAtual,
  (evento) => {
    if (evento) {
      form.nome = evento.nome
      form.slug = evento.slug
      form.descricao = evento.descricao
      form.data_inicio = evento.data_inicio.replace(' ', 'T').slice(0, 16)
      form.data_fim = evento.data_fim.replace(' ', 'T').slice(0, 16)
      form.local = evento.local
      form.plano = evento.plano
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  await submit(
    async (data) => {
      await eventosStore.updateEvento(route.params.id as string, data)
    },
    {
      onSuccess: () => {
        router.push(`/eventos/${route.params.id}`)
      },
    }
  )
}

function handleCancel() {
  router.push(`/eventos/${route.params.id}`)
}
</script>

<template>
  <AppLayout>
    <div v-if="eventosStore.loading && !eventosStore.eventoAtual" class="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Editar Evento</h1>

      <Card>
        <EventoForm
          v-model:form="form"
          :loading="loading"
          :errors="errors"
          :fatura-paga="faturaPaga"
          :is-edit="true"
          submit-label="Salvar Alteracoes"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </Card>
    </div>
  </AppLayout>
</template>
