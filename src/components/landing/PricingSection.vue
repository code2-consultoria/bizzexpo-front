<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 299',
    period: '/evento',
    description: 'Para eventos de pequeno porte',
    features: [
      'Ate 500 participantes',
      'Check-in por QR Code',
      'Relatorios basicos',
      'Suporte por email',
    ],
    popular: false,
    buttonText: 'Contratar',
  },
  {
    name: 'Profissional',
    price: 'R$ 899',
    period: '/evento',
    description: 'Para feiras e conferencias',
    features: [
      'Ate 5.000 participantes',
      'Captura de leads ilimitada',
      'Integracao CRM',
      'Analytics avancado',
      'Suporte prioritario',
    ],
    popular: true,
    buttonText: 'Selecionar Profissional',
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes exposicoes',
    features: [
      'Participantes ilimitados',
      'White Label completo',
      'API dedicada',
      'Gerente de conta',
      'SLA garantido',
    ],
    popular: false,
    buttonText: 'Falar com Consultor',
  },
]
</script>

<template>
  <section id="precos" class="py-20 px-6 bg-primary/5">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h2 class="text-gray-900 text-3xl md:text-4xl font-bold mb-4">
          Escolha o plano para o seu tamanho
        </h2>
        <p class="text-gray-500 text-lg">
          Planos transparentes para que voce saiba exatamente o que esta recebendo.
        </p>
      </div>

      <!-- Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="bg-white p-8 rounded-2xl flex flex-col relative border-2 transition-all"
          :class="{
            'border-primary shadow-xl scale-105 z-10': plan.popular,
            'border-gray-100 hover:border-gray-200': !plan.popular,
          }"
        >
          <!-- Badge Popular -->
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Popular
          </div>

          <!-- Nome do plano -->
          <h3 class="text-lg font-semibold text-gray-600 mb-4">{{ plan.name }}</h3>

          <!-- Preco -->
          <div class="flex items-baseline gap-1 mb-2">
            <span class="text-4xl font-bold text-gray-900">{{ plan.price }}</span>
            <span v-if="plan.period" class="text-gray-400">{{ plan.period }}</span>
          </div>

          <!-- Descricao -->
          <p class="text-gray-500 text-sm mb-6">{{ plan.description }}</p>

          <!-- Features -->
          <ul class="space-y-3 mb-8 flex-grow">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex items-center gap-3 text-sm text-gray-600"
            >
              <svg class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>

          <!-- Botao -->
          <button
            @click="router.push('/register')"
            class="w-full py-3 font-semibold rounded-lg transition-colors"
            :class="{
              'bg-primary text-white hover:bg-primary-dark': plan.popular,
              'border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary': !plan.popular,
            }"
          >
            {{ plan.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
