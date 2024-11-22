<template>
  <div class="user-home">
    <h1>用户首页</h1>
  </div>
</template>

<!--<script>-->
<!--import { ref, onMounted } from 'vue';-->
<!--import axios from 'axios';-->
<!--import { apiEndpoints } from '@/config/apiConfig.js';-->

<!--export default {-->
<!--  setup() {-->
<!--    const userInfo = ref({});-->
<!--    const orderList = ref([]);-->

<!--    onMounted(() => {-->
<!--      // 假设这里有获取用户个人信息和订单列表的接口，用于在用户首页展示相关信息-->
<!--      axios.get(apiEndpoints.getUserInfo)-->
<!--          .then((response) => {-->
<!--            userInfo.value = response.data;-->
<!--          })-->
<!--          .catch((error) => {-->
<!--            console.error('获取用户个人信息失败：', error);-->
<!--          });-->

<!--      axios.get(apiEndpoints.getOrderList)-->
<!--          .then((response) => {-->
<!--            orderList.value = response.data;-->
<!--          })-->
<!--          .catch((error) => {-->
<!--            console.error('获取订单列表失败：', error);-->
<!--          });-->
<!--    });-->

<!--    return {-->
<!--      userInfo,-->
<!--      orderList-->
<!--    };-->
<!--  }-->
<!--};-->
<!--</script>-->

<style scoped>
.user-home {
  padding: 20px;
}

.box-card {
  margin-top: 20px;
}
</style>