<template>
  <div class="com-container">
    <vue-header title="调查问卷"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <main v-if="status === 3">
      <div class="number">第{{ data.seq }}题</div>
      <vux-checklist v-model="selected" :required="true" :max="1"
        :title="`【${data.type ?  '多选' : '单选'}】 ${data.question}`"
        :options="data.options.map(val => ({ key: val.id, value: val.option }))"
      ></vux-checklist>
    </main>
    <div class="com-mainBtn-container">
      <x-button @click.native="next">下一题</x-button>
    </div>
  </div>
</template>

<script>
import { Checklist, XButton } from 'vux'
export default {
  components: {
    VuxChecklist: Checklist, XButton
  },

  data (){
    return {
      illId: '',
      data: [],     // 问卷数据
      selected: [],
      status: 1
    }
  },

  mounted (){
    // 读取问卷
    this.illId = this.$route.params.illId
    this.status = 2
    _request({
      url: 'wj/start',
      params: {
        ill_id: this.illId
      }
    }).then(({data}) =>{
      if(data.result){
        this.status = 3
        this.data = data.ret
      }else{
        this.status = 0
        this.$bus.$emit('vux.toast', data.message)
      }
    }).catch(e =>{
      this.status = 0
      console.log(e)
      this.$bus.$emit('vux.toast', {
        type: 'cancel',
        text: '网络错误'
      })
    })
  },

  methods: {
    init (){
      this.data = []
      this.selected = []
    },
    
    // 跳转至下一问卷
    next (){
      _request({
        url: 'wj/wjPost',
        method: 'post',
        data: {
          option_id: this.selected[0],
          wj_id: this.data.id,
          ill_id: this.illId
        }
      }).then(({data}) =>{
        if(data.result){
          if(typeof data.ret === 'object'){
            this.init()
            this.data = data.ret
          }else{
            // 没有下一问题后，跳转至生成学习计划提示页
            this.$router.replace({
              name: 'health/ill_info/creating_plan',
              params: { illId: this.illId }
            })
          }
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
main{
  background-color: white;
}
.number{
  text-indent: 10px;
  font-size: 16px;
}
</style>
