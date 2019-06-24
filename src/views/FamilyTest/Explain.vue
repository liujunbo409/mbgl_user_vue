<template>
  <div class="com-container">
    <vue-header title="监测说明"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box v-if="status === 3">
      
    </view-box>
  </div>
</template>

<script>
export default {
  data (){
    return {
      type: ''
    }
  },

  mounted (){
    this.type = this.$route.query.type
    this.load()
  },

  methods: {
    load (){
      _request({
        url: 'homeMonitoring/getHomeMonitoringArticle',
        test_item: this.type
      }).then(({data}) =>{
        if(data.result){
          
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
