<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useForm } from '@/composables/useForm'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showPassword = ref(false)

const { form, loading, generalError, getError, submit } = useForm({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

async function handleSubmit() {
  await submit(
    async (data) => {
      await authStore.register(data)
    },
    {
      onSuccess: () => {
        router.push('/organizador/cadastro')
      },
    }
  )
}
</script>

<template>
  <AuthLayout>
    <!-- Titulo acima do card -->
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Crie sua conta</h1>
      <p class="text-gray-500 mt-2">Junte-se a nossa comunidade</p>
    </div>

    <!-- Card de Cadastro -->
    <div class="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Erro geral -->
        <div v-if="generalError" class="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {{ generalError }}
        </div>

        <!-- Nome completo -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Seu nome completo"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 text-gray-900 placeholder-gray-400"
            :class="{ 'border-red-500': getError('name') }"
          />
          <span v-if="getError('name')" class="text-red-500 text-xs mt-1">{{ getError('name') }}</span>
        </div>

        <!-- E-mail -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="seu@email.com"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 text-gray-900 placeholder-gray-400"
            :class="{ 'border-red-500': getError('email') }"
          />
          <span v-if="getError('email')" class="text-red-500 text-xs mt-1">{{ getError('email') }}</span>
        </div>

        <!-- Senha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="********"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 text-gray-900 placeholder-gray-400 pr-12"
              :class="{ 'border-red-500': getError('password') }"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
          <span v-if="getError('password')" class="text-red-500 text-xs mt-1">{{ getError('password') }}</span>
        </div>

        <!-- Confirmar Senha -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
          <input
            v-model="form.password_confirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="********"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-gray-50 text-gray-900 placeholder-gray-400"
            :class="{ 'border-red-500': getError('password_confirmation') }"
          />
          <span v-if="getError('password_confirmation')" class="text-red-500 text-xs mt-1">{{ getError('password_confirmation') }}</span>
        </div>

        <!-- Botao Criar conta -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          <span v-if="loading">Criando conta...</span>
          <span v-else>Criar conta</span>
        </button>
      </form>

      <!-- Divisor -->
      <div class="flex items-center gap-4 my-6">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="text-sm text-gray-400">Ou cadastre-se com</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>

      <!-- Botoes Sociais -->
      <div class="flex gap-4">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="text-sm font-medium text-gray-700">Google</span>
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span class="text-sm font-medium text-gray-700">LinkedIn</span>
        </button>
      </div>
    </div>

    <!-- Link para login -->
    <p class="mt-6 text-center text-sm text-gray-600">
      Ja tem uma conta?
      <RouterLink to="/login" class="text-primary font-semibold hover:underline ml-1">
        Entre
      </RouterLink>
    </p>
  </AuthLayout>
</template>
