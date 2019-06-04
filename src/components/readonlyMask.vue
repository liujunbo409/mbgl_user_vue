<template>
  <div 
    @click="$bus.$emit('vux.toast', '您没有权限修改信息')"
    :style="`height:calc(100% - 46px - ${minus})`"
    class="readOnlyMask"
    :class="{ hide: !isReadonly }"
  ></div>
</template>

<script>
export default {
  props: {
    minus: {
      default: 0
    }
  },

  data (){
    return {

    }
  },

  computed: {
    isReadonly (){
      return this.$store.state.user.userInfo2 && this.$store.state.user.userInfo.qsgx.quanxian === 1
    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.readOnlyMask{
  position: fixed;
  width: 100%;
  height: ~'calc(100% - 46px)';
  left: 0;
  bottom: 0;
  z-index: 1000;
}
</style>
