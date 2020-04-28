module.exports = {
  publicPath: '',
  productionSourceMap: false,
  devServer: {
    port: 8086, // 端口
    host: '0.0.0.0', // IP
    open: true // 自动打开浏览器
    // proxy: {
    //   '/api': {
    //     target: 'http://192.168.10.123:8088',
    //     ws: true,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': ''
    //     }
    //   }
    // }
  }
}