<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  variant?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  variant: 'auto',
})

const sizeClasses = {
  sm: { bars: 'h-5 w-1', gap: 'gap-0.5', text: 'text-lg' },
  md: { bars: 'h-7 w-1.5', gap: 'gap-1', text: 'text-xl' },
  lg: { bars: 'h-9 w-2', gap: 'gap-1', text: 'text-2xl' },
  xl: { bars: 'h-12 w-2.5', gap: 'gap-1.5', text: 'text-3xl' },
}

const textColor = {
  light: 'text-white',
  dark: 'text-gray-900',
  auto: 'text-gray-900 dark:text-white',
}
</script>

<template>
  <div class="flex items-center" :class="sizeClasses[props.size].gap">
    <!-- Barras verticais do logo -->
    <div class="flex items-end" :class="sizeClasses[props.size].gap">
      <div
        class="rounded-sm bg-[#0047AB]"
        :class="sizeClasses[props.size].bars"
      />
      <div
        class="rounded-sm bg-[#FFD700]"
        :class="sizeClasses[props.size].bars"
      />
      <div
        class="rounded-sm bg-[#EE2737]"
        :class="sizeClasses[props.size].bars"
      />
    </div>

    <!-- Texto do logo -->
    <span
      v-if="props.showText"
      class="font-bold tracking-tight ml-1"
      :class="[sizeClasses[props.size].text, textColor[props.variant]]"
    >
      BizzExpo
    </span>
  </div>
</template>
