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
        <div class="table-container">
          <div class="table-header">
            <div class="search-container">
              <el-input
                v-model="searchQuery"
                placeholder="请输入分类编号或分类名"
                class="search-input"
                clearable
                @clear="handleSearchClear"
              >
                <template #prefix>
                  <i class="el-icon-search"></i>
                </template>
              </el-input>
            </div>
            <el-button type="primary" class="action-button" @click="handleAdd">
              <i class="el-icon-plus"></i>
              新增分类
            </el-button>
          </div>
          <el-table :data="paginatedData" style="width: 80%; margin: 0 auto;" border>
            <el-table-column prop="typeId" label="分类编号" width="180" />
            <el-table-column prop="kindName" label="种类" width="180" />
            <el-table-column prop="typeName" label="分类" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button 
                  type="primary"
                  size="small" 
                  @click="handleEdit(scope.row)"
                >
                  修改
                </el-button>
                <el-button 
                  type="danger"
                  size="small" 
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 修改分页按钮的容器 -->
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
        
        <!-- 添加新增弹出框 -->
        <el-dialog
          v-model="addDialogVisible"
          title="新增分类"
          width="30%"
          :close-on-click-modal="false"
        >
          <el-form :model="addForm" label-width="80px">
            <el-form-item label="种类">
              <el-select v-model="addForm.kindName" placeholder="请选择种类">
                <el-option
                  v-for="item in kindOptions"
                  :key="item.kindId"
                  :label="item.kindName"
                  :value="item.kindName"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分类">
              <el-input v-model="addForm.typeName" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitAdd">确定</el-button>
            </span>
          </template>
        </el-dialog>
        
        <!-- 添加修改弹出框 -->
        <el-dialog
          v-model="editDialogVisible"
          title="修改分类信息"
          width="30%"
          :close-on-click-modal="false"
        >
          <el-form :model="editForm" label-width="80px">
            <el-form-item label="种类">
              <el-select v-model="editForm.kindName" placeholder="请选择种类">
                <el-option
                  v-for="item in kindOptions"
                  :key="item.kindId"
                  :label="item.kindName"
                  :value="item.kindName"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="分类">
              <el-input v-model="editForm.typeName" />
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="submitEdit">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </main>
  </div>
</template>

