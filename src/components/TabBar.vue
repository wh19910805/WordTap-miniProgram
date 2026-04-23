<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-white/30 safe-area-inset-bottom"
  >
    <div class="flex items-center justify-around h-16 px-2">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200"
        :class="isActive(tab.path) ? 'text-indigo-600' : 'text-gray-500'"
      >
        <div class="relative">
          <!-- 直接使用SVG图标而不是动态组件 -->
          <div
            v-if="tab.path === '/'"
            class="w-8 h-8 mb-1 transition-transform duration-200"
            :class="isActive(tab.path) ? 'scale-105' : ''"
          >
             <svg
               fill="currentColor"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
               stroke="currentColor"
               stroke-width="0"
               stroke-linecap="round"
               stroke-linejoin="round"
             >
               <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
             </svg>
          </div>
           <div
            v-if="tab.path === '/discovery'"
            class="w-7 h-7 mb-1 transition-transform duration-200"
            :class="isActive(tab.path) ? 'scale-105' : ''"
          >
             <svg
               fill="currentColor"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
               stroke="currentColor"
               stroke-width="0"
               stroke-linecap="round"
               stroke-linejoin="round"
             >
               <path
                 d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
               />
             </svg>
          </div>
          <div
            v-else-if="tab.path === '/profile'"
            class="w-8 h-8 mb-1 transition-transform duration-200"
            :class="isActive(tab.path) ? 'scale-105' : ''"
          >
             <svg
               fill="currentColor"
               viewBox="0 0 24 24"
               xmlns="http://www.w3.org/2000/svg"
               stroke="currentColor"
               stroke-width="0"
               stroke-linecap="round"
               stroke-linejoin="round"
             >
               <path
                 d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
               />
             </svg>
          </div>
        </div>
        <span
          class="text-xs font-semibold transition-all duration-200"
          :class="isActive(tab.path) ? 'scale-105' : ''"
          >{{ tab.label }}</span
        >
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const tabs = [
  {
    path: "/",
    label: "首页",
  },
  {
    path: "/discovery",
    label: "发现",
  },
  {
    path: "/profile",
    label: "我的",
  },
];

function isActive(path) {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
}
</script>
