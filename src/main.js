import {createApp} from 'vue';
import App from './App.vue';
import router from './router/index';
import store from './store';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import axios from 'axios'; // 引入 Axios

// 创建 Axios 实例并设置全局配置
axios.defaults.withCredentials = true; // 启用跨域 Cookie
// 创建 Vue 应用实例
const app = createApp(App);

// 挂载插件和路由
app.use(ElementPlus).use(store).use(router).mount('#app');

