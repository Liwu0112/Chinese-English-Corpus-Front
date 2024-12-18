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
            <h3 class="chart-title">各种类对应语料数据图</h3>
            <v-chart class="chart" :option="kindCorpusOption" />
          </div>

          <div class="chart-section">
            <h3 class="chart-title">当前语料库中种类分类比例图</h3>
            <v-chart class="chart" :option="totalDataOption" />
          </div>

          <div class="chart-section">
            <div class="status-section">
              <h3 class="chart-title">语料上线状态比例图</h3>
              <div class="total-corpus">
                <span class="total-label">语料总数：</span>
                <span class="total-value">{{ totalCorpus }}</span>
              </div>
              <v-chart class="chart" :option="corpusStatusOption" />
            </div>
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

    // ���于存储表格数据的响应式数据
    const tableData = ref([]);
    // 定义函数用于调用接口并处理数据展示
    const getCorpusData = async () => {
      try {
        // 只获取种类数和分类数
        const [kindResponse, typeResponse] = await Promise.all([
          axios.get(apiEndpoints.selectallkindcount),
          axios.get(apiEndpoints.selectalltypecount),
        ]);

        // 提取返回的数据
        const kindCount = kindResponse.data.data;
        const typeCount = typeResponse.data.data;

        // 只保存种类数和分类数
        tableData.value = [
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
            });
          })
          .catch(() => {
            ElMessage.error('获取种类名称数据失败，请稍后重试');
          });
    };

    // 添加新的响应式引用和获取数据的函数
    const corpusStatusData = ref([]);

    const getCorpusStatusData = async () => {
      try {
        const [onlineResponse, offlineResponse] = await Promise.all([
          axios.get(apiEndpoints.selectallonlinecount),
          axios.get(apiEndpoints.selectallofflinecount),
        ]);

        const onlineCount = onlineResponse.data.data;
        const offlineCount = offlineResponse.data.data;

        corpusStatusData.value = [
          {
            name: '上线语料',
            value: onlineCount,
          },
          {
            name: '下线语料',
            value: offlineCount,
          },
        ];
      } catch (error) {
        ElMessage.error('获取语料状态数据失败，请稍后重试');
      }
    };

    // 在页面挂载完成后调用接口获取据数
    onMounted(() => {
      getCorpusData();
      getKindCorpusData();
      getCorpusStatusData();
    });

    // 总数图表配置
    const totalDataOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      color: ['#F4D03F', '#82E0AA'], // 淡黄色和浅绿色
      series: [{
        name: '数据总览',
        type: 'pie',
        radius: '50%',
        data: tableData.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.name === '种类数' ? '#F4D03F' : '#82E0AA' // 根据名称设置颜色
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
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

    // 修改 corpusStatusOption 配置
    const corpusStatusOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      color: ['#409EFF', '#FF9900'], // 天蓝色和橙色
      series: [{
        name: '语料状态',
        type: 'pie',
        radius: '50%',
        data: corpusStatusData.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.name === '上线语料' ? '#409EFF' : '#FF9900' // 根据名称设置颜色
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
        }
      }]
    }));

    // 在 setup 函数中添加计算总数的逻辑
    const totalCorpus = computed(() => {
      return corpusStatusData.value.reduce((sum, item) => sum + item.value, 0);
    });

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      tableData,
      kindCorpusTableData,
      totalDataOption,
      kindCorpusOption,
      corpusStatusData,
      corpusStatusOption,
      totalCorpus
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

.status-section {
  position: relative;
  width: 100%;
  height: 100%;
}

.total-corpus {
  position: absolute;
  top: 40px;  /* 调整位置，在标题下方 */
  right: 20px;
  padding: 8px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.total-label {
  font-size: 14px;
  color: #606266;
  margin-right: 5px;
}

.total-value {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}
</style>