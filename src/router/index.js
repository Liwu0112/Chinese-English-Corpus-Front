import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from "@/views/common/LoginPage.vue";
import RegularUserHomePage from "@/views/regularuser/RegularUserHomePage.vue";
import AdminHomePage from "@/views/admin/AdminHomePage.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/userHome',
      name: 'userHome',
      component: RegularUserHomePage
    },
    {
      path: '/adminHome',
      name: 'adminHome',
      component: AdminHomePage
    }
  ]
});

export default router;