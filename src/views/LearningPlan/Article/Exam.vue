<template>
  <div class="com-container">
    <vue-header title="阶段考核"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box class="com-header-view" v-if="status === 3">
      <vux-checklist
        v-for="({test: item}, index) in data" :key="index"
        v-model="selecteds[item.id]" label-position="right"
        :title="`【${item.answer.toString().indexOf(',') < 0 ? '单选' : '多选'}】${item.question}`"
        :options="item.answers.map((val, ind) => ({ key: ind, value: val }))"
      ></vux-checklist>
      <div class="com-mainBtn-container">
        <x-button @click.native="check">提交答案</x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
import { Checklist, XButton } from 'vux'

export default {
  components: {
    VuxChecklist : Checklist,
    XButton
  },

  data (){
    return {
      illId: 0,
      stageId: 0,
      selecteds: {},
      status: 1,
      data: [],       // 问题数据
    }
  },

  activated (){
    if(this.$route.params.stageId){
      this.init()
      this.illId = this.$route.params.illId
      this.stageId = this.$route.params.stageId
      this.load()
    }
  },

  methods: {
    init (){
      this.selecteds = {}
      this.status = 1
      this.data = []
      this.stageId = 0
    },

    load (){
      this.status = 2
      _request({
        url: 'xxjh/stageCheck',
        params: {
          stage: this.stageId
        }
      }).then(({data}) =>{
        if(data.result){
          this.status = 3
          this.data = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e => {
        this.status = 0
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    check (){
      var answers = {}
      this.data.forEach(val => answers[val.test.id] = val.test.answer.toString().split(','))
      var errors = []
      for(let key in answers){
        if(
          answers[key].length !== this.selecteds[key].length ||
          !answers[key].every(val => this.selecteds[key].includes(parseInt(val)))
        ){
          errors.push(key)
        }
      }

      errors = errors.map(val => parseInt(val))
      if(errors.length){
        this.$vux.confirm.show({
          title: '对不起',
          content: `您答错了${errors.length}道题`,
          // confirmText: '查看解析',
          cancelText: '返回学习计划',

          onConfirm: () =>{
            var data = this.data.filter(val => errors.includes(val.test.id))
            .map(val => ({ title: val.question, content: val.analysis }))

            this.$baseToView('analysis', {
              params: { data }
            })
          },

          onCancel: () => this.$toView('learning_plan')
        })
      }else{
        _request({
          url: 'xxjh/stageCheckPass',
          method: 'post',
          data: {
            ill_id: this.illId,
            stage: this.stageId
          }
        }).then(({data}) =>{
          if(data.result){
            this.$vux.alert.show({
              title: '恭喜你',
              content: '阶段考核已通过',

              onHide: () => this.$toView('learning_plan')
            })
          }else{
            this.$bus.$emit('vux.toast', data.message)
          }
        })
      }

    }
  }
}
</script>

<style lang="less" scoped>

</style>
