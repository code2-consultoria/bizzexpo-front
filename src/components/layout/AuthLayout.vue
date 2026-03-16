<script setup lang="ts">
// Layout para telas de autenticacao (login, cadastro, recuperar senha)
// Tema: duevento
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Logo duevento -->
    <div class="mb-8 flex flex-col items-center">
      <img src="/logo-icon.png" alt="" class="h-20 mb-3" />
      <span class="text-2xl font-bold text-primary">duevento</span>
    </div>

    <!-- Conteudo do formulario -->
    <slot />

    <!-- Footer -->
    <p class="mt-8 text-center text-xs text-gray-500">
      2024 duevento. Todos os direitos reservados.
    </p>
  </div>
</template>
