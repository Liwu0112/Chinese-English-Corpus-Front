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
          </el-card>

          <el-card class="form-right" shadow="always">
            <h3>各种类对应语料总数</h3>
            <el-table :data="kindCorpusTableData" border style="margin-top: 20px;">
            <el-table-column prop="kindName" label="种类名称"  align="center"></el-table-column>
            <el-table-column prop="corpusCount" label="语料总数"  align="center"></el-table-column>
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
    const activeMenu = ref("RegularUserHome");

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
        query: { username: userName.value }
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
    // 用于存储表格数据的响应式数据
    const tableData = ref([]);

    // 定义函数用于调用接口并处理数据展示
    const getCorpusData = () => {
      // 调用reselectcountcorpus接口获取语料数
      axios.get(apiEndpoints.reselectcountcorpus)
          .then((response) => {
            const corpusCount = response.data.data;
            // 调用reselectcountkind接口获取种类数
            axios.get(apiEndpoints.reselectcountkind)
                .then((kindResponse) => {
                  const kindCount = kindResponse.data.data;
                  // 调用reselectcounttype接口获取分类数
                  axios.get(apiEndpoints.reselectcounttype)
                      .then((typeResponse) => {
                        const typeCount = typeResponse.data.data;

                        // 创建表格数据
                        tableData.value = [
                          {
                            name: '语料数',
                            value: corpusCount
                          },
                          {
                            name: '种类数',
                            value: kindCount
                          },
                          {
                            name: '分类数',
                            value: typeCount
                          }
                        ];
                      })
                      .catch((typeError) => {
                        ElMessage.error('获取分类数失败，请稍后重试');
                        console.error(typeError);
                      });
                })
                .catch((kindError) => {
                  ElMessage.error('获取种类数失败，请稍后重试');
                  console.error(kindError);
                });
          })
          .catch((corpusError) => {
            ElMessage.error('获取语料数失败，请稍后重试');
            console.error(corpusError);
          });
    };
    const kindCorpusTableData = ref([]);
    const getKindCorpusData = () => {
      // 先调用selectkindsname接口获取种类名称数据
      axios.get(apiEndpoints.selectkindsname)
          .then((selectKindsResponse) => {
            const kindsData = selectKindsResponse.data.data;
            const kindCorpusDataPromises = kindsData.map(kind => {
              // 对于每个种类名称，调用rescorpusbykindname接口获取对应语料总数
              return axios.get(`${apiEndpoints.rescorpusbykindname}?kindName=${kind.kindName}`)
                  .then((corpusByKindResponse) => {
                    return {
                      kindName: kind.kindName,
                      corpusCount: corpusByKindResponse.data.data
                    };
                  })
                  .catch((error) => {
                    ElMessage.error(`获取${kind.kindName}种类对应语料总数失败，请稍后重试`);
                    console.error(error);
                    return {
                      kindName: kind.kindName,
                      corpusCount: 0
                    };
                  });
            });

            // 等待所有种类对应语料总数的请求都完成
            Promise.all(kindCorpusDataPromises)
                .then((results) => {
                  kindCorpusTableData.value = results;
                });
          })
          .catch((selectKindsError) => {
            ElMessage.error('获取种类名称数据失败，请稍后重试');
            console.error(selectKindsError);
          });
    }


    // 在页面挂载完成后调用接口获取数据函数
    onMounted(() => {
      getCorpusData();
      getKindCorpusData();
    });


    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      tableData,
      kindCorpusTableData
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