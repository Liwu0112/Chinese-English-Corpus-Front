<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
      <!-- LOGO区域 -->
      <div class="logo-container">
        <span class="logo-text">中英文语料库</span>
      </div>

      <!-- 菜单项 -->
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
        <el-button type="text" size="mini" @click="toggleTheme">
          <i :class="themeIcon"></i>
        </el-button>
        <div class="user-info">
          <span>欢迎您，{{ userName }}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="page-content">
        <p>这里是 语料搜索 页面内容。</p>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();

    const userName = ref(route.query.username); // 从路由的查询参数中获取 userName
    const activeMenu = ref('RegularUserHome'); //

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      // 跳转并传递查询参数
      router.push({
        name: index, // 根据选中的菜单项进行跳转
        query: { username: userName.value}, // 传递 userName
      });
    };

    const logout = () => {
      router.push('/'); // 退出登录时跳转到首页
    };

    return {
      userName,
      activeMenu,
      handleMenuSelect,
      logout,
    };
  },
});
</script>


<style scoped>
/* 页面布局 */
.layout-container {
  display: flex;
  height:100vh;
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

/* 菜单项选中状态 */
.el-menu-item.is-active {
  background-color: #f0f0f0; /* 设置选中项的背景颜色 */
  border-radius: 5px;       /* 添加圆角效果 */
  color: #409eff;          /* 设置选中项的文字颜色 */
  font-weight: bold;       /* 加粗文字 */
}

/* 未选中的菜单项 */
.el-menu-item {
  color: #333;
  transition: all 0.3s ease;
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
