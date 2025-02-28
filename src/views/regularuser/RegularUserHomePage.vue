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
              <p>城市公共服务领域中英双语语料库专为公共服务领域设计，支持城市公共服务领域的语言研究、翻译实践及城市公共服务窗口的国际语言景观建设。</p>
              <p>本语料库依据《中华人民共和国国家标准−公共服务领域英文译写规范》建立，涵盖“交通、旅游、文化娱乐、体育、教育、医疗卫生”等多种公共服务场景，共计10大类94个分类，3500余条语料。数据来源包括政府网站、官方文件、公共标识和服务指南等，确保了语言的规范性与真实性。本语料库采用“词级对齐”、“短语级对齐”和“句子级对齐”等多种对齐方式，以保证数据的精准性和一致性。此外，该语料库还可广泛应用于机器辅助翻译教学、翻译实践与研究、对比语言学研究、公共服务语言优化及国际语言景观建设等领域，为翻译实践、政策制定及语言规范研究提供重要支持。</p>
              <p>本语料库采用开放访问模式，仅限非商业性学术研究和教育用途，以促进公共服务领域的语言规范化和国际化发展。</p>
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
        return "下午好";
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
      // 第一个饼图配置
      const statsChart = echarts.init(document.getElementById('statsChart'));
      const statsOption = {
        title: {
          text: '类别数据图',
          left: '40%',  // 调整为与饼图中心对齐
          top: '5%',    // 调整到顶部位置
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}个 ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: '5%',
          top: 'middle',
          textStyle: {
            fontSize: 14
          }
        },
        series: [{
          type: 'pie',
          radius: ['35%', '70%'],
          center: ['40%', '55%'],
          data: [
            {
              name: '种类数',
              value: tableData.value.find(item => item.name === '种类数')?.value || 0
            },
            {
              name: '分类数',
              value: tableData.value.find(item => item.name === '分类数')?.value || 0
            }
          ],
          label: {
            show: true,
            formatter: '{b}: {c}个',
            position: 'outside'
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
      statsChart.setOption(statsOption);

      // 第二个饼图配置
      const kindChart = echarts.init(document.getElementById('kindChart'));
      const totalCorpus = kindCorpusTableData.value.reduce((sum, item) => sum + item.corpusCount, 0);
      
      const kindOption = {
        title: [{
          text: '语料数据图',
          left: '40%',  // 调整为与饼图中心对齐
          top: '5%',    // 调整到顶部位置
          textStyle: {
            fontSize: 16,
            fontWeight: 'bold'
          }
        }, {
          text: '语料总数',
          subtext: totalCorpus + '条',
          left: '40%',
          top: '50%',
          textAlign: 'center',
          textStyle: {
            fontSize: 14,
            color: '#666'
          },
          subtextStyle: {
            fontSize: 20,
            color: '#333',
            fontWeight: 'bold'
          }
        }],
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