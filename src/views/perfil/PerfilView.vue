<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import FormField from '@/components/forms/FormField.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import Spinner from '@/components/ui/Spinner.vue'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'
import { useOrganizadorStore } from '@/stores/organizador'

const authStore = useAuthStore()
const organizadorStore = useOrganizadorStore()

const { form, loading, generalError, getError, submit } = useForm({
  telefone: '',
  empresa: '',
  cnpj: '',
  cargo: '',
  logo: undefined as string | undefined,
})

const successMessage = ref<string | null>(null)

function populateForm() {
  if (organizadorStore.organizador) {
    form.telefone = organizadorStore.organizador.telefone || ''
    form.empresa = organizadorStore.organizador.empresa || ''
    form.cnpj = organizadorStore.organizador.cnpj || ''
    form.cargo = organizadorStore.organizador.cargo || ''
    form.logo = organizadorStore.organizador.logo || undefined
  }
}

watch(() => organizadorStore.organizador, populateForm, { immediate: true })

onMounted(async () => {
  await organizadorStore.fetchOrganizador()
})

async function handleSubmit() {
  successMessage.value = null
  await submit(
    async (data) => {
      await organizadorStore.updateOrganizador(data)
    },
    {
      onSuccess: () => {
        successMessage.value = 'Perfil atualizado com sucesso'
        setTimeout(() => {
          successMessage.value = null
        }, 3000)
      },
    }
  )
}

function formatCnpj(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 14) value = value.slice(0, 14)

  if (value.length > 12) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  } else if (value.length > 8) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4')
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3')
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '$1.$2')
  }

  form.cnpj = value
}

function formatTelefone(event: Event) {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')

  if (value.length > 11) value = value.slice(0, 11)

  if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3')
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '($1) $2')
  }

  form.telefone = value
}
</script>

<template>
  <AppLayout title="Meu perfil">
    <div class="max-w-2xl mx-auto">
      <div v-if="organizadorStore.loading" class="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>

      <template v-else>
        <!-- Informações do usuário -->
        <Card class="mb-6">
          <div class="flex items-center gap-4 mb-6">
            <div
              class="w-16 h-16 rounded-full bg-secondary-container text-primary flex items-center justify-center text-2xl font-semibold"
            >
              {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-on-surface">{{ authStore.user?.name }}</h2>
              <p class="text-on-surface-variant">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <RouterLink
            to="/perfil/alterar-senha"
            class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
          >
            <span class="material-symbols-outlined text-[18px]">lock</span>
            Alterar senha
          </RouterLink>
        </Card>

        <!-- Formulário organizador -->
        <Card>
          <h3 class="text-lg font-semibold text-on-surface mb-6">Dados do Organizador</h3>

          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div v-if="generalError" class="p-3 bg-error-container text-on-error-container rounded-lg">
              {{ generalError }}
            </div>

            <div
              v-if="successMessage"
              class="p-3 bg-tertiary-container text-on-tertiary-container rounded-lg"
            >
              {{ successMessage }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Empresa" id="empresa" :error="getError('empresa')" required>
                <Input
                  id="empresa"
                  v-model="form.empresa"
                  placeholder="Nome da empresa"
                  :error="getError('empresa')"
                />
              </FormField>

              <FormField label="CNPJ" id="cnpj" :error="getError('cnpj')" required>
                <Input
                  id="cnpj"
                  :model-value="form.cnpj"
                  placeholder="00.000.000/0000-00"
                  :error="getError('cnpj')"
                  @input="formatCnpj"
                />
              </FormField>

              <FormField label="Telefone" id="telefone" :error="getError('telefone')" required>
                <Input
                  id="telefone"
                  :model-value="form.telefone"
                  placeholder="(00) 00000-0000"
                  :error="getError('telefone')"
                  @input="formatTelefone"
                />
              </FormField>

              <FormField label="Cargo" id="cargo" :error="getError('cargo')">
                <Input
                  id="cargo"
                  v-model="form.cargo"
                  placeholder="Seu cargo na empresa"
                  :error="getError('cargo')"
                />
              </FormField>
            </div>

            <FormField label="Logo da Empresa" id="logo" :error="getError('logo')">
              <ImageUpload
                v-model="form.logo"
                label=""
                :max-size="2"
              />
              <p class="mt-1 text-xs text-gray-500">
                Recomendado: 512x512px. Sua logo aparecera em todos os seus eventos.
              </p>
            </FormField>

            <div class="flex justify-end pt-4">
              <Button type="submit" :loading="loading">Salvar alterações</Button>
            </div>
          </form>
        </Card>
      </template>
    </div>
  </AppLayout>
</template>
