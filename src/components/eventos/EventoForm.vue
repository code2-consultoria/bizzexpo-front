<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormField from '@/components/forms/FormField.vue'
import PlanoSelector from '@/components/eventos/PlanoSelector.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import type { PlanoEvento } from '@/types'

interface FormData {
  nome: string
  slug?: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  plano?: PlanoEvento
}

interface Props {
  loading?: boolean
  errors?: Record<string, string[]>
  submitLabel?: string
  faturaPaga?: boolean
  isEdit?: boolean
}

const form = defineModel<FormData>('form', { required: true })

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({}),
  submitLabel: 'Salvar',
  faturaPaga: false,
  isEdit: false,
})

const baseUrl = computed(() => {
  return `${window.location.origin}/evento/`
})

const emit = defineEmits<{
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

function getError(field: string): string | undefined {
  return props.errors[field]?.[0]
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="emit('submit')">
    <FormField label="Nome do Evento" id="nome" :error="getError('nome')" required>
      <Input
        id="nome"
        v-model="form.nome"
        placeholder="Ex: Expo Tech 2026"
        :error="getError('nome')"
      />
    </FormField>

    <FormField label="Descrição" id="descricao" :error="getError('descricao')" required>
      <RichTextEditor
        v-model="form.descricao"
        placeholder="Descreva o evento..."
        :error="getError('descricao')"
      />
    </FormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Data de início" id="data_inicio" :error="getError('data_inicio')" required>
        <Input
          id="data_inicio"
          v-model="form.data_inicio"
          type="datetime-local"
          :error="getError('data_inicio')"
        />
      </FormField>

      <FormField label="Data de término" id="data_fim" :error="getError('data_fim')" required>
        <Input
          id="data_fim"
          v-model="form.data_fim"
          type="datetime-local"
          :error="getError('data_fim')"
        />
      </FormField>
    </div>

    <FormField label="Local" id="local" :error="getError('local')" required>
      <Input
        id="local"
        v-model="form.local"
        placeholder="Ex: Centro de Convenções"
        :error="getError('local')"
      />
    </FormField>

    <!-- Slug (apenas em edição) -->
    <FormField v-if="isEdit" label="URL do Evento" id="slug" :error="getError('slug')">
      <div class="flex">
        <span class="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg whitespace-nowrap">
          {{ baseUrl }}
        </span>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          placeholder="meu-evento"
          class="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :class="{ 'border-red-500 focus:ring-red-500': getError('slug') }"
        />
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Use apenas letras minúsculas, números e hifens.
      </p>
    </FormField>

    <FormField label="Plano do Evento" id="plano" :error="getError('plano')" required>
      <PlanoSelector v-model="form.plano" :error="getError('plano')" :disabled="faturaPaga" />
      <p v-if="faturaPaga" class="mt-2 text-sm text-amber-600">
        O plano não pode ser alterado pois a fatura já foi paga.
      </p>
    </FormField>

    <div class="flex justify-end gap-4">
      <Button type="button" variant="ghost" @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" :loading="loading">{{ submitLabel }}</Button>
    </div>
  </form>
</template>
