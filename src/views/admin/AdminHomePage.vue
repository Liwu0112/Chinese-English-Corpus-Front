<template>
  <div class="admin-home">
    <h1>管理员首页</h1>
    <!-- 这里可以添加管理员相关的功能模块和数据展示 -->
    <el-card class="box-card">
      <h2>用户管理</h2>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="role" label="角色"></el-table-column>
    </el-card>

    <el-card class="box-card">
      <h2>系统设置</h2>
      <!-- 可以添加系统设置相关的表单或操作按钮等 -->
      <el-button type="primary">修改系统配置</el-button>
    </el-card>
  </div>
</template>

<!--<script>-->
<!--import { ref, onMounted } from 'vue';-->
<!--import axios from 'axios';-->
<!--import { apiEndpoints } from '@/config/apiConfig.js';-->

<!--export default {-->
<!--  setup() {-->
<!--    const userList = ref([]);-->

<!--    onMounted(() => {-->
<!--      // 假设这里有一个获取用户列表的接口，用于在管理员首页展示用户信息-->
<!--      axios.get(apiEndpoints.getUserList)-->
<!--          .then((response) => {-->
<!--            userList.value = response.data;-->
<!--          })-->
<!--          .catch((error) => {-->
<!--            console.error('获取用户列表失败：', error);-->
<!--          });-->
<!--    });-->

<!--    return {-->
<!--      userList-->
<!--    };-->
<!--  }-->
<!--};-->
<!--</script>-->

<style scoped>
.admin-home {
  padding: 20px;
}

.box-card {
  margin-top: 20px;
}
</style>