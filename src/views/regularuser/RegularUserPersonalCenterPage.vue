<!--普通用户主页面-->
<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
      <!-- LOGO区域 -->
      <div class="logo-container">
        <span class="logo-text">中英文语料库</span>
      </div>

      <!-- 菜单项 -->
      <el-menu class="menu-list" router>
        <el-sub-menu index="功能">
          <template #title>
            <i class="el-icon-shopping-cart-full"></i>
            <span>功能</span>
          </template>
          <el-menu-item
              :index="{ path: '/regular_user_corpus', query: { username: userName } }"
          >
            语句查询
          </el-menu-item>
          <el-menu-item
              :index="{ path: '/regular_user_type', query: { username: userName } }"
          >
            分类查询
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="用户">
          <template #title>
            <i class="el-icon-user"></i>
            <span>用户</span>
          </template>
          <el-menu-item index="个人中心">个人中心</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </aside>

    <!-- 内容区域 -->
    <main class="content-area">
      <div class="toolbar">
        <!-- 工具栏 -->
        <el-button type="text" size="mini" @click="toggleTheme">
          <i :class="themeIcon"></i>
        </el-button>
        <div class="user-info">
          <span>欢迎您，{{ userName }}</span>
          <!-- 退出按钮 -->
          <el-button type="text" size="mini" @click="logout">退出</el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="page-content">
        <p>这里是 首页 页面内容。</p>
      </div>
    </main>
  </div>
</template>



<script>
import { defineComponent, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig"; // 假设你的接口文件

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userName = ref(route.query.username);

    const logout = () => {
      axios
          .get(apiEndpoints.logout, {
          })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success("退出成功");
              router.push("/");
            } else {
              ElMessage.error("登录状态异常，请重新登录");
              router.push("/");
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              ElMessage.error("身份验证失败，请重新登录");
            } else {
              ElMessage.error("请求失败，请稍后重试");
            }
            router.push("/");
          });
    };

    return {
      userName,
      logout,
    };
  },
});

</script>


<style scoped>
/* 页面布局 */
.layout-container {
  display: flex;
  height: 100vh;
}

/* 左侧菜单栏 */
.menu-bar {
  width: 260px;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

/* LOGO区域 */
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

/* 菜单列表 */
.menu-list {
  flex: 1;
  border-right: none;
}

/* 内容区域 */
.content-area {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
}

/* 工具栏 */
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

/* 添加间距 */
.user-info span {
  margin-right: 15px; /* 设置欢迎文本与按钮之间的间距 */
  color: black; /* 设置字体颜色为黑色 */
}
</style>

