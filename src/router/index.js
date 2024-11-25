import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/views/common/LoginPage.vue";
import RegularUserHomePage from "@/views/regularuser/RegularUserHomePage.vue";
import AdminHomePage from "@/views/admin/AdminHomePage.vue";
import RegularUserEnroll from "@/views/regularuser/RegularUserEnroll.vue";

const routes = [
  // 登录页面
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  // 普通用户注册
  {
    path: '/regularenroll',
    name: 'RegularEnroll',
    component: RegularUserEnroll,
  },
  // 普通用户首页
  {
    path: '/user_home',
    name: 'UserHome',
    component: RegularUserHomePage,
  },
  // 管理员首页
  {
    path: '/admin_home',
    name: 'AdminHome',
    component: AdminHomePage,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;