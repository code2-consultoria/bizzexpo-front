<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue?: string | null
  label?: string
  presets?: string[]
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  presets: () => [],
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const localValue = ref(props.modelValue || '#000000')

// Cores preset padrao
const defaultPresets = [
  '#006b44', // Primary BizzExpo
  '#1EC6B6', // Secondary BizzExpo
  '#1e40af', // Azul
  '#dc2626', // Vermelho
  '#059669', // Verde
  '#7c3aed', // Roxo
  '#ea580c', // Laranja
  '#0891b2', // Ciano
]

const activePresets = computed(() =>
  props.presets.length > 0 ? props.presets : defaultPresets
)

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    localValue.value = newVal
  }
})

function handleColorInput(event: Event) {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  emit('update:modelValue', target.value)
}

function handleTextInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.trim()

  // Adiciona # se nao tiver
  if (value && !value.startsWith('#')) {
    value = '#' + value
  }

  // Valida formato hex
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    localValue.value = value
    emit('update:modelValue', value)
  }
}

function selectPreset(color: string) {
  localValue.value = color
  emit('update:modelValue', color)
}

function clearColor() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <div class="flex items-center gap-3">
      <!-- Input de cor nativo -->
      <div class="relative">
        <input
          type="color"
          :value="localValue"
          :disabled="disabled"
          class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          :class="{ 'border-red-500': error }"
          @input="handleColorInput"
        />
      </div>

      <!-- Input de texto hex -->
      <input
        type="text"
        :value="modelValue || ''"
        :disabled="disabled"
        placeholder="#000000"
        maxlength="7"
        class="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-mono"
        :class="{
          'border-gray-300': !error,
          'border-red-500 focus:ring-red-500': error,
        }"
        @input="handleTextInput"
      />

      <!-- Botao limpar -->
      <button
        v-if="modelValue"
        type="button"
        :disabled="disabled"
        class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        title="Limpar cor"
        @click="clearColor"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Cores preset -->
    <div v-if="activePresets.length > 0" class="flex flex-wrap gap-2">
      <button
        v-for="color in activePresets"
        :key="color"
        type="button"
        :disabled="disabled"
        class="w-6 h-6 rounded-md border-2 transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
        :class="modelValue === color ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' : 'border-gray-300'"
        :style="{ backgroundColor: color }"
        :title="color"
        @click="selectPreset(color)"
      />
    </div>

    <!-- Erro -->
    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>
