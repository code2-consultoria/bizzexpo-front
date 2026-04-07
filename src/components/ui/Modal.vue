<script setup lang="ts">
import { computed } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
  closeOnOverlay: true,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }
  return sizes[props.size]
})

function handleOpenChange(value: boolean) {
  emit('update:open', value)
  if (!value) {
    emit('close')
  }
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    handleOpenChange(false)
  }
}
</script>

<template>
  <DialogRoot :open="open" @update:open="handleOpenChange">
    <DialogPortal>
      <!-- Overlay/Backdrop -->
      <DialogOverlay
        class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        @click="handleOverlayClick"
      />

      <!-- Content -->
      <DialogContent
        class="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-0 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
        :class="sizeClasses"
      >
        <!-- Header -->
        <div v-if="title || $slots.header" class="flex items-start justify-between p-6 pb-0">
          <div class="flex-1 pr-4">
            <slot name="header">
              <DialogTitle class="text-xl font-bold text-gray-900 font-headline">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-if="description" class="text-sm text-gray-500 mt-1">
                {{ description }}
              </DialogDescription>
            </slot>
          </div>
          <DialogClose
            class="p-2 -m-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="sr-only">Fechar</span>
          </DialogClose>
        </div>

        <!-- Body -->
        <div class="p-6">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
/* Animacoes para o modal */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes zoomIn {
  from { transform: translate(-50%, -50%) scale(0.95); }
  to { transform: translate(-50%, -50%) scale(1); }
}

@keyframes zoomOut {
  from { transform: translate(-50%, -50%) scale(1); }
  to { transform: translate(-50%, -50%) scale(0.95); }
}

.animate-in {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.animate-out {
  animation-duration: 150ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.fade-in-0 {
  animation-name: fadeIn;
}

.fade-out-0 {
  animation-name: fadeOut;
}

.zoom-in-95 {
  animation-name: zoomIn;
}

.zoom-out-95 {
  animation-name: zoomOut;
}

/* Slide animations handled by transform in keyframes */
.slide-in-from-left-1\/2,
.slide-in-from-top-\[48\%\],
.slide-out-to-left-1\/2,
.slide-out-to-top-\[48\%\] {
  /* Handled by zoom animations */
}
</style>
