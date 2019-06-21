<template>
  <!-- 直接借用Register页面 -->
  <reset-psd :resetPsd="request" ref="body"></reset-psd>
</template>

<script>
import ResetPsd from './Register'

export default {
  components: {
    ResetPsd
  },

  data (){
    return {
      // 传入操作函数
      request: data =>{
        this.$vux.loading.show()
        this.$store.dispatch('user/resetPsd', data)
        .finally(this.$vux.loading.hide)
        .then(() =>{
          this.$store.dispatch('user/editStatus/get').then(() => this.$toView('home'))
          this.$bus.$emit('vux.alert', '重置成功，请牢记新密码！')          
        })
        .catch(e =>{
          var text = e.timeout ? '网络错误' : e.message
          this.$bus.$emit('vux.toast', text)
        })
      }
    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
