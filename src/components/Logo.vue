<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <img
        :src="logoImg"
        alt="WordTap Logo"
        class="w-10 h-10 rounded-xl logo-float"
        loading="lazy"
      />
    </div>
    <span class="text-2xl font-bold gradient-text">WordTap</span>
  </div>
</template>

<script setup>
import logoImg from '../imgs/logo.png'
// Logo 组件
</script>
