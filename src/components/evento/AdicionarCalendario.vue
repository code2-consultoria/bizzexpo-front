<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EventoPublico } from '@/types'

interface Props {
  evento: EventoPublico
}

const props = defineProps<Props>()
const menuAberto = ref(false)

// Extrai texto plano do conteudo (Editor.js JSON ou texto simples)
function extrairTextoPlano(content: string): string {
  if (!content) return ''

  try {
    const data = JSON.parse(content)
    if (data.blocks && Array.isArray(data.blocks)) {
      return data.blocks
        .map((block: { type: string; data: { text?: string; items?: string[] } }) => {
          if (block.type === 'list' && block.data.items) {
            return block.data.items.join(', ')
          }
          return block.data.text || ''
        })
        .filter(Boolean)
        .join(' ')
        .replace(/<[^>]*>/g, '') // Remove HTML tags
    }
  } catch {
    // Nao e JSON, retorna como texto removendo HTML
  }

  return content.replace(/<[^>]*>/g, '')
}

const formatarDataParaCalendario = (data: string) => {
  return data.replace(/[-:]/g, '').replace('.000Z', 'Z')
}

const descricaoTexto = computed(() => extrairTextoPlano(props.evento.descricao))

const googleCalendarUrl = computed(() => {
  const inicio = formatarDataParaCalendario(new Date(props.evento.data_inicio).toISOString())
  const fim = formatarDataParaCalendario(new Date(props.evento.data_fim).toISOString())

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: props.evento.nome,
    dates: `${inicio}/${fim}`,
    details: descricaoTexto.value,
    location: props.evento.local,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
})

const gerarICS = () => {
  const inicio = formatarDataParaCalendario(new Date(props.evento.data_inicio).toISOString())
  const fim = formatarDataParaCalendario(new Date(props.evento.data_fim).toISOString())

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BizzExpo//Event//PT',
    'BEGIN:VEVENT',
    `DTSTART:${inicio}`,
    `DTEND:${fim}`,
    `SUMMARY:${props.evento.nome}`,
    `DESCRIPTION:${descricaoTexto.value.substring(0, 200)}`,
    `LOCATION:${props.evento.local}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${props.evento.slug}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  menuAberto.value = false
}
</script>

<template>
  <div class="relative inline-block">
    <button
      @click="menuAberto = !menuAberto"
      class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      Adicionar ao calendario
      <svg class="w-4 h-4" :class="{ 'rotate-180': menuAberto }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Menu dropdown -->
    <div
      v-if="menuAberto"
      class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10"
    >
      <a
        :href="googleCalendarUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
        @click="menuAberto = false"
      >
        <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24">
          <path fill="currentColor" d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM12 17.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z"/>
        </svg>
        <span class="text-slate-700 text-sm">Google Calendar</span>
      </a>

      <button
        @click="gerarICS"
        class="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors"
      >
        <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        <span class="text-slate-700 text-sm">Baixar arquivo .ics</span>
      </button>
    </div>

    <!-- Overlay para fechar o menu -->
    <div
      v-if="menuAberto"
      class="fixed inset-0 z-0"
      @click="menuAberto = false"
    ></div>
  </div>
</template>
