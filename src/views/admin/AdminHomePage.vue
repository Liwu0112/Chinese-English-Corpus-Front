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
        <el-menu-item index="AdminControllerCorpus">
          <i class="el-icon-document"></i>
          <span>语料管理</span>
        </el-menu-item>
        <el-menu-item index="AdminControllerKinds">
          <i class="el-icon-document"></i>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="AdminConUsers">
          <i class="el-icon-document"></i>
          <span>用户管理</span>
        </el-menu-item> <el-menu-item index="AdminPersonalCenter">
        <i class="el-icon-document"></i>
        <span>个人中心</span>
      </el-menu-item>
      </el-menu>
    </aside>
    <!-- 内容区域 -->
    <main class="content-area">
      <div class="toolbar">
        <div class="user-info">
          <span>欢迎您，{{userName}}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>
      <div class="page-content">
        <div class="greeting-container">
          <p style="font-size: 1.5rem; font-weight: bold;">{{greeting}}, {{userName}}! 欢迎使用中英文语料库！</p>
        </div>
        <div class="data-container">
          <div class="chart-section full-width">
            <h3 class="chart-title">各种类对应语料总数</h3>
            <v-chart class="chart" :option="kindCorpusOption" />
          </div>

          <div class="chart-section">
            <h3 class="chart-title">当前语料库中各语料数据总览</h3>
            <v-chart class="chart" :option="totalDataOption" />
          </div>

          <div class="chart-section">
            <h3 class="chart-title">当前语料库中普通用户数量</h3>
            <v-chart class="chart" :option="userDataOption" />
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
import apiEndpoints from "@/apiConfig";
import VChart from 'vue-echarts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';

echarts.use([
  CanvasRenderer,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

export default defineComponent({
  components: {
    VChart
  },
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
    const getCorpusData = async () => {
      try {
        // 使用 Promise.all 并行发起多个请求
        const [corpusResponse, kindResponse, typeResponse] = await Promise.all([
          axios.get(apiEndpoints.selectallcorscount),
          axios.get(apiEndpoints.selectallkindcount),
          axios.get(apiEndpoints.selectalltypecount),
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
    // 在页面挂载完成后调用接口获取据数
    onMounted(() => {
      getCorpusData();
      getKindCorpusData();
      getUserData()
    });

    // 总数图表配置
    const totalDataOption = computed(() => ({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        type: 'pie',
        radius: '50%',
        data: tableData.value.map(item => ({
          name: item.name,
          value: item.value
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }));

    // 用户数据图表配置
    const userDataOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '15%',
        right: '15%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: userData.value.map(item => item.name),
        axisLabel: {
          fontSize: 14,
          color: '#333'
        },
        axisTick: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#ccc'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '用户数量',
        nameTextStyle: {
          fontSize: 14,
          color: '#666'
        },
        minInterval: 1,
        axisLabel: {
          fontSize: 12,
          color: '#666',
          formatter: function(value) {
            return Math.floor(value);
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        }
      },
      series: [{
        type: 'bar',
        data: userData.value.map(item => item.value),
        barWidth: '40%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: '#409EFF' // 渐变开始颜色
            }, {
              offset: 1,
              color: '#95CCF9' // 渐变结束颜色
            }]
          },
          borderRadius: [8, 8, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: '#66b1ff' // 悬停时的渐变开始颜色
              }, {
                offset: 1,
                color: '#b3d8ff' // 悬停时的渐变结束颜色
              }]
            }
          }
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 14,
          color: '#666',
          formatter: '{c}'
        }
      }]
    }));

    // 种类数据图表配置
    const kindCorpusOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['语料数', '上线数', '下线数']
      },
      xAxis: {
        type: 'category',
        data: kindCorpusTableData.value.map(item => item.kindName),
        axisLabel: {
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '语料数',
          type: 'bar',
          data: kindCorpusTableData.value.map(item => item.corpusCount)
        },
        {
          name: '上线数',
          type: 'bar',
          data: kindCorpusTableData.value.map(item => item.onlineCount)
        },
        {
          name: '下线数',
          type: 'bar',
          data: kindCorpusTableData.value.map(item => item.offlineCount)
        }
      ]
    }));

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      tableData,
      kindCorpusTableData,
      getUserData,
      userData,
      totalDataOption,
      userDataOption,
      kindCorpusOption
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

.data-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 0 20px 20px;
}

.chart-section {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.chart {
  height: 280px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.full-width .chart {
  height: 300px;
}

.greeting-container {
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

.chart-title {
  text-align: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
  width: 100%;
}

@media screen and (max-height: 800px) {
  .chart {
    height: 240px;
  }
  
  .full-width .chart {
    height: 260px;
  }
}

@media screen and (max-width: 1200px) {
  .data-container {
    padding: 0 10px 10px;
  }
  
  .chart-section {
    padding: 5px;
  }
}
</style>