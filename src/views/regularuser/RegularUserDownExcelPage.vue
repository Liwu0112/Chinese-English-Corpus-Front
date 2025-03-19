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
        <el-menu-item index="RegularUserDownExcel">
          <i class="el-icon-shopping-cart"></i>
          <span>语料下载</span>
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
        <el-form :model="form" label-width="120px">
          <div class="form-title">请选择要下载的内容</div>
          <el-form-item>
            <div class="checkbox-container">
              <el-checkbox
                v-model="checkAll"
                @change="handleCheckAllChange"
                class="check-all"
              >全选</el-checkbox>
              <el-checkbox-group 
                v-model="form.selectedTypes"
                @change="handleCheckedChange"
                class="checkbox-group"
              >
                <el-checkbox 
                  v-for="type in types" 
                  :key="type.kindName" 
                  :label="type.kindName"
                  class="checkbox-item"
                >
                  {{ type.kindName }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="download-button-container">
              <el-button 
                type="primary" 
                :disabled="form.selectedTypes.length === 0"
                @click="handleDownload"
                :loading="downloading"
              >
                下载选中语料
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </main>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
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
    const types = ref([]); // 存储类型数据
    const checkAll = ref(false);
    const form = ref({
      selectedTypes: [] // 存储选中的类型名称
    });
    const downloading = ref(false);

    const activeMenu = ref('RegularUserDownExcel'); //

    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index,
        query: { username: userName},
      });
    };

    // 获取所有类型
    const fetchTypes = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectkindsname);
        if (response.data.code === 200) {
          types.value = response.data.data;
        } else {
          ElMessage.error("获取类型数据失败");
        }
      } catch (error) {
        ElMessage.error("请求失败，请稍后重试");
      }
    };

    onMounted(() => {
      fetchTypes();
    });

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

    // 处理全选
    const handleCheckAllChange = (val) => {
      form.value.selectedTypes = val ? types.value.map(type => type.kindName) : [];
    };

    // 处理选项变化
    const handleCheckedChange = (value) => {
      const checkedCount = value.length;
      checkAll.value = checkedCount === types.value.length;
    };

    // 处理下载
    const handleDownload = async () => {
      if (form.value.selectedTypes.length === 0) {
        ElMessage.warning('请至少选择一个语料类型');
        return;
      }

      downloading.value = true;
      try {
        const response = await axios({
          url: apiEndpoints.getcorpusexcel,
          method: 'POST',
          data: {
            kindNames: form.value.selectedTypes  // 将选中的类型名称数组传给后端
          },
          responseType: 'blob' // 设置响应类型为blob
        });

        // 检查响应状态
        if (response.status === 200) {
          // 创建下载链接
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', '语料数据.xlsx'); // 设置下载文件名
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          ElMessage.success('下载成功');
        } else {
          throw new Error('下载失败');
        }
      } catch (error) {
        ElMessage.error('下载失败，请稍后重试');
        console.error('下载错误：', error);
      } finally {
        downloading.value = false;
      }
    };

    return {
      userName,
      logout,
      searchText,
      displaySearchText,
      searchResult,
      handleMenuSelect,
      activeMenu,
      types,
      form,
      checkAll,
      handleCheckAllChange,
      handleCheckedChange,
      handleDownload,
      downloading,
    };
  },
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
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: 80vh;
}

.el-form {
  width: 90%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.checkbox-container {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  min-width: 800px;
  margin-bottom: 20px;
}

.check-all {
  margin-bottom: 20px;
  font-size: 18px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  width: 100%;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.checkbox-item {
  font-size: 18px;
  height: 50px;
  display: flex;
  align-items: center;
}

.el-checkbox__label {
  font-size: 18px !important;
}

.download-button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  width: 100%;
}

.el-button--primary {
  font-size: 18px;
  padding: 15px 40px;
  min-width: 200px;
}

.el-form-item {
  margin-bottom: 30px;
}

.el-form-item__label {
  font-size: 18px !important;
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

.form-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}
</style>