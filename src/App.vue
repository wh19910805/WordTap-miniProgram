<template>
  <router-view />
  <!-- 全局弹窗组件 -->
  <Modal
    v-model:visible="modals.confirm.visible"
    :title="modals.confirm.title"
    :confirm-text="modals.confirm.confirmText"
    :cancel-text="modals.confirm.cancelText"
    :show-cancel="modals.confirm.showCancel"
    @confirm="confirmModal"
    @cancel="cancelModal"
    @close="cancelModal"
  >
    <div class="modal-message">{{ modals.confirm.message }}</div>
  </Modal>
  <Modal
    v-model:visible="modals.alert.visible"
    :title="modals.alert.title"
    :confirm-text="modals.alert.confirmText"
    :show-cancel="modals.alert.showCancel"
    @confirm="okModal"
    @close="okModal"
  >
    <div class="modal-message">{{ modals.alert.message }}</div>
  </Modal>
</template>

<script setup>
import { onMounted, onBeforeMount } from "vue";
import Modal from "@/components/Modal.vue";
import {
  modals,
  confirmModal,
  cancelModal,
  okModal,
  replaceBrowserModals,
} from "@/composables/useModal";

onBeforeMount(() => {
});

onMounted(() => {
  // 替换浏览器默认弹窗
  replaceBrowserModals();
});
</script>

<style scoped>
.modal-message {
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.5;
}
</style>
