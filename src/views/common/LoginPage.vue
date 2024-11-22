<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="loginForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="passWord">
          <el-input
              v-model="loginForm.passWord"
              placeholder="请输入密码"
              type="password"
          ></el-input>
        </el-form-item>
        <el-button type="primary" @click="submitForm">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import apiEndpoints from "@/apiConfig"; // 引入axios
import { useRouter } from 'vue-router'; // 引入useRouter函数

export default {
  setup() {
    const router = useRouter(); // 获取路由对象

    const loginFormRef = ref(null);
    const loginForm = ref({
      userName: '',
      passWord: '',
    });
    const loginRules = ref({
      userName: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
      ],
      passWord: [
        { required: true, message: '请输入密码', trigger: 'blur' },
      ],
    });

    const submitForm = () => {
      loginFormRef.value.validate((valid) => {
        if (valid) {
          // 发送axios请求到后端登录接口，按照新的参数形式构造请求数据
          axios.post(apiEndpoints.login, {
            userName: loginForm.value.userName,
            passWord: loginForm.value.passWord
          })
              .then((response) => {
                if (response.data.code === 200 && response.data.data) {
                  ElMessage.success('登录成功');
                  const role = response.data.data.role;
                  if (role === 'admin') {
                    router.push('/admin-home'); // 使用获取到的路由对象进行跳转
                    // 注意这里不能再用this.$router.push，而是直接用router.push
                    // 因为this在setup函数里不是指向组件实例的
                    // 而通过useRouter获取的router对象可以直接用于跳转操作
                  } else if (role === 'regular_user') {
                    router.push('/user-home');
                  }
                } else {
                  ElMessage.error('登录失败：' + response.data.msg);
                }
              })
              .catch((error) => {
                ElMessage.error('网络错误：' + error.message);
              });
        } else {
          ElMessage.error('请填写正确的用户名和密码');
        }
      });
    };

    return {
      loginFormRef,
      loginForm,
      loginRules,
      submitForm,
      router, // 将路由对象也返回，以便在模板中可能的使用（如果有需要）
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
}

.login-card {
  width: 300px;
}

.login-title {
  text-align: center;
}
</style>