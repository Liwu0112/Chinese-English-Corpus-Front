import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/views/common/LoginPage.vue";
import RegularUserHomePage from "@/views/regularuser/RegularUserHomePage.vue";
import AdminHomePage from "@/views/admin/AdminHomePage.vue";
import RegularUserEnrollPage from "@/views/regularuser/RegularUserEnrollPage.vue";
import RegularUserSelectByCorpusPage from "@/views/regularuser/RegularUserSelectByCorpusPage.vue";
import RegularUserSelectByTypePage from "@/views/regularuser/RegularUserSelectByTypePage.vue";
import RegularUserPersonalCenterPage from "@/views/regularuser/RegularUserPersonalCenterPage.vue";
import {ElMessage} from "element-plus";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/regular_enroll',
    name: 'RegularEnroll',
    component: RegularUserEnrollPage,
  },
  {
    path: '/regular_user_home',
    name: 'RegularUserHome',
    component: RegularUserHomePage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
  {
    path: '/regular_user_corpus',
    name: 'RegularUserSelectByCorpus',
    component: RegularUserSelectByCorpusPage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
  {
    path: '/regular_user_type',
    name: 'RegularUserSelectByType',
    component: RegularUserSelectByTypePage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
  {
    path: '/regular_user_personal_center',
    name: 'RegularUserPersonalCenter',
    component: RegularUserPersonalCenterPage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
  {
    path: '/admin_home',
    name: 'AdminHome',
    component: AdminHomePage,
    meta: { requiresAuth: true, role: 'admin' },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function isAuthenticated() {
  const cookieName = "cookieName";
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
}

router.beforeEach((to, from, next) => {
  const role = sessionStorage.getItem('role'); // 获取角色
  if (to.name === 'Login' || to.name === 'RegularEnroll') {
    next(); // 放行登录和注册页面
  } else if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login' }); // 未登录，跳转到登录页面
  } else if (to.meta.role && to.meta.role !== role) {
    ElMessage.error("权限不足");
    next({ name: 'Login' }); // 权限不匹配，跳转到登录页面
  } else {
    next(); // 继续导航
  }
});

export default router;
