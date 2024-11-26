import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/views/common/LoginPage.vue";
import RegularUserHomePage from "@/views/regularuser/RegularUserHomePage.vue";
import AdminHomePage from "@/views/admin/AdminHomePage.vue";
import RegularUserEnrollPage from "@/views/regularuser/RegularUserEnrollPage.vue";
import RegularUserSelectByCorpusPage from "@/views/regularuser/RegularUserSelectByCorpusPage.vue";
import RegularUserSelectByTypePage from "@/views/regularuser/RegularUserSelectByTypePage.vue";
import RegularUserPersonalCenterPage from "@/views/regularuser/RegularUserPersonalCenterPage.vue";


// 路由配置
const routes = [
    //用户登录
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },


  //普通用户注册
  {
    path: '/regular_enroll',
    name: 'RegularEnroll',
    component: RegularUserEnrollPage,
  },


    //普通用户主页
  {
    path: '/regular_user_home',
    name: 'RegularUserHome',
    component: RegularUserHomePage,
    meta: { requiresAuth: true }, // 需要登录
  },

    //普通用户按语料查询界面
  {
    path: '/regular_user_corpus',
    name: 'RegularUserSelectByCorpus',
    component: RegularUserSelectByCorpusPage,
    meta: { requiresAuth: true },
  },

    //普通用户按分类查找页面
  {
    path: '/regular_user_type',
    name: 'RegularUserSelectByType',
    component: RegularUserSelectByTypePage,
    meta: { requiresAuth: true },
  },

    //普通用户个人中心
  {
    path: '/regular_user_personal_center',
    name:'RegularUserPersonalCenter',
    component: RegularUserPersonalCenterPage,
    meta: { requiresAuth: true },
  },
    //管理员主页
  {
    path: '/admin_home',
    name: 'AdminHome',
    component: AdminHomePage,
    meta: { requiresAuth: true }, // 需要登录
  },
  {

  }
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 工具函数：检查 cookie 是否存在
function isAuthenticated() {
  const cookieName = "cookieName";  //cookieName为cookie名
  return document.cookie.split("; ").some((cookie) => cookie.startsWith(`${cookieName}=`));
}

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 放行登录页和注册页
  if (to.name === 'Login' || to.name === 'RegularEnroll') {
    next(); // 直接放行
  } else if (to.meta.requiresAuth && !isAuthenticated()) {
    // 如果目标路由需要权限且用户未登录，跳转到登录页面
    next({ name: 'Login' });
  } else {
    next(); // 继续导航
  }
});

export default router;
