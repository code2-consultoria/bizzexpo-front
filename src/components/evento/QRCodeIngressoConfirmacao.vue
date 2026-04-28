<script setup lang="ts">
import { computed } from 'vue'
import QRCodeVue from 'qrcode.vue'
import type { IngressoCompra } from '@/types'

interface Props {
  ingresso: IngressoCompra
}

const props = defineProps<Props>()

const dataCompra = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(props.ingresso.created_at))
})

const precoFormatado = computed(() => {
  if (!props.ingresso.tipo_ingresso?.preco) return 'Gratuito'
  if (props.ingresso.tipo_ingresso.preco === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(props.ingresso.tipo_ingresso.preco)
})

const isConfirmado = computed(() => props.ingresso.status === 'confirmado')
const isAguardandoPagamento = computed(() => props.ingresso.status === 'aguardando_pagamento')

const headerClass = computed(() => {
  if (isConfirmado.value) {
    return 'bg-gradient-to-r from-green-500 to-green-600'
  }
  if (isAguardandoPagamento.value) {
    return 'bg-gradient-to-r from-amber-500 to-amber-600'
  }
  return 'bg-gradient-to-r from-primary to-primary/80'
})

const statusLabel = computed(() => {
  switch (props.ingresso.status) {
    case 'confirmado':
      return 'Confirmado'
    case 'aguardando_pagamento':
      return 'Aguardando pagamento'
    case 'cancelado':
      return 'Cancelado'
    case 'expirado':
      return 'Expirado'
    default:
      return props.ingresso.status
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
    <!-- Cabecalho de status -->
    <div :class="headerClass" class="text-white p-6 text-center">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
        <svg v-if="isConfirmado" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="isAguardandoPagamento" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold mb-1">
        <span v-if="isConfirmado">Ingresso confirmado!</span>
        <span v-else-if="isAguardandoPagamento">Aguardando pagamento</span>
        <span v-else>Ingresso</span>
      </h2>
      <p class="text-white/80">
        <span v-if="isConfirmado">Seu ingresso foi confirmado com sucesso</span>
        <span v-else-if="isAguardandoPagamento">Complete o pagamento para confirmar</span>
        <span v-else>{{ statusLabel }}</span>
      </p>
    </div>

    <!-- Conteudo -->
    <div class="p-6 space-y-6">
      <!-- QR Code -->
      <div class="flex justify-center">
        <div class="p-4 bg-white rounded-xl border-2 border-slate-200">
          <QRCodeVue
            :value="ingresso.qrcode"
            :size="200"
            level="H"
          />
        </div>
      </div>

      <p class="text-center text-slate-600 text-sm">
        Apresente este QR Code no credenciamento do evento
      </p>

      <!-- Dados do ingresso -->
      <div class="bg-slate-50 rounded-xl p-4 space-y-3">
        <div v-if="ingresso.participante" class="flex justify-between">
          <span class="text-slate-500 text-sm">Participante</span>
          <span class="text-slate-900 font-medium text-sm">{{ ingresso.participante.nome }}</span>
        </div>
        <div v-if="ingresso.participante" class="flex justify-between">
          <span class="text-slate-500 text-sm">E-mail</span>
          <span class="text-slate-900 font-medium text-sm">{{ ingresso.participante.email }}</span>
        </div>
        <div v-if="ingresso.tipo_ingresso" class="flex justify-between">
          <span class="text-slate-500 text-sm">Tipo de Ingresso</span>
          <span class="text-slate-900 font-medium text-sm">{{ ingresso.tipo_ingresso.nome }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500 text-sm">Valor</span>
          <span
            class="font-medium text-sm"
            :class="precoFormatado === 'Gratuito' ? 'text-green-600' : 'text-slate-900'"
          >
            {{ precoFormatado }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500 text-sm">Status</span>
          <span
            class="font-medium text-sm"
            :class="{
              'text-green-600': isConfirmado,
              'text-amber-600': isAguardandoPagamento,
              'text-red-600': ingresso.status === 'cancelado' || ingresso.status === 'expirado',
            }"
          >
            {{ statusLabel }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500 text-sm">Data da compra</span>
          <span class="text-slate-900 font-medium text-sm">{{ dataCompra }}</span>
        </div>
      </div>

      <!-- Aviso para confirmado -->
      <div
        v-if="isConfirmado && ingresso.participante"
        class="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
      >
        <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-green-800">
          Um e-mail de confirmacao foi enviado para <strong>{{ ingresso.participante.email }}</strong>.
          Salve ou imprima o QR Code para o dia do evento.
        </p>
      </div>

      <!-- Aviso para aguardando pagamento -->
      <div
        v-if="isAguardandoPagamento"
        class="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
      >
        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-amber-800">
          Seu ingresso sera confirmado apos a confirmacao do pagamento.
          <span v-if="ingresso.reserva">
            Voce tem ate {{ new Date(ingresso.reserva.expira_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }} para finalizar.
          </span>
        </p>
      </div>
    </div>
  </div>
</template>
