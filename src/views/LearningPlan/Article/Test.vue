<template>
  <div class="com-container">
    <vue-header title="文章考核"></vue-header>
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
      articleId: 0,
      stageId: 0,
      illId: 0,
      selecteds: {},
      status: 1,
      data: [],       // 问题数据
    }
  },

  activated (){
    if(this.$route.params.articleId){
      this.init()
      this.articleId = this.$route.params.articleId
      if(this.$route.params.stageId){
        this.stageId = this.$route.params.stageId
      }
      if(this.$route.params.illId){
        this.illId = this.$route.params.illId
      }
      this.load()
    }
  },

  methods: {
    init (){
      this.selecteds = {}
      this.status = 1
      this.data = []
      this.articleId = 0
    },

    // 载入问题数据
    load (){
      this.status = 2
      _request({
        url: 'xxjh/articleCheck',
        params: {
          article_id: this.articleId
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

    // 判断考核结果
    check (){
      // 构建正确答案集（问题id索引：正确答案[数组]），并进行对比
      var answers = {}
      this.data.forEach(val => answers[val.test.id] = val.test.answer.toString().split(','))
      var errors = []
      for(let key in answers){
        if(   // 如果正确答案数和选择数不同，或选择的选项在对应正确答案数组中不存在，则将其id加入errors
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
          confirmText: '查看解析',
          cancelText: '重新学习',

          onConfirm: () =>{
            var data = this.data.filter(val => errors.includes(val.test.id))
            .map(val => ({ title: val.test.question, content: val.test.analysis }))

            this.$baseToView('analysis', {
              params: { data }
            })
          },

          onCancel: () => this.$baseToView('article')
        })
      }else{
        // 判断有无下一篇
        _request({
          url: 'xxjh/articlePass',
          method: 'post',
          data: {
            article_id: this.articleId,
            stage: this.stageId
          }
        }).then(({data}) =>{
          if(data.result){
            this.checked()
          }else{
            this.$bus.$emit('vux.toast', data.message)
          }
        })
      }

    },

    // 通过考核后显示的提示
    checked (){
      _request({
        url: 'xxjh/getNextArticle',
        params: {
          article_id: this.articleId,
          stage: this.stageId
        }
      }).then(({data}) =>{
        if(data.ret.article_id){
          this.$vux.confirm.show({
            title: '恭喜你',
            content: '考核通过',
            confirmText: '进入下一学习',
            cancelText: '返回学习计划',

            onConfirm: () =>{
              this.$baseToView('article', {
                params: {
                  articleId: data.ret.article_id,
                  illId: data.ret.ill_id
                }
              })
            },

            onCancel: () =>{
              this.$toView('learning_plan')
            }
          })
        }else{
          this.$vux.confirm.show({
            title: '恭喜你',
            content: '考核通过',
            confirmText: '进入阶段考核',
            cancelText: '返回学习计划',

            onConfirm: () =>{
              this.$toView('learning_plan/exam', {
                params: {
                  illId: this.illId,
                  stageId: this.stageId
                }
              })
            },

            onCancel: () =>{
              this.$toView('learning_plan')
            }
          })
        }
      })

    }
  }
}
</script>

<style lang="less" scoped>

</style>
