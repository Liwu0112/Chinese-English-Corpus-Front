const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080,
      client: {
        overlay: false, // 关闭错误覆盖
      },
  }
})
