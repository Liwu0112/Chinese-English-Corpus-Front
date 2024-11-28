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
          <!-- 退出按钮 -->
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>

      <!-- 主体内容 -->
      <div class="page-content">
        <p>这里是 分类页面内容。</p>

        <!-- 树形选择器 -->
        <el-tree
            :data="treeData"
            :props="treeProps"
            accordion
            default-expanded-keys="[1]"
            node-key="id"
            @node-click="handleNodeClick"
        ></el-tree>

        <!-- 数据表格/提示信息 -->
        <div class="result-content">
          <el-table v-if="corpusData.length > 0" :data="corpusData" border style="margin-top: 20px;">
            <el-table-column prop="chineseText" label="中文内容" width="300"></el-table-column>
            <el-table-column prop="englishText" label="英文内容" width="300"></el-table-column>
            <el-table-column prop="kindName" label="类别名称" width="150"></el-table-column>
            <el-table-column prop="typeName" label="分类名称" width="150"></el-table-column>
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
import apiEndpoints from "@/apiConfig"; // 假设你的接口文件

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const userName = ref(route.query.username);

    const activeMenu = ref("RegularUserSelectByType");
    const treeData = ref([]);
    const corpusData = ref([]);
    const errorMessage = ref(""); // 用于显示无数据提示信息
    const treeProps = {
      children: "children",
      label: "label",
    };

    // 获取第一层分类数据
    const fetchCategories = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectkindsname);
        if (response.data.code === 200) {
          const categories = response.data.data.map((category, index) => ({
            id: index + 1,
            label: category.kindName,
            children: [],
            parent: null,
          }));
          treeData.value = categories;
        } else {
          ElMessage.error("获取分类数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    };

    // 获取第二层分类数据
    const fetchSecondLevelData = async (kindName, node) => {
      try {
        const response = await axios.post(`${apiEndpoints.selecttnbykn}?kindName=${kindName}`);
        if (response.data.code === 200) {
          const secondLevelData = response.data.data.map((type, index) => ({
            id: `${node.id}-${index + 1}`,
            label: type.typeName,
            children: [],
            parent: node,
          }));
          node.children = secondLevelData;
        } else {
          ElMessage.error("获取第二层分类数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    };

    // 树形节点点击事件
    const handleNodeClick = async (node) => {
      // 如果没有子节点，尝试加载第二层数据
      if (node.children && node.children.length === 0) {
        await fetchSecondLevelData(node.label, node);
      }

      // 如果是第二层节点，调用接口获取语料数据
      if (node.parent) {
        const firstLevelName = node.parent.label;
        const secondLevelName = node.label;

        try {
          const response = await axios.post(apiEndpoints.selecttypecorpus, {
            kindName: firstLevelName,
            typeName: secondLevelName,
          });

          if (response.data.code === 200) {
            corpusData.value = response.data.data; // 显示表格数据
            errorMessage.value = ""; // 清空错误信息
          } else {
            corpusData.value = [];
            errorMessage.value = `类别 "${secondLevelName}" 中没有语料`;
          }
        } catch (error) {
          corpusData.value = [];
          errorMessage.value = `类别 "${secondLevelName}" 中没有语料`;
        }
      }
    };

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index,
        query: { username: userName.value },
      });
    };

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

    onMounted(() => {
      fetchCategories();
    });

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      treeData,
      treeProps,
      handleNodeClick,
      corpusData,
      errorMessage,
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

/* 左侧菜单栏 */
.menu-bar {
  width: 260px;
  background-color: #fff;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

/* 菜单项选中状态 */
.el-menu-item.is-active {
  background-color: #f0f0f0; /* 设置选中项的背景颜色 */
  border-radius: 5px; /* 添加圆角效果 */
  color: #409eff; /* 设置选中项的文字颜色 */
  font-weight: bold; /* 加粗文字 */
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

/* 树形选择器 */
.el-tree {
  margin-top: 20px;
}

/* 结果内容区域 */
.result-content {
  margin-top: 20px;
}

/* 无数据提示样式 */
.no-data-message {
  margin-top: 20px;
  color: #999;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
html, body {
  height: 100%;
  overflow: hidden; /* 禁止全局滚动 */
}

</style>
