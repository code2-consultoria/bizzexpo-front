<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '@/components/ui/Input.vue'

export interface DadosCartao {
  numero: string
  nome: string
  validade: string
  cvv: string
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: DadosCartao): void
  (e: 'valid', value: boolean): void
}>()

const props = defineProps<{
  modelValue: DadosCartao
  disabled?: boolean
}>()

const numero = ref(props.modelValue.numero)
const nome = ref(props.modelValue.nome)
const validade = ref(props.modelValue.validade)
const cvv = ref(props.modelValue.cvv)

const bandeira = computed(() => {
  const num = numero.value.replace(/\s/g, '')
  if (num.startsWith('4')) return 'visa'
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mastercard'
  if (/^3[47]/.test(num)) return 'amex'
  if (/^6(?:011|5)/.test(num)) return 'discover'
  if (/^(?:2131|1800|35)/.test(num)) return 'jcb'
  return null
})

const isValid = computed(() => {
  const numLimpo = numero.value.replace(/\s/g, '')
  return (
    numLimpo.length >= 13 &&
    numLimpo.length <= 19 &&
    nome.value.length >= 3 &&
    /^\d{2}\/\d{2}$/.test(validade.value) &&
    cvv.value.length >= 3
  )
})

function formatarNumero(value: string) {
  const limpo = value.replace(/\D/g, '').slice(0, 16)
  const grupos = limpo.match(/.{1,4}/g)
  numero.value = grupos ? grupos.join(' ') : ''
  emitir()
}

function formatarValidade(value: string) {
  const limpo = value.replace(/\D/g, '').slice(0, 4)
  if (limpo.length >= 2) {
    validade.value = `${limpo.slice(0, 2)}/${limpo.slice(2)}`
  } else {
    validade.value = limpo
  }
  emitir()
}

function formatarCvv(value: string) {
  cvv.value = value.replace(/\D/g, '').slice(0, 4)
  emitir()
}

function emitir() {
  const dados: DadosCartao = {
    numero: numero.value,
    nome: nome.value,
    validade: validade.value,
    cvv: cvv.value,
  }
  emit('update:modelValue', dados)
  emit('valid', isValid.value)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Numero do cartao -->
    <div>
      <label class="block text-sm font-medium text-on-surface-variant mb-2">
        Numero do cartao
      </label>
      <div class="relative">
        <Input
          :model-value="numero"
          @update:model-value="formatarNumero"
          placeholder="0000 0000 0000 0000"
          :disabled="disabled"
          class="pr-12"
        />
        <div v-if="bandeira" class="absolute right-3 top-1/2 -translate-y-1/2">
          <span class="text-xs font-bold uppercase text-primary">{{ bandeira }}</span>
        </div>
      </div>
    </div>

    <!-- Nome no cartao -->
    <div>
      <label class="block text-sm font-medium text-on-surface-variant mb-2">
        Nome no cartao
      </label>
      <Input
        v-model="nome"
        @update:model-value="emitir"
        placeholder="Como esta no cartao"
        :disabled="disabled"
        class="uppercase"
      />
    </div>

    <!-- Validade e CVV -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-on-surface-variant mb-2">
          Validade
        </label>
        <Input
          :model-value="validade"
          @update:model-value="formatarValidade"
          placeholder="MM/AA"
          :disabled="disabled"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-on-surface-variant mb-2">
          CVV
        </label>
        <Input
          :model-value="cvv"
          @update:model-value="formatarCvv"
          placeholder="000"
          type="password"
          :disabled="disabled"
        />
      </div>
    </div>

    <!-- Indicador de seguranca -->
    <div class="flex items-center gap-2 text-sm text-on-surface-variant">
      <span class="material-symbols-outlined text-lg text-primary">lock</span>
      <span>Seus dados estao protegidos com criptografia</span>
    </div>
  </div>
</template>
