// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// 公共库
import Vue from 'vue'
import FastClick from 'fastclick'
import VideoPlayer from 'vue-video-player';

// 配置对象
import App from './App'
import router from './router'
import store from './store'
import beforeInit from '././config/beforeInit'
import beforeCreate from './config/beforeCreate'
import created from './config/created'
import mounted from './config/mounted'
import globalVars from './config/globalVars'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 全局组件及插件
import { 
  ToastPlugin, AlertPlugin, ConfirmPlugin, LoadingPlugin, DatetimePlugin, ConfigPlugin,
  Group, Cell
} from 'vux'
import VueHeader from '@c/header/Header'
import InlineLoading from '@c/InlineLoading'
import ReadonlyMask from '@c/ReadonlyMask'
import ViewBox from '@c/layout/ViewBox'

// 导入video-player
require('video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')
Vue.use(VideoPlayer)

Vue.use(ToastPlugin, { type: 'text' })
Vue.use(AlertPlugin, { title: '提示' })
Vue.use(ConfirmPlugin, { title: '提示' })
Vue.use(LoadingPlugin)
Vue.use(ConfigPlugin, { $layout: 'VIEW_BOX' })
Vue.use(DatetimePlugin)
Vue.use(ElementUI);
Vue.component('vux-group', Group)
Vue.component('vux-cell', Cell)
Vue.component('vue-header', VueHeader)
Vue.component('view-box', ViewBox)
Vue.component('inline-loading', InlineLoading)
Vue.component('readonly-mask', ReadonlyMask)


// 全局变量
Vue._GLOBAL = globalVars          // 全局变量，这里的全局变量不应更改
window.Vue = Vue
window._GLOBAL = {}               // 全局变量，可以进行更改
Vue.prototype.$bus = new Vue()    // 主要用于绑定自定义事件及触发相应事件

// 立即执行文件
require('./config/methods.js')  // 挂载实例方法
require('./config/request.js')  // 挂载请求器
require('./config/filter.js')  // 定义全局过滤器

FastClick.attach(document.getElementById('app-box'))

Vue.config.productionTip = false

beforeInit(() => new Vue({
  router, store,
  beforeCreate, created, mounted,
  render: h => h(App)
}).$mount('#app-box'))

