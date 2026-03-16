<script setup lang="ts">
import NavBar from '@/components/landing/NavBar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import ProblemsSection from '@/components/landing/ProblemsSection.vue'
import SolutionSection from '@/components/landing/SolutionSection.vue'
import PricingSection from '@/components/landing/PricingSection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'
</script>

<template>
  <div class="bg-white min-h-screen">
    <NavBar />
    <HeroSection />
    <ProblemsSection />
    <SolutionSection />
    <PricingSection />
    <FooterSection />
  </div>
</template>
