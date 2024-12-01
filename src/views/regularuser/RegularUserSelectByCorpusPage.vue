<!--普通用户语料查询页面-->
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
        <div class="user-info">
          <span>欢迎您，{{ userName }}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>

      <div class="page-content">
        <!-- 搜索框 -->
        <div class="search-container">
          <el-input
              v-model="searchText"
              placeholder="请输入需要搜索的语料段"
              clearable
              @keyup.enter="searchCorpus"
          style="width: 60%;"
          ></el-input>
          <el-button
              type="primary"
              @click="searchCorpus"
              class="custom-button"
          >
            搜索
          </el-button>
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResult !== null">
          <!-- 有数据时展示表格 -->
          <div v-if="searchResult.length > 0" class="result-table">
            <span class="result-text">
              以下是包含字段 "{{ displaySearchText }}"的所有语料：
            </span>
            <el-table :data="searchResult" border style="margin-top: 20px;">
              <el-table-column prop="chineseText" label="中文内容" align="center"></el-table-column>
              <el-table-column prop="englishText" label="英文内容" align="center"></el-table-column>
              <el-table-column prop="kindName" label="种类名称" align="center"></el-table-column>
              <el-table-column prop="typeName" label="分类名称" align="center"></el-table-column>
            </el-table>
          </div>

          <!-- 没有数据时展示提示 -->
          <div v-else class="no-result-text">
            没有查询到 "{{ displaySearchText }}"相关语料
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig"; // 假设你的接口文件

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");
    const searchText = ref(''); // 搜索框的绑定值
    const displaySearchText = ref(''); // 用于显示的搜索文本
    const searchResult = ref(null); // 存储搜索结果

    const activeMenu = ref('RegularUserSelectByCorpus'); //

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      // 跳转并传递查询参数
      router.push({
        name: index, // 根据选中的菜单项进行跳转
        query: { username: userName.value}, // 传递 userName
      });
    };

    // 退出登录功能
    const logout = () => {
      axios
          .get(apiEndpoints.logout)
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success("退出成功");
              router.push("/"); // 跳转到登录页
            } else {
              ElMessage.error("登录状态异常，请重新登录");
              router.push("/"); // 跳转到登录页
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 401)
              ElMessage.error("身份验证失败，请重新登录");
            else
              ElMessage.error("请求失败，请稍后重试");
            router.push("/"); // 跳转到登录页
          });
    };

    // 搜索功能
    const searchCorpus = () => {
      const inputText = searchText.value.trim(); // 获取去除前后空格的搜索文本
      if (!inputText) {
        ElMessage.warning("请输入需要搜索的语料段");
        return;
      }

      displaySearchText.value = inputText; // 更新显示的搜索文本
      // 调用接口进行搜索
      axios.post(`${apiEndpoints.translationtext}?text=${inputText}`)
          .then((response) => {
            if (response.data.code === 200) {
              searchResult.value = response.data.data;
            } else {
              searchResult.value = [];
            }
          })
          .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
          });
    };

    return {
      userName,
      logout,
      searchText,
      displaySearchText,
      searchCorpus,
      searchResult,
      handleMenuSelect,
      activeMenu
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
/* 菜单项选中状态 */
.el-menu-item.is-active {
  background-color: #f0f0f0; /* 设置选中项的背景颜色 */
  border-radius: 5px;       /* 添加圆角效果 */
  color: #409eff;          /* 设置选中项的文字颜色 */
  font-weight: bold;       /* 加粗文字 */
}


/* 内容区域 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
  overflow: hidden; /* 防止整体区域溢出滚动 */
}

.page-content {
  flex: 1; /* 使内容区域占据剩余空间 */
  overflow-y: auto; /* 开启纵向滚动 */
  background-color: #ffffff; /* 确保有白色背景 */
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 添加视觉分隔感 */
  border-radius: 5px; /* 可选：圆角样式 */
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

/* 搜索框相关样式 */
.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 50px; /* 根据实际需求调整搜索框距顶部的距离 */
}


/* 搜索结果文本 */
.result-text {
  font-size: 14px;
  margin-top: 30px; /* 适当的上间距 */
  margin-bottom: 15px; /* 添加底部间距，确保与表格有适当的距离 */
  color: #999;
  font-weight: bold;
}

/* 搜索结果表格样式 */
.result-table {
  margin-top: 20px; /* 调整表格距离文本的距离 */
  width: 100%;
}


/* 无结果提示文字样式 */
.no-result-text {
  margin-top: 20px;
  text-align: center;
  color: #999; /* 统一颜色 */
  font-size: 16px;
  font-weight: bold;
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
.html, body {
  height: 100%;
  overflow: hidden; /* 禁止全局滚动 */
}

</style>

