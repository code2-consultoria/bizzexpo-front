<script setup lang="ts">
import type { RankingExpositor } from '@/types'
import Spinner from '@/components/ui/Spinner.vue'

interface Props {
  ranking: RankingExpositor[]
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Ranking de expositores</h3>

    <div v-if="loading" class="flex items-center justify-center h-32">
      <Spinner />
    </div>

    <div v-else-if="ranking.length === 0" class="text-center py-8 text-gray-500">
      Nenhum expositor com leads ainda.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in ranking"
        :key="item.expositor.id"
        class="flex items-center gap-3"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          :class="{
            'bg-yellow-100 text-yellow-700': index === 0,
            'bg-gray-100 text-gray-700': index === 1,
            'bg-orange-100 text-orange-700': index === 2,
            'bg-gray-50 text-gray-500': index > 2,
          }"
        >
          {{ index + 1 }}
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900">{{ item.expositor.nome_empresa }}</p>
        </div>
        <div class="text-right">
          <span class="text-lg font-bold text-blue-600">{{ item.total_leads }}</span>
          <span class="text-sm text-gray-500 ml-1">leads</span>
        </div>
      </div>
    </div>
  </div>
</template>
