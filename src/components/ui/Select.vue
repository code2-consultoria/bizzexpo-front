<script setup lang="ts">
interface Option {
  value: string
  label: string
  description?: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Selecione uma opção',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <select
    :id="props.id"
    :value="props.modelValue"
    :disabled="props.disabled"
    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none bg-white"
    :class="{
      'border-gray-300': !props.error,
      'border-red-500 focus:ring-red-500': props.error,
    }"
    @change="handleChange"
  >
    <option value="" disabled>{{ props.placeholder }}</option>
    <option v-for="option in props.options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
