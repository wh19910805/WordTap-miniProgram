<template>
  <view class="login-page">
    <view class="login-box">
      <view class="logo-area">
        <view class="logo">
          <text style="color: #fff; font-size: 32px; font-weight: 700;">W</text>
        </view>
      </view>
      <text class="title">WordTap</text>
      
      <view class="input-group">
        <view class="input-wrapper">
          <Icon name="user" size="medium" color="var(--text-tertiary)" />
          <input 
            type="text" 
            placeholder="用户名/邮箱" 
            class="input" 
            v-model="username"
          />
        </view>
      </view>
      <view class="input-group">
        <view class="input-wrapper">
          <Icon name="lock" size="medium" color="var(--text-tertiary)" />
          <input 
            type="password" 
            placeholder="密码" 
            class="input" 
            v-model="password"
          />
        </view>
      </view>
      
      <button class="btn-primary" @click="handleLogin" :loading="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      
      <text class="link" @click="goToRegister">还没有账号？立即注册</text>
      
      <view class="backend-info">
        <text class="info-text">后端地址: {{ backendUrl }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/icon.vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const backendUrl = ref('http://localhost:8000')

async function handleLogin() {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' })
    return
  }
  
  loading.value = true
  try {
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.switchTab({ url: '/pages/dashboard/index' })
      }, 1000)
    } else {
      uni.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  uni.showToast({ title: '注册功能开发中', icon: 'none' })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, var(--primary-color) 0%, var(--background-color) 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  box-sizing: border-box;
}

.login-box {
  width: 100%;
  max-width: 360px;
  background: var(--surface-color);
  padding: var(--space-8) var(--space-6);
  border-radius: var(--radius-2xl);
}

.logo-area {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-3);
}

.logo {
  width: 80px;
  height: 80px;
  background: #6366f1;  /* 与 Web 端一致 - indigo-600 */
  border-radius: 24px;  /* 与 Web 端一致 - rounded-3xl */
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 36px;
  font-weight: 700;
  color: #6366f1;  /* 与 Web 端一致 - indigo-600 */
  display: block;
  text-align: center;
  margin-bottom: var(--space-8);
}

.input-group {
  margin-bottom: var(--space-5);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0 var(--space-4);
  height: 52px;
}

.input-wrapper:focus-within {
  border-color: var(--primary-color);
}

.input {
  flex: 1;
  height: 100%;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  border: none;
}

.input:focus {
  outline: none;
}

.btn-primary {
  width: 100%;
  height: 52px;
  background: #6366f1;
  color: #fff;
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  border: none;
  margin-top: var(--space-2);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:active {
  transform: scale(0.97);
  box-shadow: none;
}

.link {
  display: block;
  text-align: center;
  margin-top: var(--space-5);
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
}

.backend-info {
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--background-color);
}

.info-text {
  display: block;
  text-align: center;
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>