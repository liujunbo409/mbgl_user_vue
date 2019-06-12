<template>
  <div class="com-container">
    <vue-header title="疾病详情"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box class="com-header-view" v-if="status === 3">
      <ill-module-item v-for="(item, index) in modulesData" :key="index"
        :data="item"
        @onClickEdit="toModulePage(item)"
      >
        <div class="line" v-if="item.type === 'medicinal'">
          <div class="left yao_Ming">药名：</div>
          <div class="right">
            {{ yong_Yao_Data.length ? yong_Yao_Data.map(val => val.name).join('、') : '未选择' }}
          </div>
        </div>
        <div class="line" v-else>
          <div class="left yao_Ming">病名：</div>
          <div class="right">{{ 
            item.xuanxiangs.length ? 
            item.xuanxiangs
            .filter(val => val.status && val.date)
            .map(val => val.name).join('、') : '未选择'
          }}</div>
        </div>
      </ill-module-item>
      <div class="mainBtn-container">
        <x-button @click.native="toCreatePlan">填写调查问卷完成学习计划</x-button>
      </div>    
    </view-box>
    <readonly-mask></readonly-mask>
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
      modulesData: [],
      yong_Yao_Data: [],

      status: 1
    }
  },

  activated (){
    if('illId' in this.$route.params){
      this.illId = this.$route.params.illId
    }

    this.load().then(() =>{
      this.modulesData.forEach(val =>{
        if(val.type === 'medicinal'){
          _request({
            url: 'jkda/userMedicine',
            params: {
              modular_id: val.id
            }
          }).then(({data}) =>{
            if(data.result){
              this.yong_Yao_Data = data.ret
            }else{
              this.$bus.$emit('vux.toast', data.message)
            }
          }).catch(e =>{
            console.log(e)
            this.$bus.$emit('vux.toast', {
              type: 'cancel',
              text: '网络错误'
            })
          })
        }
      })
    })
  },

  methods: {
    // 读取模块列表
    load (){
      return new Promise((resolve, reject) =>{
        this.status = 2
        this.$store.dispatch('jkda/get', this.illId).then(data =>{
          this.status = 3
          this.modulesData = data
          resolve()
        }).catch(e =>{
          this.status = 0
          if(e.timeout){
            this.$bus.$emit('vux.toast', {
              type: 'cancel',
              text: '网络错误'
            })          
          }else{
            this.$bus.$emit('vux.toast', e.message)
          }
          reject()
        })
      })
    },

    // 进入模块页面
    toModulePage (item){
      var path = 'health/ill_info/other'
      if(item.type === 'medicinal'){
        path = 'health/ill_info/medicinal'
      }
      this.$toView(path, {
        params: { moduleData: item }
      })
    },

    // 去填写问卷
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
    },

    
  }
}
</script>

<style lang="less" scoped>
.mainBtn-container{
  padding: 30px 10px 0 10px;
}

.line{
  display: flex;
  width: 100%;
  justify-content: space-between;    
  color: #aaa;
  padding-top: 5px;

  .left, .right{
    display: flex;
    align-items: center;
  }

  .left{
    color: black;
  }
}

.yao_Ming{
  flex-basis: 6em;
}
</style>
