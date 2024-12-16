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
        <div class="user-info">
          <span>欢迎您，{{userName}}</span>
          <el-button type="text" class="custom-button" size="mini" @click="logout">点击退出</el-button>
        </div>
      </div>
      <div class="page-content">
        <div class="greeting-container">
          <p class="greeting-text">{{greeting}}, {{userName}}! 欢迎使用中英文语料库！</p>
        </div>
        <div class="forms-container">
          <div class="form-content">
            <div>
              <h2 class="intro-title">中英文语料库简介</h2>
              <p>中英文语料库是一个精心构建的语言素材宝库，其中收纳了海量的中文与英文文本数据。其来源广泛，涉及经典文学著作、前沿学术期刊、权威新闻媒体、流行文化作品以及各类专业领域的文档资料等。</p>
              <p>这些丰富多样的文本被系统地整理和分类，以方便使用者根据不同的需求进行精准检索和高效利用。对于语言学习者而言，语料库提供了真实、自然且具有情境化的语言学习环境，帮助他们熟悉不同场景下的词汇运用、语法结构以及语言风格，从而提升听说读写的综合能力。语言研究者能够借助语料库进行深入的对比分析，探究中英两种语言在词法、句法、语义等层面的异同，揭示语言背后的文化内涵和认知规律，为语言学理论的发展提供有力支撑。</p>
              <p>在翻译领域，译员们可以参考语料库中的平行文本，获取精准恰当的翻译对等词和表达方式，确保译文质量，增强译文的可读性和流畅性，满足不同领域的翻译需求。同时，中英文语料库也为自然语言处理技术的研发提供了关键的基础数据，助力机器翻译系统、智能语音助手、文本挖掘工具等不断优化升级，推动语言技术向更高水平迈进，进一步促进跨语言的交流与合作，拓展人类知识的边界。</p>
            </div>
            <div class="charts-container">
              <div id="statsChart" style="width: 40%; height: 350px;"></div>
              <div id="kindChart" style="width: 40%; height: 350px;"></div>
            </div>
          </div>
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
import * as echarts from 'echarts';

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

                        // 建表格数据
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
      // 先调用selectkindsname接口获取类名称数据
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

    const initCharts = () => {
      // 初始化总数统计图表
      const statsChart = echarts.init(document.getElementById('statsChart'));
      const statsOption = {
        title: {
          text: '当前语料库中各数据总数',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: '20%',
          bottom: '12%'
        },
        xAxis: {
          type: 'category',
          data: tableData.value.map(item => item.name),
          axisLabel: {
            interval: 0,
            fontSize: 14
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: tableData.value.map(item => item.value),
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: '#409EFF'
          }
        }]
      };
      statsChart.setOption(statsOption);

      // 初始化种类分布图表
      const kindChart = echarts.init(document.getElementById('kindChart'));
      const kindOption = {
        title: {
          text: '各种类对应语料总数',
          left: 'center',
          top: 20,
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'middle',
          textStyle: {
            fontSize: 14
          },
          formatter: function(name) {
            const item = kindCorpusTableData.value.find(item => item.kindName === name);
            return `${name}: ${item ? item.corpusCount : 0}`;
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['40%', '55%'],
          data: kindCorpusTableData.value.map(item => ({
            name: item.kindName,
            value: item.corpusCount
          })),
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      kindChart.setOption(kindOption);
    };

    // 在页面挂载完成后调用接口获取数据函数
    onMounted(() => {
      getCorpusData();
      getKindCorpusData();
      // 添加一个小延时确保数据加载完成
      setTimeout(() => {
        initCharts();
      }, 500);
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
}

.forms-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  align-items: flex-start;
}

.form-content {
  width: 90%;
  height: auto;
  min-height: 450px;
  border-radius: 4px;
}

.greeting-container {
  text-align: center;
  margin-bottom: 0;
  padding: 20px 0;
}

.intro-title {
  margin-bottom: 15px;
  text-align: center;
  margin-top: 0;
  font-size: 24px;
  color: #333;
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

.intro-text {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.intro-text p {
  margin: 10px 0;
  line-height: 1.6;
  text-align: justify;
  color: #333;
  font-size: 16px;
  padding: 0 15px;
}

.charts-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 20px 15px;
  align-items: center;
}

@media screen and (max-width: 1200px) {
  .charts-container {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
  
  #statsChart,
  #kindChart {
    width: 70% !important;
  }
}

.greeting-text {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  padding: 10px 0;
}
</style>