import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/views/common/LoginPage.vue";
import RegularUserHomePage from "@/views/regularuser/RegularUserHomePage.vue";
import AdminHomePage from "@/views/admin/AdminHomePage.vue";
import RegularUserEnrollPage from "@/views/regularuser/RegularUserEnrollPage.vue";
import RegularUserSelectByCorpusPage from "@/views/regularuser/RegularUserSelectByCorpusPage.vue";
import RegularUserSelectByTypePage from "@/views/regularuser/RegularUserSelectByTypePage.vue";
import RegularUserPersonalCenterPage from "@/views/regularuser/RegularUserPersonalCenterPage.vue";
import {ElMessage} from "element-plus";
import AdminControllerCorpus from "@/views/admin/AdminControllerCorpus.vue";
import AdminControllerKinds from "@/views/admin/AdminControllerKinds.vue";
import AdminPersonCenter from "@/views/admin/AdminPersonCenter.vue";
import AdminControllerUsers from "@/views/admin/AdminControllerUsers.vue";
import RegularUserDownExcelPage from "@/views/regularuser/RegularUserDownExcelPage.vue";

const routes = [
    //登录页面
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
    //注册页面
  {
    path: '/regular_enroll',
    name: 'RegularEnroll',
    component: RegularUserEnrollPage,
  },
    //普通用户首页
  {
    path: '/regular_user_home',
    name: 'RegularUserHome',
    component: RegularUserHomePage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
    //用户语料段查询页面
  {
    path: '/regular_user_corpus',
    name: 'RegularUserSelectByCorpus',
    component: RegularUserSelectByCorpusPage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
    //用户分类查询页面
  {
    path: '/regular_user_type',
    name: 'RegularUserSelectByType',
    component: RegularUserSelectByTypePage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
    //用户个人中心
  {
    path: '/regular_user_personal_center',
    name: 'RegularUserPersonalCenter',
    component: RegularUserPersonalCenterPage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
    //用户下载语料页面
  {
    path: '/regular_user_down_excel',
    name: 'RegularUserDownExcel',
    component: RegularUserDownExcelPage,
    meta: { requiresAuth: true, role: 'regular_user' },
  },
    //管理员首页
  {
    path: '/admin_home',
    name: 'AdminHome',
    component: AdminHomePage,
    meta: { requiresAuth: true, role: 'admin' },
  },
    //管理员管理语料页面
  {
    path: '/admin_con_corpus',
    name: 'AdminControllerCorpus',
    component: AdminControllerCorpus,
    meta: { requiresAuth: true, role: 'admin' },
  } ,
    //管理员管理种类页面
  {
    path: '/admin_con_kinds',
    name: 'AdminControllerKinds',
    component: AdminControllerKinds,
    meta: { requiresAuth: true, role: 'admin' },
  },
    //管理员管理普通用户页面
  {
    path: '/admin_con_con_users',
    name: 'AdminConUsers',
    component: AdminControllerUsers,
    meta: {requiresAuth: true, role: 'admin' },
  },
    //管理员个人中心
  {
    path: '/admin_con_personal_center',
    name: 'AdminPersonalCenter',
    component: AdminPersonCenter,
    meta: { requiresAuth: true, role: 'admin' },
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//捕获cookie
function isAuthenticated() {
  const cookieName = "cookieName";
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
}

//权限判定
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
