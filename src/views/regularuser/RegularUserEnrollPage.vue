<!--普通用户注册页-->
<template>
  <div class="register-container">
    <div class="register-content">
      <h1 class="app-title">中英文语料库</h1>
      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          class="register-form"
          @keyup.enter="submitForm"
      >
      <!-- 账户 -->
      <el-form-item prop="userName">
        <el-input v-model="registerForm.userName" placeholder="请输入账户" />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item prop="passWord">
        <el-input
            v-model="registerForm.passWord"
            type="password"
            placeholder="请输入密码"
        />
      </el-form-item>

      <!-- 确认密码 -->
      <el-form-item prop="confirmPassWord">
        <el-input
            v-model="registerForm.confirmPassWord"
            type="password"
            placeholder="请再次输入密码"
        />
      </el-form-item>

      <!-- 注册按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            class="register-button"
            :loading="isRegistering"
            @click="submitForm"
            block
        >
          {{ isRegistering ? "注册中..." : "注册" }}
        </el-button>
      </el-form-item>

      <!-- 返回登录 -->
      <p class="login-link">
        已有账户？
        <el-link @click="goToLogin">立即登录</el-link>
      </p>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import axios from "axios";
import apiEndpoints from "@/apiConfig";

const router = useRouter();

// 表单引用
const registerFormRef = ref(null);

// 表单数据
const registerForm = ref({
  userName: "",
  passWord: "",
  confirmPassWord: "",
});

// 表单验证规则
const registerRules = ref({
  userName: [
    { required: true, message: "账户不能为空", trigger: "blur" },
  ],
  passWord: [
    { required: true, message: "密码不能为空", trigger: "blur" },
    {
      pattern: /^.{6,16}$/,
      message: "密码长度应为6-16位",
      trigger: "blur",
    },
  ],
  confirmPassWord: [
    { required: true, message: "确认密码不能为空", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.passWord) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

// 是否正在注册
const isRegistering = ref(false);

// 提交表单
const submitForm = () => {
  registerFormRef.value.validate((valid) => {
    if (valid) {
      isRegistering.value = true;
      axios
          .post(apiEndpoints.regularenroll, {
            userName: registerForm.value.userName,
            passWord: registerForm.value.passWord,
          })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success("注册成功！");
              router.push("/"); // 跳转到登录页面
            } else {
              ElMessage.error("注册失败：" + response.data.msg);
            }
          })
          .catch((error) => {
            ElMessage.error("网络错误：" + error.message);
          })
          .finally(() => {
            isRegistering.value = false;
          });
    } else {
      ElMessage.warning("请填写完整信息");
    }
  });
};

// 返回登录
const goToLogin = () => {
  router.push("/");
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f0f0; /* 浅灰色背景 */
}

.register-content {
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
  margin-bottom: 20px; /* 调整标题下间距 */
  color: #000;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.el-input {
  height: 50px;
  font-size: 16px;
}

.el-input__inner {
  padding: 10px 12px;
  font-size: 16px;
}

.register-button {
  width: 100%;
  height: 45px;
  background-color: #000;
  color: #fff;
  font-size: 16px;
}

.login-link {
  margin-top: 20px;
  font-size: 0.875rem;
  color: #666;
}
</style>
