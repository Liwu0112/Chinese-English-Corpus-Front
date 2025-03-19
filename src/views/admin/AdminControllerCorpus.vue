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
        </el-menu-item>
        <el-menu-item index="AdminPersonalCenter">
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
        <div class="button-group">
          <div class="left-buttons">
            <el-button type="primary" class="action-button" @click="openAddDialog">
              <i class="el-icon-plus"></i>
              新增语料
            </el-button>
            <el-button type="success" class="action-button" @click="openBatchAddDialog">
              <i class="el-icon-upload"></i>
              批量新增
            </el-button>
          </div>
          <el-input
            v-model="searchKeyword"
            placeholder="请输入编号/中文/英文内容"
            class="search-input"
            clearable
            @clear="handleSearchClear"
            @input="handleSearch">
            <template #prefix>
              <i class="el-icon-search"></i>
            </template>
          </el-input>
        </div>

        <div class="forms-container">
          <el-table :data="filteredCorpusData" style="width: 100%" border>
            <el-table-column label="编号" prop="corpusId" width="80"></el-table-column>
            <el-table-column label="中文" prop="chineseText" min-width="250"></el-table-column>
            <el-table-column label="英文" prop="englishText" min-width="250"></el-table-column>
            <el-table-column label="种类" prop="kindName" width="100"></el-table-column>
            <el-table-column label="分类" prop="typeName" width="100"></el-table-column>
            <el-table-column label="状态" prop="corpusStatus" width="80">
              <template #default="{ row }">
                <span>{{ row.corpusStatus === '1' ? '上线' : '下线' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建者" prop="creator" width="100"></el-table-column>
            <el-table-column label="创建时间" prop="creationTime">
              <template #default="{ row }">
                <span>{{ new Date(row.creationTime).toLocaleString() }}</span>
              </template>
            </el-table-column>

            <!-- 新增操作列 -->
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="editCorpus(row)"
                  style="margin-right: 10px;">
                  修改
                </el-button>
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="deleteCorpus(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 修改对话框 -->
          <el-dialog
              v-model="editDialogVisible"
              title="修改语料"
              width="50%"
              :before-close="handleClose">
            <el-form :model="editForm" ref="editFormRef" label-width="100px">
              <el-form-item label="中文文本" prop="chineseText">
                <el-input v-model="editForm.chineseText" type="textarea" :rows="3"></el-input>
              </el-form-item>
              <el-form-item label="英文文本" prop="englishText">
                <el-input v-model="editForm.englishText" type="textarea" :rows="3"></el-input>
              </el-form-item>
              <el-form-item label="种类" prop="kindName">
                <el-select
                    v-model="editForm.kindName"
                    placeholder="请选择种类"
                    @change="handleKindChange">
                  <el-option
                      v-for="item in kindOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="分类" prop="typeName">
                <el-select
                    v-model="editForm.typeName"
                    placeholder="请选择分类"
                    :disabled="!editForm.kindName">
                  <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="状态" prop="corpusStatus">
                <el-select v-model="editForm.corpusStatus" placeholder="请选择状态">
                  <el-option label="上线" value="1"></el-option>
                  <el-option label="下线" value="0"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
    <span class="dialog-footer">
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitEdit">确认</el-button>
    </span>
            </template>
          </el-dialog>

          <!-- 新增 对话框 -->
          <el-dialog
              v-model="addDialogVisible"
              title="新增语料"
              width="50%"
              :before-close="() => { addDialogVisible = false; }">
            <el-form 
                :model="addForm" 
                ref="addFormRef" 
                label-width="100px"
                :rules="formRules">
              <el-form-item 
                  label="中文文本" 
                  prop="chineseText"
                  :rules="[
                      { required: true, message: '请输入中文文本', trigger: 'blur' },
                      { min: 1, message: '文本不能为空', trigger: 'blur' }
                  ]">
                <el-input v-model="addForm.chineseText" type="textarea" :rows="3"></el-input>
              </el-form-item>
              <el-form-item 
                  label="英文文本" 
                  prop="englishText"
                  :rules="[
                      { required: true, message: '请输入英文文本', trigger: 'blur' },
                      { min: 1, message: '文本不能为空', trigger: 'blur' }
                  ]">
                <el-input v-model="addForm.englishText" type="textarea" :rows="3"></el-input>
              </el-form-item>
              <el-form-item 
                  label="种类" 
                  prop="kindName"
                  :rules="[
                      { required: true, message: '请选择种类', trigger: 'change' }
                  ]">
                <el-select
                    v-model="addForm.kindName"
                    placeholder="请选择种类"
                    @change="handleKindChange">
                  <el-option
                      v-for="item in kindOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item 
                  label="分类" 
                  prop="typeName"
                  :rules="[
                      { required: true, message: '请选择分类', trigger: 'change' }
                  ]">
                <el-select
                    v-model="addForm.typeName"
                    placeholder="请选择分类"
                    :disabled="!addForm.kindName">
                  <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item 
                  label="状态" 
                  prop="corpusStatus"
                  :rules="[
                      { required: true, message: '请选择状态', trigger: 'change' }
                  ]">
                <el-select v-model="addForm.corpusStatus" placeholder="请选择状态">
                  <el-option label="上线" value="1"></el-option>
                  <el-option label="下线" value="0"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
      <span class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd">确认</el-button>
      </span>
            </template>
          </el-dialog>


