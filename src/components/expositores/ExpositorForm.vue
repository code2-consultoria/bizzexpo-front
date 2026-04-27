<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormField from '@/components/forms/FormField.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'

interface FormData {
  nome_empresa: string
  cnpj: string
  nome_contato: string
  email_contato: string
  telefone: string
  site: string
  descricao: string
  logo?: string
}

interface Props {
  loading?: boolean
  errors?: Record<string, string[]>
  submitLabel?: string
  modo?: 'criar' | 'editar' | 'confirmar'
  camposReadOnly?: string[]
  tipoPessoa?: 'pf' | 'pj'
}

const form = defineModel<FormData>('form', { required: true })

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  errors: () => ({}),
  submitLabel: 'Salvar',
  modo: 'criar',
  camposReadOnly: () => ([]),
  tipoPessoa: 'pj',
})

const labelNome = computed(() => props.tipoPessoa === 'pf' ? 'Nome' : 'Nome da Empresa')
const placeholderNome = computed(() => props.tipoPessoa === 'pf' ? 'Nome completo' : 'Nome da empresa')
const labelDocumento = computed(() => props.tipoPessoa === 'pf' ? 'CPF' : 'CNPJ')
const placeholderDocumento = computed(() => props.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00')
const labelLogo = computed(() => props.tipoPessoa === 'pf' ? 'Foto' : 'Logo da Empresa')
const placeholderDescricao = computed(() => props.tipoPessoa === 'pf' ? 'Descrição' : 'Descrição da empresa')

function isReadOnly(campo: string): boolean {
  return props.camposReadOnly.includes(campo)
}

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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField :label="labelNome" id="nome_empresa" :error="getError('nome_empresa')" required>
        <Input
          id="nome_empresa"
          v-model="form.nome_empresa"
          :placeholder="placeholderNome"
          :error="getError('nome_empresa')"
          :disabled="isReadOnly('nome_empresa')"
        />
      </FormField>

      <FormField :label="labelDocumento" id="cnpj" :error="getError('cnpj')">
        <Input
          id="cnpj"
          v-model="form.cnpj"
          :placeholder="placeholderDocumento"
          :error="getError('cnpj')"
          :disabled="isReadOnly('cnpj')"
        />
      </FormField>

      <FormField label="Nome do Contato" id="nome_contato" :error="getError('nome_contato')" required>
        <Input
          id="nome_contato"
          v-model="form.nome_contato"
          placeholder="Nome do responsável"
          :error="getError('nome_contato')"
          :disabled="isReadOnly('nome_contato')"
        />
      </FormField>

      <FormField label="Email de Contato" id="email_contato" :error="getError('email_contato')" required>
        <Input
          id="email_contato"
          v-model="form.email_contato"
          type="email"
          placeholder="email@empresa.com"
          :error="getError('email_contato')"
          :disabled="isReadOnly('email_contato')"
        />
      </FormField>

      <FormField label="Telefone" id="telefone" :error="getError('telefone')" required>
        <Input
          id="telefone"
          v-model="form.telefone"
          placeholder="(00) 00000-0000"
          :error="getError('telefone')"
          :disabled="isReadOnly('telefone')"
        />
      </FormField>

      <FormField label="Site" id="site" :error="getError('site')">
        <Input
          id="site"
          v-model="form.site"
          type="url"
          placeholder="https://empresa.com"
          :error="getError('site')"
          :disabled="isReadOnly('site')"
        />
      </FormField>
    </div>

    <FormField label="Descrição" id="descricao" :error="getError('descricao')">
      <textarea
        id="descricao"
        v-model="form.descricao"
        rows="3"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
        :placeholder="placeholderDescricao"
        :disabled="isReadOnly('descricao')"
      />
    </FormField>

    <FormField :label="labelLogo" id="logo" :error="getError('logo')">
      <ImageUpload
        v-model="form.logo"
        label=""
        :max-size="2"
      />
      <p class="mt-1 text-xs text-gray-500">
        Recomendado: 1024x1024px. Será exibida no carrossel de expositores.
      </p>
    </FormField>

    <div class="flex justify-end gap-4">
      <Button type="button" variant="ghost" @click="emit('cancel')">Cancelar</Button>
      <Button type="submit" :loading="loading">{{ submitLabel }}</Button>
    </div>
  </form>
</template>
