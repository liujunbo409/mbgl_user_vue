<template>
  <!--
    该组件负责管理显示路由和管理公共通知组件，以及需要在所有路由中显示的组件  
  -->
  <div class="com-container">
    <!-- 路由缓存 -->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>

    <vue-mask :zIndex="maskZIndex" v-if="visibleMask"></vue-mask>

    <!-- actionsheet全局方法组件 -->
    <actionsheet v-model="visibleActionSheet"
      v-bind="actionSheet.options"
      @on-click-menu="actionSheet.onClick"
      @on-click-menu-cancel="actionSheet.onCancel"
      @on-click-mask="actionSheet.onMask"
    ></actionsheet>

    <!-- loading提示 -->
    <transition name="fade">
      <vux-spinner class="com-ab-center" v-show="visibleSpinner" :type="spinnerType"></vux-spinner>
    </transition>
  </div>
</template>

<script>
import { Toast, Actionsheet, Spinner } from 'vux'
import VueMask from '@v/sub/Mask'

import vueAlert from './vuxAlert.js'
export default {
  components: {
    VuxToast: Toast,
    Actionsheet,
    VuxSpinner: Spinner,
    VueMask
  },

  data (){
    return {
      visibleActionSheet: false,
      actionSheet: {
        options: {},
        onClick: new Function(),
        onCancel: new Function(),
        onMask: new Function()
      },

      maskZIndex: 99,
      visibleMask: false,

      visibleSpinner: false,
      spinnerType: 'crescent'
    }
  },

  mounted (){
    // 注册的自定义vux通知方法（方法是自己封装的，非vux直接提供）
    vueAlert(this)

    // 显示遮罩
    this.$bus.$on('mask.show', (zIndex = 99) =>{
      this.maskZIndex = zIndex,
      this.visibleMask = true
    })
    this.$bus.$on('mask.hide', () => this.visibleMask = false)
  },

  watch: {
    // 路由变化了必定隐藏spinner
    $route (){
      this.visibleSpinner = false
    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
</style>
