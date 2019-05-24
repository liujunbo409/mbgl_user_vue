<template>
  <div class="com-container">
    <vue-header title="疾病详情"></vue-header>
    <inline-loading v-if="status === 'loading'"></inline-loading>
    <view-box class="com-header-view" v-if="status === 'success'">
      <ill-module-item v-for="(item, index) in data" :key="index"
        :data="item"
        @onClickEdit="toModulePage(item)"></ill-module-item>

      <div class="mainBtn-container">
        <x-button @click.native="toCreatePlan">填写调查问卷完成学习计划</x-button>
      </div>    
    </view-box>
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
      this.$store.dispatch('jkda/get', this.illId).then(data =>{
        this.status = 'success'
        this.data = data
      }).catch(e =>{
        this.status = 'error'
        if(e.timeout){
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })          
        }else{
          this.status = 'error'
          this.$bus.$emit('vux.toast', e.message)
        }
      })
    },

    toModulePage (item){
      var path = 'health/ill_info/other'
      if(item.type === 'medicinal'){
        path = 'health/ill_info/medicinal'
      }
      this.$toView(path, {
        params: { moduleData: item }
      })
    },

    toCreatePlan (){
      _request({
        url: 'jkda/JKDAOver',
        params: {
          ill_id: this.illId
        }
      }).then(({data}) =>{
        if(data.result){
          if(data.ret === 1){
            this.$bus.$emit('vux.alert', '请先完成填写调查问卷')
          }
          if(data.ret === 2){
            this.$vux.confirm.show({
              content: '您已经生成过学习计划，是否要重新生成？',
              onConfirm: () =>{
                this.$toView('health/ill_info/wen_juan', {
                  params: { illId: this.illId }
                })
              }
            })
          }
          if(data.ret === 3){
            this.$toView('health/ill_info/wen_juan', {
              params: { illId: this.illId }
            })            
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.mainBtn-container{
  padding: 30px 10px 0 10px;
}
</style>
