# 中英文语料库前端
## 路由配置（router）

在router文件夹下的index.js文件中配置了该前端项目中的页面路由，以及对cookie的捕获，以及对不同角色权限判定的配置

## 页面（views）

### admin（管理员页面）

在该文件夹下存在五个页面：

​		AdminControllerCorpus.vue为管理员管理语料页面

​		AdminControllerKinds.vue为管理员管理分类页面

​		AdminControllerUsers.vue为管理员管理普通用户页面

​		AdminHome.vue为管理员首页

​		AdminPersonCenter.vue为管理员个人中心

### common（公共页面）

LoginPage.vue为网站首页，登陆页面

### regularuser（普通用户界面）

该文件夹下存在五个页面：

​		RegularUserEnrollPage.vue为普通用户注册页面

​		RegularUserHomePage.vue为普通用户首页

​		RegularUserPersonalCernterPage.vue为普通用户个人中心

​		RegularUserSelectByCorpusPage.vue为普通用户按语料查询页面

​		RegularUserSelectByTypePage.vue为普通用户分类查询页面

## api.Config.js（后端接口地址封装）
