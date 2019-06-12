<!-- 公用头部导航 -->
<template>
  <div class="container">
    <x-header :title="title" :left-options="{
        backText: '',
        preventGoBack: back !== null
      }" @on-click-back="back && back()" class="header">
      <slot name="right" slot="right">
        <img slot="right" src="@img/btn/home.png" style="position:relative; top:-3px;" 
          @click="$toView('home')" width="25px"
          v-if="visibleHomeBtn"
        >
      </slot>
      <!-- 该插槽重写left内容，间接消除back按钮 -->
      <span slot="overwrite-left" v-if="!visibleBackBtn"></span>
    </x-header>
    <div class="romoteHint" v-if="isRemoteMode">
      <span>您正以{{ $store.state.user.remoteAccess.quanxian_str }}权限控制“{{ $store.state.user.userInfo.real_name }}”的帐号</span>
    </div>
  </div>
</template>

<script>
import { XHeader } from 'vux'

export default {
  components: {
    XHeader
  },

  props: {
    title: {},

    visibleBackBtn: {
      default: true
    },
    
    visibleHomeBtn: {
      default: true
    },

    back: {
      default: null
    }
  },

  data (){
    return {

    }
  },

  computed: {
    isRemoteMode (){
      return !!this.$store.state.user.userInfo2
    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.container{
  z-index: 100;
}

.romoteHint{
  line-height: 30px;
  background-color: #4CB14C;
  color: white;
  text-align: center;
}
</style>
