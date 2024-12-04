<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
      <div class="logo-container">
        <span class="logo-text">中英文语料库</span>
      </div>
      <el-menu class="menu-list" router :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item index="RegularUserHome">
          <i class="el-icon-document"></i>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="RegularUserSelectByCorpus">
          <i class="el-icon-dollar"></i>
          <span>语料搜索</span>
        </el-menu-item>
        <el-menu-item index="RegularUserSelectByType">
          <i class="el-icon-shopping-cart"></i>
          <span>分类查找</span>
        </el-menu-item>
        <el-menu-item index="RegularUserPersonalCenter">
          <i class="el-icon-tickets"></i>
          <span>个人中心</span>
        </el-menu-item>
      </el-menu>
    </aside>
    <!-- 内容区域 -->
    <main class="content-area">
      <div class="toolbar">
        <div class="user-info">
          <span>欢迎您，{{userName}}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout"> 点击退出 </el-button>
        </div>
      </div>
      <div class="page-content">
        <div class="greeting-container">
          <p style="font-size: 1.5rem; font-weight: bold;">{{greeting}} ,  {{userName}} ! 欢迎来到用户中心 ！</p>
        </div>
        <div class="forms-container">
          <!-- 修改账户名表单 -->
          <el-card class="form-left" shadow="always">
            <h3>修改账户名</h3>
            <el-form label-width="100px" @submit.prevent="handleChangeUsername">
              <el-form-item label="新账户名">
                <el-input v-model="userNewName" placeholder="请输入新账户名"></el-input>
              </el-form-item>
              <div class="form-buttons">
                <el-button type="primary" class="custom-button" @click="handleChangeUsername">确认</el-button>
                <el-button type="warning" class="custom-button" @click="resetChangeUsernameForm">重置</el-button>
              </div>
            </el-form>
          </el-card>

          <!-- 修改密码表单 -->
          <el-card class="form-right" shadow="always">
            <h3>修改密码</h3>
            <el-form label-width="100px" @submit.prevent="handleChangePassword">
              <el-form-item label="旧密码">
                <el-input type="password" v-model="oldPassword" placeholder="请输入旧密码"></el-input>
              </el-form-item>
              <el-form-item label="新密码">
                <el-input type="password" v-model="newPassword" placeholder="请输入新密码"></el-input>
              </el-form-item>
              <el-form-item label="确认新密码">
                <el-input type="password" v-model="confirmNewPassword" placeholder="请确认新密码"></el-input>
              </el-form-item>
              <div class="form-buttons">
                <el-button type="primary" class="custom-button" @click="handleChangePassword">确认</el-button>
                <el-button type="warning" class="custom-button" @click="resetChangePasswordForm">重置</el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import {defineComponent, ref} from "vue";
import {useRouter} from "vue-router";
import axios from "axios";
import {ElMessage} from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");
    const activeMenu = ref("RegularUserPersonalCenter");

    const getGreeting = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 0 && currentHour < 12) {
        return "早上好";
      } else if (currentHour >= 12 && currentHour < 18) {
        return "中午好";
      } else {
        return "晚上好";
      }
    };

    const greeting = ref(getGreeting());
    const userNewName = ref("");
    const oldPassword = ref("");
    const newPassword = ref("");
    const confirmNewPassword = ref("");

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index
      });
    };

    const logout = () => {
      axios.post(apiEndpoints.logout).then((response) => {
        if (response.data.code === 200) {
          ElMessage.success("退出成功");
          router.push("/");
        } else {
          ElMessage.error("登录状态异常，请重新登录");
          router.push("/");
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          ElMessage.error("身份验证失败，请重新登录");
        } else {
          ElMessage.error("请求失败，请稍后重试");
        }
        router.push("/");
      });
    };
    const handleChangeUsername = () => {
      if (!userNewName.value) {
        ElMessage.warning("请输入新账户名！");
        return;
      }
      axios.post(apiEndpoints.updateusername, {
        userName: userName,
        userNewName: userNewName.value
      }).then((response) => {
        if (response.data.code === 200) {
          sessionStorage.setItem("userName", userNewName.value);
          ElMessage.success("账户修改成功");
          router.go(0);
          userNewName.value = "";
        } else {
          userNewName.value = "";
          ElMessage.error("修改失败，账户已被使用,请更改输入的账户名并重新提交");
        }
      }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
      });
    };


    const resetChangeUsernameForm = () => {
      userNewName.value = "";
    };

    const handleChangePassword = () => {
      if (!oldPassword.value || !newPassword.value || !confirmNewPassword.value) {
        ElMessage.warning("请完整填写密码信息！");
        return;
      }
      if (newPassword.value !== confirmNewPassword.value) {
        ElMessage.error("两次输入的新密码不一致！");
        return;
      }
      axios.post(apiEndpoints.updatepassword, {
        userName: userName.value,
        userNewPassword: newPassword.value
      }).then((response) => {
        if (response.data.code === 200) {
          ElMessage.success("密码修改成功，请重新登录");
          oldPassword.value = "";
          newPassword.value = "";
          confirmNewPassword.value = "";
          router.push("/");
        } else {
          oldPassword.value = "";
          newPassword.value = "";
          confirmNewPassword.value = "";
          ElMessage.error("修改失败，新密码和旧密码相同");
        }
      }).catch(() => {
        ElMessage.error("请求失败，请稍后重试");
      });
    };

    const resetChangePasswordForm = () => {
      oldPassword.value = "";
      newPassword.value = "";
      confirmNewPassword.value = "";
    };

    return {
      userName,
      userNewName,
      oldPassword,
      newPassword,
      confirmNewPassword,
      logout,
      handleMenuSelect,
      handleChangeUsername,
      handleChangePassword,
      activeMenu,
      greeting,
      resetChangeUsernameForm,
      resetChangePasswordForm
    };
  }
});
</script>

<style scoped>
.layout-container {
  display: flex;
  height:  100vh;
}

.menu-bar {
  width: 260px;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.el-menu-item.is-active {
  background-color: #f0f0f0;
  border-radius: 5px;
  color: #409eff;
  font-weight: bold;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.menu-list {
  flex: 1;
  border-right: none;
}

.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info span {
  margin-right: 15px;
  color: black;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.forms-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.form-left,
.form-right {
  width: 48%;  /* Slightly adjusted width for better spacing */
}

.greeting-container {
  text-align: center;
}

h3 {
  margin-bottom: 15px;
  text-align: center;
}

.form-buttons {
  display: flex;
  justify-content: center; /* Horizontally center the buttons */
  gap: 20px;  /* Add space between the buttons */
}

.custom-button {
  background-color: black;
  color: white;
  border: none;
  font-weight: bold;
}

.custom-button:hover {
  background-color: #409eff !important;
  color: white !important;
}

.custom-button:active {
  background-color: #409eff !important;
  color: white !important;
}
</style>
