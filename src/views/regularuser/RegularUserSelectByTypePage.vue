<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
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

    <main class="content-area">
      <div class="toolbar">
        <div class="user-info">
          <span>欢迎您，{{ userName }}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="page-content">
        <div class="greeting-container">
          <p style="font-size: 1.5rem; font-weight: bold;">请选择要查看的分类</p>
        </div>

        <!-- 将按钮组改为级联菜单 -->
        <div class="menu-container">
          <el-menu mode="horizontal" class="category-menu">
            <el-sub-menu v-for="node in treeData" :key="node.id" :index="node.id.toString()">
              <template #title>{{ node.label }}</template>
              <el-menu-item 
                v-for="subNode in getSecondLevelData(node.label)" 
                :key="subNode.id"
                @click="handleSecondLevelClick(node.label, subNode.label)"
              >
                {{ subNode.label }}
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>

        <!-- 数据表格/提示信息 -->
        <div class="result-content">
          <el-table v-if="corpusData.length > 0" :data="paginatedData" border style="margin-top: 20px;">
            <el-table-column prop="chineseText" label="中文内容" align="center"></el-table-column>
            <el-table-column prop="englishText" label="英文内容" align="center"></el-table-column>
            <el-table-column prop="kindName" label="种类名称" align="center"></el-table-column>
            <el-table-column prop="typeName" label="分类名称" align="center"></el-table-column>
          </el-table>

          <!-- 修改分页器部分 -->
          <div class="pagination-fixed" v-if="corpusData.length > 0">
            <div style="text-align: center; margin-top: 20px;">
              <span>共 {{ totalPages }} 页</span>

              <!-- 上一页按钮 -->
              <el-button
                type="primary"
                @click="goToPreviousPage"
                :disabled="currentPage === 1"
                style="margin-left: 10px;"
              >
                上一页
              </el-button>

              <!-- 页码输入框 -->
              <el-input
                v-model="inputPage"
                type="number"
                placeholder="输入页码"
                style="width: 100px; display: inline-block; margin-left: 10px; margin-right: 10px;"
                :min="1"
                :max="totalPages"
              />

              <!-- 下一页按钮 -->
              <el-button
                type="primary"
                @click="goToNextPage"
                :disabled="currentPage === totalPages"
              >
                下一页
              </el-button>

              <!-- 确认按钮 -->
              <el-button
                type="primary"
                @click="goToPage"
                :disabled="inputPage < 1 || inputPage > totalPages"
              >
                确认
              </el-button>
            </div>
          </div>

          <div v-else class="no-data-message">
            <span v-if="errorMessage">{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter} from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");

    const activeMenu = ref("RegularUserSelectByType");
    const treeData = ref([]); // 第一层数据
    const corpusData = ref([]); // 表格数据
    const errorMessage = ref("");

    // 存储所有二级菜单数据的映射
    const secondLevelDataMap = ref(new Map());

    // 修改页相关的变量
    const currentPage = ref(1);
    const pageSize = ref(13); // 保持每页13条数据不变
    const inputPage = ref(1);

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(corpusData.value.length / pageSize.value);
    });

    // 计算当前页的数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return corpusData.value.slice(start, end);
    });

    // 分页控制方法
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
        inputPage.value = currentPage.value;
      }
    };

    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
        inputPage.value = currentPage.value;
      }
    };

    const goToPage = () => {
      if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
        currentPage.value = Number(inputPage.value);
      } else {
        ElMessage.error('请输入有效的页码');
      }
    };

    // 获取分类数据
    const fetchCategories = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectkindsname);
        if (response.data.code === 200) {
          treeData.value = response.data.data.map((category, index) => ({
            id: index + 1,
            label: category.kindName,
          }));
        } else {
          ElMessage.error("获取分类数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    };

    // 获取第二层分类数据的方法修改
    const fetchSecondLevelData = async (kindName) => {
      try {
        const response = await axios.get(`${apiEndpoints.selecttnbykn}?kindName=${kindName}`);
        if (response.data.code === 200) {
          const secondLevelData = response.data.data.map((type, index) => ({
            id: `${kindName}-${index + 1}`,
            label: type.typeName,
          }));
          secondLevelDataMap.value.set(kindName, secondLevelData);
        } else {
          ElMessage.error("获取第二层分类数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    };

    // 获取特定一级分类下的二分类数据
    const getSecondLevelData = (kindName) => {
      if (!secondLevelDataMap.value.has(kindName)) {
        fetchSecondLevelData(kindName);
        return [];
      }
      return secondLevelDataMap.value.get(kindName) || [];
    };

    // 获取语料数据
    const fetchCorpusData = async (kindName, typeName) => {
      try {
        const response = await axios.post(apiEndpoints.selecttypecorpus, {
          kindName,
          typeName,
        });

        if (response.data.code === 200) {
          corpusData.value = response.data.data;
          errorMessage.value = "";
          currentPage.value = 1; // 重置到第一页
        } else {
          corpusData.value = [];
          errorMessage.value = `类别 "${typeName}" 中没有语料`;
        }
      } catch (error) {
        corpusData.value = [];
        errorMessage.value = `类别 "${typeName}" 中没有语料`;
      }
    };

    // 修改二级菜单点击处理方法
    const handleSecondLevelClick = (kindName, typeName) => {
      fetchCorpusData(kindName, typeName);
    };

    // 菜单选择
    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index,
        query: { username: userName.value },
      });
    };

    // 退出登录
    const logout = () => {
      axios
          .post(apiEndpoints.logout)
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success("退出成功");
              router.push("/");
            } else {
              ElMessage.error("登录状态异常，请重新登录");
              router.push("/");
            }
          })
          .catch(() => {
            ElMessage.error("请求失败，请稍后重试");
            router.push("/");
          });
    };

    // 页面加载时获取分类数据
    onMounted(() => {
      fetchCategories();
    });

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      treeData,
      corpusData,
      errorMessage,
      getSecondLevelData,
      handleSecondLevelClick,
      currentPage,
      pageSize,
      inputPage,
      totalPages,
      paginatedData,
      goToPreviousPage,
      goToNextPage,
      goToPage,
    };
  },
});
</script>


<style scoped>
/* 页面布局 */
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f5f5;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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

.button-container,
.first-level-buttons,
.second-level-buttons {
  display: none;
}

.menu-container {
  margin: 20px 0;
}

.category-menu {
  display: flex;
  justify-content: center;
}

.result-content {
  margin-top: 20px;
}

.no-data-message {
  margin-top: 20px;
  color: #999;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.greeting-container {
  text-align: center;
}

h3 {
  margin-bottom: 15px;
  text-align: center;
}

/* 添加���转相关样式 */
.jump-container,
.jump-input {
  display: none;
}

/* 保留分页器容器样式 */
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

