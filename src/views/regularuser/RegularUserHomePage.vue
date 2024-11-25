<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
      <!-- LOGO区域 -->
      <div class="logo-container">
        <span class="logo-text">中英文语料库</span>
      </div>

      <!-- 菜单项 -->
      <el-menu :default-active="activeMenu" class="menu-list" router>
        <el-sub-menu index="订阅">
          <template #title>
            <i class="el-icon-shopping-cart-full"></i>
            <span>订阅</span>
          </template>
          <el-menu-item index="购买订阅">购买订阅</el-menu-item>
          <el-menu-item index="我的订阅">我的订阅</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="财务">
          <template #title>
            <i class="el-icon-wallet"></i>
            <span>财务</span>
          </template>
          <el-menu-item index="我的订单">我的订单</el-menu-item>
          <el-menu-item index="我的邀请">我的邀请</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="用户">
          <template #title>
            <i class="el-icon-user"></i>
            <span>用户</span>
          </template>
          <el-menu-item index="个人中心">个人中心</el-menu-item>
          <el-menu-item index="流量明细">流量明细</el-menu-item>
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
        <h1>{{ activePage }}</h1>
        <p>这里是 {{ activePage }} 页面内容。</p>
      </div>
    </main>
  </div>
</template>



<script>
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // 导入 useRouter 和 useRoute
import axios from 'axios';
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter(); // 获取路由实例
    const route = useRoute(); // 获取当前路由实例

    // 从路由参数中获取用户名
    const userName = ref(route.query.username);

    // 切换主题逻辑
    const toggleTheme = () => {
      console.log('切换主题');
    };

    // 登出逻辑
    const logout = async () => {
      try {
        const response = await axios.get(apiEndpoints.logout);

        // 根据返回的状态码判断是否退出成功
        if (response.data.code === 200) {
          console.log('退出成功', response);
          // 跳转到登录页面
          router.push({ name: 'Login' }); // 使用 router 实例进行路由跳转
        } else {
          console.error('登录过期，重新登录！');
        }
      } catch (error) {
        console.error('退出请求失败', error);
        // 网络错误或其他异常情况，跳转到登录页面
        router.push({ name: 'Login' });
      }
    };

    return {
      userName,
      toggleTheme,
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
  margin-right: 15px;  /* 设置欢迎文本与按钮之间的间距 */
  color: black; /* 设置字体颜色为黑色 */
}
</style>

