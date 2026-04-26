<script setup lang="ts">
import type { Pessoa, DadosReceita } from '@/types'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

interface Props {
  pessoa?: Pessoa | null
  dadosReceita?: DadosReceita | null
  modo: 'local' | 'receita'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'confirmar'): void
  (e: 'cancelar'): void
}>()

function formatarDocumento(documento: string): string {
  const numeros = documento.replace(/\D/g, '')

  if (numeros.length === 11) {
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  if (numeros.length === 14) {
    return numeros
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }

  return documento
}
</script>

<template>
  <Card>
    <div class="space-y-4">
      <!-- Ícone de sucesso -->
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">
            {{ modo === 'local' ? 'Pessoa encontrada!' : 'Empresa encontrada na Receita Federal!' }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ modo === 'local' ? 'Este cadastro já existe na nossa base.' : 'Os dados foram obtidos da Receita Federal.' }}
          </p>
        </div>
      </div>

      <!-- Dados da Pessoa Local -->
      <div v-if="modo === 'local' && pessoa" class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="text-xs text-gray-500 uppercase">Nome</span>
            <p class="font-medium text-gray-900">{{ pessoa.nome }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 uppercase">Documento</span>
            <p class="font-medium text-gray-900">{{ formatarDocumento(pessoa.documento) }}</p>
          </div>
          <div v-if="pessoa.email">
            <span class="text-xs text-gray-500 uppercase">Email</span>
            <p class="font-medium text-gray-900">{{ pessoa.email }}</p>
          </div>
          <div v-if="pessoa.telefone">
            <span class="text-xs text-gray-500 uppercase">Telefone</span>
            <p class="font-medium text-gray-900">{{ pessoa.telefone }}</p>
          </div>
        </div>
      </div>

      <!-- Dados da Receita Federal -->
      <div v-if="modo === 'receita' && dadosReceita" class="bg-gray-50 rounded-lg p-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <span class="text-xs text-gray-500 uppercase">Razão Social</span>
            <p class="font-medium text-gray-900">{{ dadosReceita.razao_social }}</p>
          </div>
          <div v-if="dadosReceita.nome_fantasia">
            <span class="text-xs text-gray-500 uppercase">Nome Fantasia</span>
            <p class="font-medium text-gray-900">{{ dadosReceita.nome_fantasia }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 uppercase">CNPJ</span>
            <p class="font-medium text-gray-900">{{ dadosReceita.cnpj }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500 uppercase">Situação</span>
            <p
              class="font-medium"
              :class="{
                'text-green-600': dadosReceita.situacao_cadastral === 'ATIVA',
                'text-red-600': dadosReceita.situacao_cadastral !== 'ATIVA'
              }"
            >
              {{ dadosReceita.situacao_cadastral }}
            </p>
          </div>
          <div v-if="dadosReceita.telefone">
            <span class="text-xs text-gray-500 uppercase">Telefone</span>
            <p class="font-medium text-gray-900">{{ dadosReceita.telefone }}</p>
          </div>
          <div v-if="dadosReceita.email">
            <span class="text-xs text-gray-500 uppercase">Email</span>
            <p class="font-medium text-gray-900">{{ dadosReceita.email }}</p>
          </div>
          <div v-if="dadosReceita.endereco.logradouro" class="md:col-span-2">
            <span class="text-xs text-gray-500 uppercase">Endereço</span>
            <p class="font-medium text-gray-900">
              {{ dadosReceita.endereco.logradouro }}<span v-if="dadosReceita.endereco.numero">, {{ dadosReceita.endereco.numero }}</span>
              <span v-if="dadosReceita.endereco.complemento"> - {{ dadosReceita.endereco.complemento }}</span>
              <br />
              <span v-if="dadosReceita.endereco.bairro">{{ dadosReceita.endereco.bairro }} - </span>
              <span v-if="dadosReceita.endereco.municipio">{{ dadosReceita.endereco.municipio }}</span>
              <span v-if="dadosReceita.endereco.uf">/{{ dadosReceita.endereco.uf }}</span>
              <span v-if="dadosReceita.endereco.cep"> - CEP: {{ dadosReceita.endereco.cep }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex justify-end gap-3 pt-2">
        <Button variant="ghost" @click="emit('cancelar')">
          Buscar outro
        </Button>
        <Button :loading="loading" @click="emit('confirmar')">
          {{ modo === 'local' ? 'Usar este cadastro' : 'Continuar com estes dados' }}
        </Button>
      </div>
    </div>
  </Card>
</template>
