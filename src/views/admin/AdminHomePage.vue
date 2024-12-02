<template>
  <div class="layout-container">
    <!-- 左侧菜单栏 -->
    <aside class="menu-bar">
      <div class="logo-container">
        <span class="logo-text">中英文语料库</span>
      </div>
      <el-menu class="menu-list" router :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item index="AdminHome">
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
          <span>欢迎您，{{userName}}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>
      <div class="page-content">
        <div class="greeting-container">
          <p style="font-size: 1.5rem; font-weight: bold;">{{greeting}}, {{userName}}! 欢迎使用中英文语料库！</p>
        </div>
        <div class="forms-container">
          <el-card class="form-left" shadow="always">
            <h3>当前语料库中各数据总数</h3>
            <el-table :data="tableData" border style="margin-top: 20px;">
              <el-table-column prop="name" label="名称"  align="center"></el-table-column>
              <el-table-column prop="value" label="数量"  align="center"></el-table-column>
            </el-table>

            <h3>当前语料库中用户数量</h3>
            <el-table :data="userData" border style="margin-top: 20px;">
              <el-table-column prop="name" label="名称"  align="center"></el-table-column>
              <el-table-column prop="value" label="数量"  align="center"></el-table-column>
            </el-table>
          </el-card>

          <el-card class="form-right" shadow="always">
            <h3>各种类对应语料总数</h3>
            <el-table :data="kindCorpusTableData" border style="margin-top: 20px;">
              <el-table-column prop="kindName" label="种类名称" align="center"></el-table-column>
              <el-table-column prop="corpusCount" label="语料数" align="center"></el-table-column>
              <el-table-column prop="onlineCount" label="上线数" align="center"></el-table-column>
              <el-table-column prop="offlineCount" label="下线数" align="center"></el-table-column>
            </el-table>
          </el-card>

        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");
    const activeMenu = ref("AdminHome");

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

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index,
      });
    };

    const logout = () => {
      axios.get(apiEndpoints.logout).then((response) => {
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

    // 用于存储表格数据的响应式数据
    const tableData = ref([]);
    // 定义函数用于调用接口并处理数据展示
    const getCorpusData = async () => {
      try {
        // 使用 Promise.all 并行发起多个请求
        const [corpusResponse, kindResponse, typeResponse] = await Promise.all([
          axios.get(apiEndpoints.selectallcors),
          axios.get(apiEndpoints.selectallkind),
          axios.get(apiEndpoints.selectalltype),
        ]);

        // 提取返回的数据
        const corpusCount = corpusResponse.data.data;
        const kindCount = kindResponse.data.data;
        const typeCount = typeResponse.data.data;

        // 创建表格数据
        tableData.value = [
          {
            name: '语料数',
            value: corpusCount,
          },
          {
            name: '种类数',
            value: kindCount,
          },
          {
            name: '分类数',
            value: typeCount,
          },
        ];
      } catch (error) {
        // 统一错误处理
        ElMessage.error('获取数据失败，请稍后重试');
      }
    };

    const userData = ref([]);
    // 定义函数用于调用接口并处理数据展示
    const getUserData = async () => {
      try {
        // 使用 Promise.all 并行发起多个请求
        const [userResponse] = await Promise.all([
          axios.get(apiEndpoints.selectreusercount),
        ]);

        // 提取返回的数据
        const userCount = userResponse.data.data;

        // 创建表格数据
        userData.value = [
          {
            name: '普通用户数',
            value: userCount,
          },
        ];
      } catch (error) {
        // 统一错误处理
        ElMessage.error('获取数据失败，请稍后重试');
      }
    };

    const kindCorpusTableData = ref([]);
    const getKindCorpusData = () => {
      axios.get(apiEndpoints.selectkindsname)
          .then((selectKindsResponse) => {
            const kindsData = selectKindsResponse.data.data;

            const kindCorpusDataPromises = kindsData.map((kind) => {
              // 获取种类对应的语料总数、上线数和下线数
              return Promise.all([
                axios.get(`${apiEndpoints.selectKindcors}?kindName=${kind.kindName}`),
                axios.get(`${apiEndpoints.selectonlinebykindname}?kindName=${kind.kindName}`),
                axios.get(`${apiEndpoints.selectofflinebykindname}?kindName=${kind.kindName}`),
              ])
                  .then(([corpusRes, onlineRes, offlineRes]) => {
                    return {
                      kindName: kind.kindName,
                      corpusCount: corpusRes.data.data || 0,
                      onlineCount: onlineRes.data.data || 0,
                      offlineCount: offlineRes.data.data || 0,
                    };
                  })
                  .catch(() => {
                    ElMessage.error(`获取${kind.kindName}种类的统计数据失败，请稍后重试`);
                    return {
                      kindName: kind.kindName,
                      corpusCount: 0,
                      onlineCount: 0,
                      offlineCount: 0,
                    };
                  });
            });

            // 等待所有种类统计数据的请求完成
            Promise.all(kindCorpusDataPromises).then((results) => {
              kindCorpusTableData.value = results;
              const totalCorpusCount = kindCorpusTableData.value.reduce((acc, item) => acc + item.corpusCount, 0);
              // 计算上线数的总和
              const totalOnlineCount = kindCorpusTableData.value.reduce((acc, item) => acc + item.onlineCount, 0);
              // 计算下线数的总和
              const totalOfflineCount = kindCorpusTableData.value.reduce((acc, item) => acc + item.offlineCount, 0);

              // 将总数添加到kindCorpusTableData数组中作为新的一行数据
              kindCorpusTableData.value.push({
                kindName: '总数',
                corpusCount: totalCorpusCount,
                onlineCount: totalOnlineCount,
                offlineCount: totalOfflineCount
              });
            });
          })

          .catch(() => {
            ElMessage.error('获取种类名称数据失败，请稍后重试');
          });
    };
    // 在页面挂载完成后调用接口获取数据函数
    onMounted(() => {
      getCorpusData();
      getKindCorpusData();
      getUserData()
    });
    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      tableData,
      kindCorpusTableData,
      getUserData,
      userData
    };
  }
});
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
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
  width: 48%; /* Slightly adjusted width for better spacing */
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
  gap: 20px; /* Add space between the buttons */
}

.custom-button {
  background-color: black;
  color: white;
  border: none;
  font-weight: bold;
}

.custom-button:hover {
  background-color: #409eff!important;
  color: white!important;
}

.custom-button:active {
  background-color: #409eff!important;
  color: white!important;
}
</style>