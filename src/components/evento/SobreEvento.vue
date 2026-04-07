<script setup lang="ts">
import type { EventoPublico } from '@/types'
import RichTextRenderer from '@/components/ui/RichTextRenderer.vue'

interface Props {
  evento: EventoPublico
}

defineProps<Props>()
</script>

<template>
  <section class="py-16 px-4 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
        Sobre o Evento
      </h2>

      <RichTextRenderer
        :content="evento.descricao"
        class="prose prose-slate max-w-none text-slate-600 leading-relaxed"
      />

      <!-- Categorias disponiveis -->
      <div v-if="evento.categorias.length > 0" class="mt-10">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">
          Categorias de Participacao
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="categoria in evento.categorias"
            :key="categoria.id"
            class="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
          >
            {{ categoria.nome }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
