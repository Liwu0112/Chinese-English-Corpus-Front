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
      <el-table :data="paginatedUserList" style="width: 80%; margin: 0 auto;" border stripe>
        <el-table-column prop="userId" label="账户编号" width="180" />
        <el-table-column prop="userName" label="账户" width="180" />
        <el-table-column prop="registrationDate" label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.registrationDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="userType" label="用户类型">
          <template #default="scope">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleChangeRole(scope.row)"
            >
              {{ scope.row.role === 'admin' ? '取消管理员' : '设为管理员' }}
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleResetPassword(scope.row)"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDeleteUser(scope.row)"
            >
              删除用户
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改分页组件 -->
      <div class="pagination-fixed">
        <div style="text-align: center; margin-top: 20px;">
          <span>共 {{ totalPages }} 页</span>

          <!-- 上一页按钮 -->
          <el-button
            type="primary"
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
            style="margin-left: 10px;"
          >
            上一页
          </el-button>

          <!-- 页码输入框 -->
          <el-input
            v-model="inputPage"
            type="number"
            placeholder="输入页码"
            style="width: 100px; display: inline-block; margin-left: 10px; margin-right: 10px;"
            :min="1"
            :max="totalPages"
          />

          <!-- 下一页按钮 -->
          <el-button
            type="primary"
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
          >
            下一页
          </el-button>

          <!-- 确认按钮 -->
          <el-button
            type="primary"
            @click="goToPage"
            :disabled="inputPage < 1 || inputPage > totalPages"
          >
            确认
          </el-button>
        </div>
      </div>
    </main>
  </div>

  <!-- 添加确认对话框 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="30%"
  >
    <span>{{ dialogMessage }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDialog">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");
    const activeMenu = ref("AdminConUsers");
    const userList = ref([]);
    const dialogVisible = ref(false);
    const dialogTitle = ref('');
    const dialogMessage = ref('');
    const currentOperation = ref(null);
    const currentUser = ref(null);
    const currentPage = ref(1);
    const pageSize = ref(20);
    const inputPage = ref(1);

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

    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const fetchUserList = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectallreuserinfo);
        if (response.data.code === 200) {
          userList.value = response.data.data;
          totalPages.value = Math.ceil(userList.value.length / pageSize.value);
        } else {
          ElMessage.error(response.data.msg || '获取用户列表失败');
        }
      } catch (error) {
        ElMessage.error('获取用户列表失败，请稍后重试');
        console.error('获取用户列表错误:', error);
      }
    };

    const handleChangeRole = (user) => {
      dialogTitle.value = user.role === 'admin' ? '取消管理员权限' : '设置管理员权限';
      dialogMessage.value = `确定要${user.role === 'admin' ? '取消' : '设置'}用户 ${user.userName} 的管理员权限吗？`;
      currentOperation.value = 'changeRole';
      currentUser.value = user;
      dialogVisible.value = true;
    };

    const handleResetPassword = (user) => {
      dialogTitle.value = '重置密码';
      dialogMessage.value = `确定要重置用户 ${user.userName} 的密码吗？`;
      currentOperation.value = 'resetPassword';
      currentUser.value = user;
      dialogVisible.value = true;
    };

    const handleDeleteUser = (user) => {
      dialogTitle.value = '删除用户';
      dialogMessage.value = `确定要删除用户 ${user.userName} 吗？此操作不可恢复！`;
      currentOperation.value = 'deleteUser';
      currentUser.value = user;
      dialogVisible.value = true;
    };

    const confirmDialog = async () => {
      try {
        let response;
        switch (currentOperation.value) {
          case 'changeRole':
            response = await axios.post(apiEndpoints.updateuserrole, {
              userId: currentUser.value.userId,
              role: currentUser.value.role === 'admin' ? 'regular_user' : 'admin'
            });
            break;
          case 'resetPassword':
            response = await axios.post(apiEndpoints.resetpassword, {
              userId: currentUser.value.userId
            });
            break;
          case 'deleteUser':
            response = await axios.post(apiEndpoints.deleteuser, {
              userId: currentUser.value.userId
            });
            break;
        }

        if (response.data.code === 200) {
          ElMessage.success(response.data.msg || '操作成功');
          fetchUserList(); // 新用户列表
        } else {
          ElMessage.error(response.data.msg || '操作失败');
        }
      } catch (error) {
        ElMessage.error('操作失败，请稍后重试');
        console.error('操作错误:', error);
      } finally {
        dialogVisible.value = false;
      }
    };

    const handleSizeChange = (val) => {
      pageSize.value = val;
      currentPage.value = 1;
    };

    const handleCurrentChange = (val) => {
      currentPage.value = val;
    };

    const paginatedUserList = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return userList.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(userList.value.length / pageSize.value);
    });

    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
        inputPage.value = currentPage.value;
      }
    };

    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
        inputPage.value = currentPage.value;
      }
    };

    const goToPage = () => {
      if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
        currentPage.value = Number(inputPage.value);
      } else {
        ElMessage.error('请输入有效的页码');
      }
    };

    onMounted(() => {
      fetchUserList();
    });

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      userList,
      formatDate,
      dialogVisible,
      dialogTitle,
      dialogMessage,
      handleChangeRole,
      handleResetPassword,
      handleDeleteUser,
      confirmDialog,
      currentPage,
      pageSize,
      paginatedUserList,
      handleSizeChange,
      handleCurrentChange,
      totalPages,
      inputPage,
      goToPreviousPage,
      goToNextPage,
      goToPage,
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
  padding-bottom: 80px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-button {
  margin-left: 8px;
}

.pagination-fixed {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  background-color: transparent;
  padding: 15px 0;
  text-align: center;
  z-index: 1000;
  box-shadow: none;
}

.pagination-fixed .el-button {
  margin: 0 5px;
  padding: 8px 15px;
}

.pagination-fixed .el-input {
  margin: 0 5px;
}

.el-table {
  width: 80% !important;
  margin: 0 auto;
}
</style>