<!--          批量新增-->
          <el-dialog
          v-model="batchAddDialogVisible"
    title="批量新增语料"
    width="50%"
    :before-close="handleBatchAddClose">
  <!-- 添加模板下载按钮 -->
  <div class="template-download">
    <el-button type="primary" @click="downloadTemplateFile">
      <i class="el-icon-download"></i>
      下载Excel模板
    </el-button>
    <span class="template-tip">请按照模板格式填写数据后上传</span>
  </div>

  <div class="upload-area">
    <el-upload
        ref="uploadRef"
        class="upload-drop"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击选择文件</em>
      </div>
              </el-upload>
            </div>

    <!-- 添加进度条组件 -->
    <div v-if="uploadProgress.show" class="progress-container">
        <el-progress 
            :percentage="uploadProgress.percentage"
            :status="uploadProgress.status"
            :stroke-width="15">
        </el-progress>
        <div class="progress-text">{{ uploadProgress.text }}</div>
    </div>

    <template #footer>
    <span class="dialog-footer">
      <el-button @click="batchAddDialogVisible = false" :disabled="uploadProgress.uploading">取消</el-button>
      <el-button type="primary" @click="submitBatchAdd" :loading="uploadProgress.uploading">确认</el-button>
    </span>
            </template>
          </el-dialog>


          <!-- 分页控制部分 -->
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
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import {defineComponent, ref, onMounted, computed} from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
import {ElMessage, ElMessageBox} from 'element-plus';
import apiEndpoints from '@/apiConfig';

