<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useForm } from '@/composables/useForm'
import api from '@/services/api'

const emailSent = ref(false)

const { form, loading, generalError, getError, submit } = useForm({
  email: '',
})

async function handleSubmit() {
  await submit(
    async (data) => {
      await api.post('/forgot-password', data)
    },
    {
      onSuccess: () => {
        emailSent.value = true
      },
    }
  )
}
</script>

<template>
  <AuthLayout>
    <!-- Card de Recuperacao -->
    <div class="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
      <!-- Sucesso -->
      <div v-if="emailSent" class="text-center space-y-6">
        <div class="flex items-center justify-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 mb-3">Email enviado!</h1>
          <p class="text-gray-500">
            Enviamos um link de recuperacao para <strong class="text-gray-700">{{ form.email }}</strong>.
            Verifique sua caixa de entrada.
          </p>
        </div>
        <RouterLink
          to="/login"
          class="inline-flex items-center justify-center w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
        >
          Voltar para o login
        </RouterLink>
      </div>

      <!-- Formulario -->
      <template v-else>
        <!-- Titulo -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
          <p class="text-gray-500 mt-2">Insira seu e-mail para receber as instrucoes de recuperacao.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Erro geral -->
          <div v-if="generalError" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {{ generalError }}
          </div>

          <!-- E-mail -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              required
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 text-gray-900 placeholder-gray-400"
              :class="{ 'border-red-500': getError('email') }"
            />
            <span v-if="getError('email')" class="text-red-500 text-xs mt-1">{{ getError('email') }}</span>
          </div>

          <!-- Botao Enviar -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <span v-if="loading">Enviando...</span>
            <span v-else>Enviar link de recuperacao</span>
          </button>
        </form>

        <!-- Divisor -->
        <div class="flex items-center gap-4 my-6">
          <div class="flex-1 h-px bg-gray-200"></div>
        </div>

        <!-- Link voltar -->
        <div class="text-center">
          <RouterLink
            to="/login"
            class="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar para o login
          </RouterLink>
        </div>
      </template>
    </div>
  </AuthLayout>
</template>
