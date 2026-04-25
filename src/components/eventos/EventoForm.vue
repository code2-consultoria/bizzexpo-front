<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormField from '@/components/forms/FormField.vue'
import PlanoSelector from '@/components/eventos/PlanoSelector.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import ColorPicker from '@/components/ui/ColorPicker.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import { useOrganizadorStore } from '@/stores/organizador'
import type { PlanoEvento, EventoCustomizacao } from '@/types'

interface FormData {
  nome: string
  slug?: string
  descricao: string
  data_inicio: string
  data_fim: string
  local: string
  whatsapp_contato?: string
  plano?: PlanoEvento
  banner?: string
  og_image?: string
  customizacao?: EventoCustomizacao | null
}

const organizadorStore = useOrganizadorStore()

onMounted(async () => {
  // Busca dados do organizador para poder copiar o telefone
  if (!organizadorStore.organizador) {
    await organizadorStore.fetchOrganizador()
  }
})

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

// Formata telefone para exibicao
function formatTelefone(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 11) value = value.slice(0, 11)

  if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3')
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '($1) $2')
  }

  form.value.whatsapp_contato = value
}

// Copia telefone do organizador
function copiarTelefoneOrganizador() {
  if (organizadorStore.organizador?.telefone) {
    form.value.whatsapp_contato = organizadorStore.organizador.telefone
  }
}

// Atualiza uma cor especifica da customizacao
function atualizarCor(chave: keyof NonNullable<typeof form.value.customizacao>, valor: string | null) {
  if (!form.value.customizacao) {
    form.value.customizacao = {}
  }
  form.value.customizacao[chave] = valor
}

// Restaura cores padrao
function restaurarCoresPadrao() {
  form.value.customizacao = null
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

    <FormField label="WhatsApp para contato" id="whatsapp_contato" :error="getError('whatsapp_contato')">
      <div class="flex gap-2">
        <Input
          id="whatsapp_contato"
          :model-value="form.whatsapp_contato || ''"
          placeholder="(00) 00000-0000"
          :error="getError('whatsapp_contato')"
          class="flex-1"
          @input="formatTelefone"
        />
        <button
          v-if="organizadorStore.organizador?.telefone"
          type="button"
          @click="copiarTelefoneOrganizador"
          class="px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors whitespace-nowrap"
        >
          Copiar do meu cadastro
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        Este número será exibido como botão de contato na página pública do evento.
      </p>
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

    <!-- Imagens do Evento (apenas em edição) -->
    <div v-if="isEdit" class="space-y-4 border-t pt-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Imagens do Evento</h3>
        <p class="text-sm text-gray-500">Adicione imagens para personalizar a página e divulgação do evento</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Banner do Evento" id="banner" :error="getError('banner')">
          <ImageUpload
            v-model="form.banner"
            label=""
            :max-size="5"
          />
          <p class="mt-1 text-xs text-gray-500">
            Recomendado: 1920x600px. Exibido no topo da página do evento.
          </p>
        </FormField>

        <FormField label="Imagem de Divulgação (SEO)" id="og_image" :error="getError('og_image')">
          <ImageUpload
            v-model="form.og_image"
            label=""
            :max-size="2"
          />
          <p class="mt-1 text-xs text-gray-500">
            Recomendado: 1200x630px. Exibida em cards do WhatsApp, Facebook e LinkedIn.
          </p>
        </FormField>
      </div>
    </div>

    <!-- Personalização visual (apenas em edição) -->
    <div v-if="isEdit" class="space-y-4 border-t pt-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Personalização visual</h3>
          <p class="text-sm text-gray-500">Customize as cores da página pública do seu evento</p>
        </div>
        <button
          type="button"
          class="text-sm text-primary hover:underline"
          @click="restaurarCoresPadrao"
        >
          Restaurar padrão
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ColorPicker
          :model-value="form.customizacao?.cor_primaria ?? null"
          label="Cor Primaria"
          :error="getError('customizacao.cor_primaria')"
          @update:model-value="(v) => atualizarCor('cor_primaria', v)"
        />

        <ColorPicker
          :model-value="form.customizacao?.cor_secundaria ?? null"
          label="Cor Secundaria"
          :error="getError('customizacao.cor_secundaria')"
          @update:model-value="(v) => atualizarCor('cor_secundaria', v)"
        />

        <ColorPicker
          :model-value="form.customizacao?.cor_fundo ?? null"
          label="Cor de Fundo"
          :error="getError('customizacao.cor_fundo')"
          :presets="['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#1e293b', '#0f172a']"
          @update:model-value="(v) => atualizarCor('cor_fundo', v)"
        />

        <ColorPicker
          :model-value="form.customizacao?.cor_texto ?? null"
          label="Cor do Texto"
          :error="getError('customizacao.cor_texto')"
          :presets="['#1e293b', '#334155', '#475569', '#64748b', '#ffffff', '#f8fafc']"
          @update:model-value="(v) => atualizarCor('cor_texto', v)"
        />
      </div>
    </div>

    <div class="flex justify-end gap-4">
      <Button type="button" variant="ghost" @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" :loading="loading">{{ submitLabel }}</Button>
    </div>
  </form>
</template>
