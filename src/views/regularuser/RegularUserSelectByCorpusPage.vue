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
        <!-- 搜索框区域 -->
        <div class="button-group">
          <el-input
            v-model="searchText"
            placeholder="请输入需要搜索的语料段"
            class="search-input"
            clearable
            @input="searchCorpus"
            @clear="searchCorpus"
          >
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>

        <!-- 表格区域 -->
        <div class="result-container">
          <el-table 
            :data="currentPageData" 
            border
            style="margin-top: 20px;"
            :height="'calc(13 * 47px + 47px)'"
          >
            <el-table-column prop="chineseText" label="中文内容" align="center"></el-table-column>
            <el-table-column prop="englishText" label="英文内容" align="center"></el-table-column>
            <el-table-column prop="kindName" label="种类名称" align="center"></el-table-column>
            <el-table-column prop="typeName" label="分类名称" align="center"></el-table-column>
          </el-table>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-fixed">
          <div style="text-align: center; margin-top: 20px;">
            <span>共 {{ totalPages }} 页</span>
            <el-button
              type="primary"
              @click="goToPreviousPage"
              :disabled="currentPage === 1"
              style="margin-left: 10px;"
            >
              上一页
            </el-button>
            <el-input
              v-model="inputPage"
              type="number"
              placeholder="输入页码"
              style="width: 100px; display: inline-block; margin-left: 10px; margin-right: 10px;"
              :min="1"
              :max="totalPages"
            />
            <el-button
              type="primary"
              @click="goToNextPage"
              :disabled="currentPage === totalPages"
            >
              下一页
            </el-button>
            <el-button
              type="primary"
              @click="goToPage"
              :disabled="inputPage < 1 || inputPage > totalPages"
            >
              确认
            </el-button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
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
        name: index, // 选中的菜单项进行跳转
        query: { username: userName.value}, // 传递 userName
      });
    };

    // 退出登录功能
    const logout = () => {
      axios
          .post(apiEndpoints.logout)
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

    // 添加分页相关的响应式变量
    const allCorpusData = ref([]); // 存储所有语料数据
    const currentPage = ref(1);
    const pageSize = ref(12);
    const totalItems = ref(0);
    const currentPageData = ref([]);

    // 修改搜索功能
    const searchCorpus = () => {
      const inputText = searchText.value.trim();
      if (!inputText) {
        // 当搜索框为空时，显示所有数据
        currentPageData.value = allCorpusData.value.slice(0, 13);
        totalItems.value = allCorpusData.value.length;
        currentPage.value = 1;
        return;
      }

      displaySearchText.value = inputText;
      axios.post(`${apiEndpoints.translationtext}?text=${inputText}`)
        .then((response) => {
          if (response.data.code === 200) {
            searchResult.value = response.data.data;
            totalItems.value = response.data.data.length;
            currentPage.value = 1;
            updateCurrentPageData();
          } else {
            searchResult.value = [];
            totalItems.value = 0;
            currentPageData.value = [];
          }
        })
        .catch(() => {
          ElMessage.error("请求失败，请稍后重试");
        });
    };

    // 修改更新当前页数据的方法
    const updateCurrentPageData = () => {
      const start = (currentPage.value - 1) * 13;
      const end = start + 13;
      const dataSource = searchText.value.trim() ? searchResult.value : allCorpusData.value;
      if (dataSource) {
        currentPageData.value = dataSource.slice(start, end);
        totalItems.value = dataSource.length;
      }
    };

    // 获取所有语料数据
    const fetchAllCorpus = () => {
      axios.get(apiEndpoints.reselectallcorpus)
        .then((response) => {
          if (response.data.code === 200) {
            allCorpusData.value = response.data.data;
            totalItems.value = response.data.data.length;
            updateCurrentPageData();
          } else {
            ElMessage.error("获取数据失败");
          }
        })
        .catch(() => {
          ElMessage.error("请求失败，请稍后重试");
        });
    };

    // 处理页码改变
    const handlePageChange = (newPage) => {
      currentPage.value = newPage;
      updateCurrentPageData();
    };

    // 页面加载时立即获取数据
    onMounted(() => {
      fetchAllCorpus();
    });

    // 在 setup 中添加新的分页方法
    const inputPage = ref(1);

    // 计算总页数
    const totalPages = computed(() => {
      const dataSource = searchText.value.trim() ? searchResult.value : allCorpusData.value;
      return Math.ceil((dataSource?.length || 0) / 13);
    });

    // 分页控制方法
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
        inputPage.value = currentPage.value;
        updateCurrentPageData();
      }
    };

    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
        inputPage.value = currentPage.value;
        updateCurrentPageData();
      }
    };

    const goToPage = () => {
      if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
        currentPage.value = Number(inputPage.value);
        updateCurrentPageData();
      } else {
        ElMessage.error('请输入有效的页码');
      }
    };

    // 添加表格高度计算
    const tableHeight = computed(() => {
      return 13 * 40 + 40 + 'px';
    });

    return {
      userName,
      logout,
      searchText,
      displaySearchText,
      searchCorpus,
      searchResult,
      handleMenuSelect,
      activeMenu,
      currentPage,
      pageSize,
      totalItems,
      currentPageData,
      handlePageChange,
      inputPage,
      totalPages,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      tableHeight,
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
  overflow: hidden;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  position: relative;
  height: calc(100vh - 100px);
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

/* 添加间�� */
.user-info span {
  margin-right: 15px; /* 设置欢迎文字与按钮之间的间距 */
  color: black; /* 设置字体颜色为黑色 */
}

/* 搜索框相关样式 */
.search-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}


/* 搜索结果文本 */
.result-text {
  font-size: 14px;
  margin-top: 30px; /* 适当上间距 */
  margin-bottom: 15px; /* 添加底部间距，确保与表格有适当的距离 */
  color: #999;
  font-weight: bold;
}

/* 搜索结果表格样式 */
.result-table {
  margin-top: 20px; /* 调整表格距文本的距离 */
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

/* 修改分页相关样式 */
.pagination-fixed {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background-color: transparent;
  padding: 15px 0;
  text-align: center;
  z-index: 1000;
  box-shadow: none;
}

/* 修改分页按钮样式 */
.pagination-fixed .el-button {
  margin: 0 5px;
  padding: 8px 15px;
}

.pagination-fixed .el-input {
  margin: 0 5px;
}

/* 确保内容不会被分页组件遮挡 */
.content-area {
  padding-bottom: 80px;
}

/* 表格样式优化 */
.el-table {
  border-radius: 4px;
  margin-bottom: 20px;
}

/* 移除多余的表格边框样式 */
:deep(.el-table__inner-wrapper::after),
:deep(.el-table::before),
:deep(.el-table__footer-wrapper::before) {
  display: none;
}

:deep(.el-table__inner-wrapper) {
  border-bottom: 1px solid #EBEEF5;
}

/* 调整表格行高 */
:deep(.el-table__row) {
  height: 47px;
}

:deep(.el-table__header-row) {
  height: 47px;
}

/* 表格内容溢出处理 */
.el-table .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分页器样式 */
.pagination-fixed {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background-color: transparent;
  padding: 15px 0;
  text-align: center;
  z-index: 1000;
  box-shadow: none;
}

.pagination-fixed .el-button {
  margin: 0 5px;
  padding: 8px 15px;
}

.pagination-fixed .el-input {
  margin: 0 5px;
}
</style>