<script>
import {defineComponent, ref, onMounted, computed} from "vue";
import {useRouter} from "vue-router";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import apiEndpoints from "@/apiConfig";

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem("userName");
    const activeMenu = ref("AdminControllerKinds");

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
          ElMessage.error("份验证失败，请重新登录");
        } else {
          ElMessage.error("请求失败，请稍后重试");
        }
        router.push("/");
      });
    };

    const typeList = ref([]);

    const getAllTypes = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectalltypes);
        if (response.data.code === 200) {
          typeList.value = response.data.data;
        } else {
          ElMessage.error(response.data.msg || "获取分类数据失败");
        }
      } catch (error) {
        ElMessage.error("获取分类数据失败，请稍后重试");
        console.error(error);
      }
    };

    const editDialogVisible = ref(false);
    const editForm = ref({
      typeId: '',
      kindName: '',
      typeName: ''
    });

    const handleEdit = (row) => {
      editForm.value = { ...row };
      editDialogVisible.value = true;
    };

    const submitEdit = async () => {
      try {
        const response = await axios.post(apiEndpoints.updatetype, editForm.value);
        if (response.data.code === 200) {
          ElMessage.success('修改成功');
          editDialogVisible.value = false;
          getAllTypes(); // 刷新表格数据
        } else {
          ElMessage.error(response.data.msg || '修改失败');
        }
      } catch (error) {
        ElMessage.error('修改失败，请稍后重试');
        console.error(error);
      }
    };

    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除分类 "${row.typeName}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(async () => {
        try {
          const response = await axios.get(apiEndpoints.deletetype, {
            params: {
              typeId: row.typeId
            }
          });
          if (response.data.code === 200) {
            ElMessage.success('删除成功');
            getAllTypes(); // 刷新表格数据
          } else {
            ElMessage.error(response.data.msg || '删除失败');
          }
        } catch (error) {
          ElMessage.error('删除失败，请稍后重试');
          console.error(error);
        }
      }).catch(() => {
        // 用户点击取消，不做任操作
      });
    };

    const kindOptions = ref([]);

    // 获取所有选项
    const getAllKinds = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectallkind);
        if (response.data.code === 200) {
          kindOptions.value = response.data.data;
        } else {
          ElMessage.error(response.data.msg || "获取种类数据失败");
        }
      } catch (error) {
        ElMessage.error("获取种类数据失败，请稍后重试");
        console.error(error);
      }
    };

    // 在组件挂载时获取种类数据
    onMounted(() => {
      getAllTypes();
      getAllKinds(); // 添加获取种类数据
    });

    // 添加新的响应式变量
    const addDialogVisible = ref(false);
    const addForm = ref({
      kindName: '',
      typeName: ''
    });

    // 添加新增按钮处理函数
    const handleAdd = () => {
      addForm.value = {
        kindName: '',
        typeName: ''
      };
      addDialogVisible.value = true;
    };

    // 添加提交新增的处理函数
    const submitAdd = async () => {
      try {
        const response = await axios.post(apiEndpoints.inserttype, addForm.value);
        if (response.data.code === 200) {
          ElMessage.success('添加成功');
          addDialogVisible.value = false;
          getAllTypes(); // 刷新表格数据
        } else {
          ElMessage.error('当前分类已存在');
        }
      } catch (error) {
        ElMessage.error('添加失败，请稍后重试');
        console.error(error);
      }
    };

    // 修改分页相关的变量和计算属性
    const currentPage = ref(1);
    const pageSize = ref(15);
    const inputPage = ref(1);

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(typeList.value.length / pageSize.value);
    });

    // 计算当前页的数据
    const paginatedData = computed(() => {
      // 先进行搜索过滤
      const filteredData = typeList.value.filter(item => {
        if (!searchQuery.value) return true;
        const query = searchQuery.value.toLowerCase();
        return (
          item.typeId.toString().includes(query) ||
          item.kindName.toLowerCase().includes(query) ||
          item.typeName.toLowerCase().includes(query)
        );
      });
      
      // 然后进行分页
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredData.slice(start, end);
    });

    // 分页控制方法
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

    const searchQuery = ref('');

    // 添加清除搜索的处理函数
    const handleSearchClear = () => {
      searchQuery.value = '';
    };

    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      greeting,
      typeList,
      handleEdit,
      handleDelete,
      editDialogVisible,
      editForm,
      submitEdit,
      kindOptions,
      addDialogVisible,
      addForm,
      handleAdd,
      submitAdd,
      currentPage,
      pageSize,
      inputPage,
      totalPages,
      paginatedData,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      searchQuery,
      handleSearchClear,
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
  background-color: #409eff !important;
  color: white !important;
}

.custom-button:active {
  background-color: #409eff !important;
  color: white !important;
}

.table-container {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  background-color: transparent;
  box-shadow: none;
}

/* 加按钮间距 */
.el-button + .el-button {
  margin-left: 10px;
}

/* 操作按钮样式 */
.el-button--small {
  padding: 8px 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 弹窗表单样式 */
:deep(.el-form-item__label) {
  font-weight: bold;
}

:deep(.el-input__inner) {
  width: 100%;
}

/* 下拉选择框样式 */
:deep(.el-select) {
  width: 100%;
}

/* 添加新样式 */
.table-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  margin: 0 auto 20px auto;
}

.table-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 添加分页组件样式 */
:deep(.el-pagination) {
  padding: 0;
  margin: 0;
}

:deep(.el-pagination .el-select .el-input) {
  width: 100px;
}

/* 页按钮样式 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
  color: #fff;
}

:deep(.el-pagination.is-background .el-pager li) {
  background-color: #fff;
  color: #606266;
  min-width: 32px;
  border-radius: 2px;
  border: 1px solid #dcdfe6;
}

:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next) {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  padding: 0 4px;
}

:deep(.el-pagination .el-select .el-input .el-input__inner) {
  border-radius: 2px;
}

:deep(.el-pagination__jump .el-input__inner) {
  border-radius: 2px;
  text-align: center;
}

:deep(.el-pagination.is-background .btn-prev:disabled),
:deep(.el-pagination.is-background .btn-next:disabled) {
  background-color: #f5f7fa;
  color: #c0c4cc;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #409eff;
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

/* 添加新的按钮样式 */
.action-button {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-button i {
  margin-right: 5px;
}

/* 修改分页按钮样式，使其与主页面一致 */
.pagination-fixed .el-button {
  margin: 0 5px;
  padding: 8px 15px;
}

.pagination-fixed .el-input {
  margin: 0 5px;
}

.search-container {
  flex: 1;
  margin-right: 20px;
}

.search-input {
  width: 300px;
}
</style>