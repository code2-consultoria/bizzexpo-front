<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <!-- CTA Section -->
  <section id="contato" class="bg-primary py-16 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-white text-3xl md:text-4xl font-bold mb-4">
        Pronto para elevar o nivel do seu proximo evento?
      </h2>
      <p class="text-white/70 text-lg mb-8">
        Junte-se a centenas de organizadores que ja transformaram seus eventos em maquinas de networking.
      </p>
      <button
        @click="router.push('/register')"
        class="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Quero comecar gratuitamente
      </button>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-100 py-12 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <!-- Logo -->
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <img src="/logo-icon.png" alt="" class="h-10" />
            <span class="text-xl font-bold text-primary">duevento</span>
          </div>
        </div>

        <!-- Produto -->
        <div>
          <h4 class="text-gray-900 font-semibold mb-4">Produto</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><a class="hover:text-primary transition-colors" href="#">Funcionalidades</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Check-in</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Totens</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Leads</a></li>
          </ul>
        </div>

        <!-- Empresa -->
        <div>
          <h4 class="text-gray-900 font-semibold mb-4">Empresa</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><a class="hover:text-primary transition-colors" href="#">Sobre</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Blog</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Carreiras</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Contato</a></li>
          </ul>
        </div>

        <!-- Suporte -->
        <div>
          <h4 class="text-gray-900 font-semibold mb-4">Suporte</h4>
          <ul class="space-y-3 text-sm text-gray-500">
            <li><a class="hover:text-primary transition-colors" href="#">Central de Ajuda</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">API</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Status</a></li>
            <li><a class="hover:text-primary transition-colors" href="#">Privacidade</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
        <p>2024 duevento. Todos os direitos reservados.</p>
        <div class="flex gap-6">
          <a class="hover:text-primary transition-colors" href="#">Termos</a>
          <a class="hover:text-primary transition-colors" href="#">Privacidade</a>
        </div>
      </div>
    </div>
  </footer>
</template>
