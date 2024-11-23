<template>
  <div class="login-container">
    <div class="login-content">
      <h1 class="app-title">中英文语料库</h1>
      <p class="app-subtitle">登录 - 前往至用户面板</p>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
        <el-form-item prop="userName">
          <el-input v-model="loginForm.userName" placeholder="账户"></el-input>
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input
              v-model="loginForm.passWord"
              placeholder="密码"
              type="password"
          ></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-button
            type="primary"
            class="login-button"
            :loading="isLoggingIn"
            :disabled="isLoggingIn"
            @click="submitForm"
        >
          {{ isLoggingIn ? '登录中...' : '登录' }}
        </el-button>
        <p class="register-link">
          还不是我们的用户？<el-link href="#" @click="goToRegister">立即注册</el-link>
        </p>
      </el-form>
    </div>
  </div>
</template>



<script>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import apiEndpoints from "@/apiConfig";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const loginFormRef = ref(null);
    const loginForm = ref({
      userName: '',
      passWord: '',
    });
    const loginRules = ref({
      userName: [{ required: true, message: '请输入账户', trigger: 'blur' }],
      passWord: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    });

    const isLoggingIn = ref(false); // 定义一个状态变量，表示是否正在登录

    const submitForm = () => {
      loginFormRef.value.validate((valid) => {
        if (valid) {
          isLoggingIn.value = true; // 设置登录中状态
          axios.post(apiEndpoints.login, loginForm.value)
              .then((response) => {
                if (response.data.code === 200) {
                  ElMessage.success('登录成功');
                  router.push('/regularenroll');
                } else {
                  ElMessage.error('登录失败：' + response.data.msg);
                }
              })
              .catch((error) => {
                ElMessage.error('网络错误：' + error.message);
              })
              .finally(() => {
                isLoggingIn.value = false; // 无论成功或失败，都重置状态
              });
        } else {
          ElMessage.warning('请填写完整信息');
        }
      });
    };

    const goToRegister = () => {
      router.push('/regularenroll');
    };

    return {
      loginFormRef,
      loginForm,
      loginRules,
      submitForm,
      goToRegister,
      isLoggingIn, // 返回登录中状态
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 255, 1) 50%, rgba(220, 220, 255, 1) 100%);
  background-repeat: no-repeat;
  background-size: cover;
}

.login-content {
  max-width: 400px;
  width: 100%;
  padding: 30px;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.app-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #000;
}

.app-subtitle {
  font-size: 1rem;
  color: #888;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.el-input {
  height: 50px; /* 增大输入框高度 */
  font-size: 16px; /* 增大字体大小 */
}

.el-input__inner {
  padding: 10px 12px; /* 增大内边距 */
  font-size: 16px; /* 字体大小与外层保持一致 */
}

.login-button {
  width: 100%;
  height: 45px; /* 略微增大按钮高度 */
  background-color: #000;
  color: #fff;
  font-size: 16px;
}

.register-link {
  margin-top: 20px;
  font-size: 0.875rem;
  color: #666;
}
</style>