export default defineComponent({
  setup() {
    const router = useRouter();
    const userName = sessionStorage.getItem('userName');
    const activeMenu = ref('AdminControllerCorpus');
    const corpusData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(10); // 每页显示10条
    const inputPage = ref(1); // 页码输入框的值

    // 获取语料数据
    const fetchCorpusData = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectallcors);
        if (response.data.code === 200) {
          corpusData.value = response.data.data;
        } else {
          ElMessage.error('获取数据失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，请稍后重试');
      }
    };

    // 菜单项选择
    const handleMenuSelect = (index) => {
      activeMenu.value = index;
      router.push({
        name: index,
        query: { username: userName},
      });
    };
    // 退出登录
    const logout = () => {
      axios.post(apiEndpoints.logout).then((response) => {
        if (response.data.code === 200) {
          ElMessage.success('退出成功');
          router.push('/');
        } else {
          ElMessage.error('登录状态异常，请重新登录');
          router.push('/');
        }
      }).catch((error) => {
        if (error.response && error.response.status === 401) {
          ElMessage.error('身份验证失败，请重新登录');
        } else {
          ElMessage.error('请求失败，请稍后重试');
        }
        router.push('/');
      });
    };

    // 跳到上一页
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 1;
        inputPage.value = currentPage.value;
      }
    };

    // 跳转到下一页
    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value += 1;
        inputPage.value = currentPage.value;
      }
    };

    // 跳转到指定页码
    const goToPage = () => {
      if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
        currentPage.value = inputPage.value;
      } else {
        ElMessage.error('请输入有效的页码');
      }
    };

    // 删除语料
    const deleteCorpus = (row) => {
      ElMessageBox.confirm(
          '确定要删除该语吗?',
          '删除提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      )
          .then(async () => {
            try {
              // 添加日志来调试
              console.log('正在删除语料，ID:', row.corpusId);
              console.log('删除API地址:', apiEndpoints.deleteCorpus);

              // 确保使用完整的URL和正确的请求参数
              const response = await axios.get(apiEndpoints.deleteCorpus, {
                params: {
                  corpusId: row.corpusId
                }
              });

              console.log('删除响应:', response); // 调试日志

              if (response.data.code === 200) {
                ElMessage.success('删除成功');
                await fetchCorpusData(); // 删除后重新加载数据
              } else {
                ElMessage.error(response.data.msg || '删除失败');
              }
            } catch (error) {
              console.error('删除请求失败:', error);
              ElMessage.error('删除失败，请稍后重试');
            }
          })
          .catch(() => {
            ElMessage.info('已取消删除');
          });
    };

    const editDialogVisible = ref(false);
    const editForm = ref({
      corpusId: '',
      chineseText: '',
      englishText: '',
      kindName: '',
      typeName: '',
      corpusStatus: ''
    });
  // 定义选项数据
    const kindOptions = ref([]);
    const typeOptions = ref([]);

  // 获取所有种类
    const fetchKindOptions = async () => {
      try {
        const response = await axios.get(apiEndpoints.selectallkind);
        if (response.data.code === 200) {
          // 假设返回的数据格式为 [{kindId: '1', kindName: '文学'}, ...]
          kindOptions.value = response.data.data.map(item => ({
            value: item.kindName,
            label: item.kindName
          }));
        } else {
          ElMessage.error('获取种类数据失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，请稍后重试');
      }
    };

    // 根据选择的种类获取分类
    const fetchTypeOptions = async (kindName) => {
      if (!kindName) {
        typeOptions.value = [];
        return;
      }

      try {
        const response = await axios.get(`${apiEndpoints.selectalltype}?kindName=${kindName}`);
        if (response.data.code === 200) {
          // 假设返回的数据格式为 [{typeId: '1', typeName: '小说'}, ...]
          typeOptions.value = response.data.data.map(item => ({
            value: item.typeName,
            label: item.typeName
          }));
        } else {
          ElMessage.error('获取分类数据失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，请稍后重试');
      }
    };

  // 监听种类选择变化
    const handleKindChange = (value) => {
      editForm.value.typeName = ''; // 清空已选择的分类
      fetchTypeOptions(value); // 获取新的分类列表
    };
    const originalFormData = ref({});

    const editCorpus = async (row) => {
      editDialogVisible.value = true;
      // 先获取所有种类
      await fetchKindOptions();

      // 保存原始数据
      originalFormData.value = {
        corpusId: row.corpusId,
        chineseText: row.chineseText,
        englishText: row.englishText,
        kindName: row.kindName,
        typeName: row.typeName,
        corpusStatus: row.corpusStatus
      };

      // 设置表单数据
      editForm.value = {...originalFormData.value};

      // 根据当前种类取分类列表
      await fetchTypeOptions(row.kindName);
    };

    // 处理对话框关闭
    const handleClose = () => {
      editDialogVisible.value = false;
    };
    // 提交编辑
    const submitEdit = async () => {
      // 检查数据是否发生变化
      const isDataUnchanged =
          editForm.value.chineseText === originalFormData.value.chineseText &&
          editForm.value.englishText === originalFormData.value.englishText &&
          editForm.value.kindName === originalFormData.value.kindName &&
          editForm.value.typeName === originalFormData.value.typeName &&
          editForm.value.corpusStatus === originalFormData.value.corpusStatus;

      if (isDataUnchanged) {
        ElMessage.warning('数据未发生修改');
        return;
      }

      try {
        const response = await axios.post(apiEndpoints.updatecorpus, editForm.value);
        if (response.data.code === 200) {
          ElMessage.success('修改成功');
          editDialogVisible.value = false;
          fetchCorpusData(); // 刷新数据
        } else {
          ElMessage.error('修改失败');
        }
      } catch (error) {
        ElMessage.error('修改失败，请稍后重试');
      }
    };


    //单个新增
    const addDialogVisible = ref(false);
    const addForm = ref({
      chineseText: '',
      englishText: '',
      kindName: '',
      typeName: '',
      corpusStatus: '',
      creator: userName
    });

    const openAddDialog = () => {
      addDialogVisible.value = true;
      fetchKindOptions(); // 获取种类选项
    };

    const addFormRef = ref(null);

    const submitAdd = async () => {
      if (!addFormRef.value) return;
      
      try {
        await addFormRef.value.validate();
        
        const response = await axios.post(apiEndpoints.insertonecorpus, addForm.value);
        if (response.data.code === 200) {
          ElMessage.success('新增成功');
          addDialogVisible.value = false;
          fetchCorpusData(); // 刷新数据
          // 重置表单
          addFormRef.value.resetFields();
        } else {
          ElMessage.error('新增失败，当前语料在据库中已经存在，语料id为：' + response.data.data);
        }
      } catch (error) {
        if (error.message) {
          ElMessage.error('请写完整所有必填项');
        } else {
          ElMessage.error('新增失败，请稍后重试');
        }
      }
    };


    //批量新增
    const batchAddDialogVisible = ref(false);
    const uploadRef = ref(null);
    const uploadFile = ref(null);

    const openBatchAddDialog = () => {
      batchAddDialogVisible.value = true;
      // 重置上传文件
      uploadFile.value = null;
      if (uploadRef.value) {
        uploadRef.value.clearFiles();
      }
    };
    const handleBatchAddClose = () => {
        if (uploadProgress.value.uploading) {
            ElMessage.warning('正在上传中，请稍候...');
            return;
        }
        batchAddDialogVisible.value = false;
        uploadFile.value = null;
        if (uploadRef.value) {
            uploadRef.value.clearFiles();
        }
        uploadProgress.value.show = false;
    };
    const handleFileChange = (file) => {
      uploadFile.value = file.raw;
    };
    const uploadProgress = ref({
        show: false,
        percentage: 0,
        status: '',
        text: '',
        uploading: false
    });

    const submitBatchAdd = async () => {
        if (!uploadFile.value) {
            ElMessage.warning('请选择要上传的文件');
            return;
        }

        uploadProgress.value = {
            show: true,
            percentage: 0,
            status: '',
            text: '正在上传文件...',
            uploading: true
        };

        const formData = new FormData();
        formData.append('file', uploadFile.value);

        try {
            const response = await axios.post(apiEndpoints.insertmorecorpus, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    uploadProgress.value.percentage = percentage;
                    uploadProgress.value.text = `正在上传... ${percentage}%`;
                }
            });

            if (response.data.code === 200) {
                uploadProgress.value.percentage = 100;
                uploadProgress.value.status = 'success';
                uploadProgress.value.text = '上传成功！';
                
                setTimeout(() => {
                    ElMessage.success('批量导入成功');
                    batchAddDialogVisible.value = false;
                    uploadFile.value = null;
                    if (uploadRef.value) {
                        uploadRef.value.clearFiles();
                    }
                    uploadProgress.value.show = false;
                    uploadProgress.value.uploading = false;
                    fetchCorpusData();
                }, 1000);
            } else {
                uploadProgress.value.status = 'exception';
                uploadProgress.value.text = '上传失败：' + (response.data.msg || '未知错误');
                ElMessage.error(response.data.msg || '批量导入失败');
            }
        } catch (error) {
            console.error('上传失败:', error);
            uploadProgress.value.status = 'exception';
            uploadProgress.value.text = '上传失败，请稍后重试';
            ElMessage.error('批量导入失败，请稍后重试');
        } finally {
            uploadProgress.value.uploading = false;
        }
    };

    //模板下载
    const downloadTemplateFile = async () => {
  try {
    const response = await axios.get(apiEndpoints.downloadTemplate, {
      responseType: 'blob' // 确保接收的是二进制数据
    });

    // 创建一个URL对象
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '语料导入模板.xlsx'); // 设置下载文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    ElMessage.error('下载模板失败，请稍后重试');
  }
};
    // 初始化数据
    onMounted(() => {
      fetchCorpusData();
    });

    // 添加搜索相关的响应式变量
    const searchKeyword = ref('');
    
    // 首先定义过滤后的数据
    const filteredCorpusData = computed(() => {
      if (!searchKeyword.value) {
        return pagedCorpusData.value;  // 返回分页后的数据
      }
      
      const keyword = searchKeyword.value.toLowerCase().trim();
      const filtered = corpusData.value.filter(item => {
        return (
          item.corpusId.toString().includes(keyword) ||
          item.chineseText.toLowerCase().includes(keyword) ||
          item.englishText.toLowerCase().includes(keyword)
        );
      });

      // 对过滤后的数据进行分页
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filtered.slice(start, end);
    });
    
    // 然后定义分页数据
    const pagedCorpusData = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return corpusData.value.slice(start, end);
    });
    
    // 最后定义总页数
    const totalPages = computed(() => {
      const totalItems = searchKeyword.value
        ? corpusData.value.filter(item => {
            const keyword = searchKeyword.value.toLowerCase().trim();
            return (
              item.corpusId.toString().includes(keyword) ||
              item.chineseText.toLowerCase().includes(keyword) ||
              item.englishText.toLowerCase().includes(keyword)
            );
          }).length
        : corpusData.value.length;
      return Math.ceil(totalItems / pageSize.value);
    });
    
    // 处理搜索输入
    const handleSearch = () => {
      currentPage.value = 1; // 重置页码到第一页
    };
    
    // 处理清除搜索
    const handleSearchClear = () => {
      searchKeyword.value = '';
      currentPage.value = 1;
    };
    
    return {
      userName,
      logout,
      handleMenuSelect,
      activeMenu,
      corpusData,
      pagedCorpusData,
      currentPage,
      pageSize,
      inputPage,
      totalPages,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      editCorpus,
      deleteCorpus,
      handleClose,
      submitEdit,
      editDialogVisible,
      editForm,
      kindOptions,
      typeOptions,
      handleKindChange,
      originalFormData,
      addDialogVisible,
      addForm,
      openAddDialog,
      submitAdd,
      batchAddDialogVisible,
      openBatchAddDialog,
      handleFileChange,
      submitBatchAdd,
      downloadTemplateFile,
      uploadRef,
      handleBatchAddClose,
      uploadProgress,
      addFormRef,
      searchKeyword,
      filteredCorpusData,
      handleSearch,
      handleSearchClear,
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
  padding-bottom: 80px; /* 增加底部内边距 */
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
  /* 删除白色背景 */
  /* background-color: white; */
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.forms-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.greeting-container {
  text-align: center;
}

h3 {
  margin-bottom: 15px;
  text-align: center;
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

/* 样式：为每列添加竖线 */
.el-table th, .el-table td {
  border-right: 1px solid #dcdfe6;
}

.el-table th:last-child, .el-table td:last-child {
  border-right: none;
}

.upload-area {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.upload-drop {
  width: 100%;
}

.template-download {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.template-tip {
  color: #666;
  font-size: 14px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 20px;
}

.left-buttons {
  display: flex;
  gap: 15px;
}

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

/* 添加新的样式 */
.progress-container {
    margin-top: 20px;
    padding: 0 20px;
}

.progress-text {
    text-align: center;
    margin-top: 10px;
    color: #606266;
}

.search-input {
  width: 600px; /* 将搜索框从400px加长到600px */
  margin: 0 auto; /* 保持水平居中 */
}

/* 添加新的固定分页样式 */
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

/* 修改分页按钮样式，使其与主页面一致 */
.pagination-fixed .el-button {
  margin: 0 5px;
  padding: 8px 15px;
}

.pagination-fixed .el-input {
  margin: 0 5px;
}
</style>
