<script setup lang="ts">
import { computed } from 'vue'
import type { HorarioPico } from '@/types'
import Spinner from '@/components/ui/Spinner.vue'

interface Props {
  horarios: HorarioPico[]
  loading?: boolean
}

const props = defineProps<Props>()

const maxCheckins = computed(() => {
  if (props.horarios.length === 0) return 1
  return Math.max(...props.horarios.map(h => h.total_checkins))
})

function getBarHeight(total: number): string {
  const percentage = (total / maxCheckins.value) * 100
  return `${Math.max(percentage, 5)}%`
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Horários de pico</h3>

    <div v-if="loading" class="flex items-center justify-center h-32">
      <Spinner />
    </div>

    <div v-else-if="horarios.length === 0" class="text-center py-8 text-gray-500">
      Nenhum check-in registrado ainda.
    </div>

    <div v-else class="flex items-end gap-2 h-40">
      <div
        v-for="item in horarios"
        :key="item.hora"
        class="flex-1 flex flex-col items-center"
      >
        <div
          class="w-full bg-blue-500 rounded-t transition-all duration-300"
          :style="{ height: getBarHeight(item.total_checkins) }"
        />
        <div class="mt-2 text-center">
          <p class="text-xs font-medium text-gray-900">{{ item.hora }}</p>
          <p class="text-xs text-gray-500">{{ item.total_checkins }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
