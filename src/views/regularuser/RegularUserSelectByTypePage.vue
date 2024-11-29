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

        <!-- 横向按钮组 -->
        <div class="button-container">
          <div class="first-level-buttons">
            <el-button
                v-for="(node) in treeData"
                :key="node.id"
                type="primary"
                plain
                @click="handleFirstLevelClick(node)"
            >
              {{ node.label }}
            </el-button>
          </div>
          <div class="second-level-buttons" v-if="currentSecondLevel.length > 0">
            <el-button
                v-for="(node) in currentSecondLevel"
                :key="node.id"
                type="success"
                plain
                @click="handleSecondLevelClick(node)"
            >
              {{ node.label }}
            </el-button>
          </div>
        </div>

        <!-- 数据表格/提示信息 -->
        <div class="result-content">
          <el-table v-if="corpusData.length > 0" :data="corpusData" border style="margin-top: 20px;">
            <el-table-column prop="chineseText" label="中文内容" align="center"></el-table-column>
            <el-table-column prop="englishText" label="英文内容" align="center"></el-table-column>
            <el-table-column prop="kindName" label="种类名称" align="center"></el-table-column>
            <el-table-column prop="typeName" label="分类名称" align="center"></el-table-column>
          </el-table>

          <div v-else class="no-data-message">
            <span v-if="errorMessage">{{ errorMessage }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userName = ref(route.query.username);

    const activeMenu = ref("RegularUserSelectByType");
    const treeData = ref([]); // 第一层数据
    const currentSecondLevel = ref([]); // 当前显示的第二层数据
    const currentFirstLevel = ref(""); // 当前选中的第一层分类值
    const corpusData = ref([]); // 表格数据
    const errorMessage = ref("");

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

    // 获取第二层分类数据
    const fetchSecondLevelData = async (kindName) => {
      try {
        const response = await axios.post(`${apiEndpoints.selecttnbykn}?kindName=${kindName}`);
        if (response.data.code === 200) {
          currentSecondLevel.value = response.data.data.map((type, index) => ({
            id: `${kindName}-${index + 1}`,
            label: type.typeName,
          }));
        } else {
          ElMessage.error("获取第二层分类数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
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
        } else {
          corpusData.value = [];
          errorMessage.value = `类别 "${typeName}" 中没有语料`;
        }
      } catch (error) {
        corpusData.value = [];
        errorMessage.value = `类别 "${typeName}" 中没有语料`;
      }
    };

    // 点击第一层按钮时加载第二层并保存当前分类值
    const handleFirstLevelClick = async (node) => {
      currentFirstLevel.value = node.label; // 保存第一层分类值
      await fetchSecondLevelData(node.label);
    };

    // 点击第二层按钮时加载语料数据并传递第一层和第二层值
    const handleSecondLevelClick = (node) => {
      const kindName = currentFirstLevel.value; // 从已保存的第一层分类值中获取
      const typeName = node.label;
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
          .get(apiEndpoints.logout)
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
      currentSecondLevel,
      currentFirstLevel,
      corpusData,
      errorMessage,
      handleFirstLevelClick,
      handleSecondLevelClick,
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
  background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
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

.button-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.first-level-buttons,
.second-level-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.el-button {
  padding: 10px 20px;
  font-size: 1rem;
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
</style>

