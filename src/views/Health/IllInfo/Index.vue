<template>
  <div class="com-container">
    <vue-header title="疾病详情"></vue-header>
    <inline-loading v-if="status === 'loading'"></inline-loading>
    <view-box>
      <ill-module-item v-for="(item, index) in data" :key="index"
        :data="item"
        @onClickEdit="toModulePage(item)"></ill-module-item>
    </view-box>
    <div class="mainBtn-container">
      <x-button>填写调查问卷完成学习计划</x-button>
    </div>    
  </div>
</template>

<script>
import { XButton } from 'vux'
import IllModuleItem from '@c/item/illModuleItem'
export default {
  components: {
    XButton, IllModuleItem
  },

  data (){
    return {
      illId: '',
      data: [],

      status: 'init'
    }
  },

  activated (){
    if('illId' in this.$route.params){
      this.illId = this.$route.params.illId
      this.load()
    }
  },

  methods: {
    load (){
      this.status = 'loading'
      _request({
        url: 'jkda/illIndex',
        params: {
          ill_id: this.illId
        }
      }).then(({data}) =>{
        if(data.result){
          console.log(data.ret)
          this.status = 'success'
          this.data = data.ret
        }else{
          this.status = 'error'
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.status = 'error'
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    toModulePage (item){
      if(item.type === 'medicinal'){
        this.$toView('health/ill_info/medicinal', {
          params: { moduleData: item }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.mainBtn-container{
  padding: 30px 10px 0 10px;
}
</style>
