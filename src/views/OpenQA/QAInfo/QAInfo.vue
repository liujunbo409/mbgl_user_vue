<template>
  <div class="com-container">
    <vue-header title="公开提问"></vue-header>
    <view-box>
      <inline-loading v-if="questionStatus === 2"></inline-loading>
      <template v-if="questionStatus === 3">
        <header>
          <p class="title">{{ questionData.title }}</p>
          <div class="content">{{ questionData.content }}</div>
          <div class="info">
            <span class="answerCount">{{ questionData.answer_num }}个回答</span>
            <span class="attentionCount">{{ questionData.attention_num }}人关注</span>
            <span class="date">{{ questionData.created_at }}</span>
            <div class="attentionBtn" :class="{ followed: questionData.attention_status }" 
              @click="toggleFollow"
            >{{ questionData.attention_status ? '已' : '+ ' }}关注</div>
          </div>
        </header>

        <div class="answerList-container" v-if="answerTree.length">
          <answer-item v-for="(item, index) in answerTree" :key="index"
            :data="item"
            @click.native="$toView('all_qa/qa_info/answer_info', 
            { params: { data: questionData, id: item.id, illId } })"
          ></answer-item>
        </div>
        <div class="noAnswer" v-else>暂无回答</div>
      </template>
    </view-box>
    
    <keep-alive>
      <router-view class="com-modal"></router-view>
    </keep-alive>
  </div>
</template>

<script>
import AnswerItem from '@c/item/AnswerItem'
import List from '@u/list.js'

export default {
  components: {
    AnswerItem
  },
  
  data (){
    return {
      qaId: '',
      illId: '',
      questionData: null,
      answerData: null,
      questionStatus: 1,
      answerStatus: 1
    }
  },

  activated (){
    if(this.$route.query.qaId){
      this.qaId = this.$route.query.qaId
      this.illId = this.$route.query.illId
    }

    this.loadQuestionData()
    this.loadAnswer()
  },

  computed: {
    answerTree (){
      if(!this.answerData){
        return []
      }else{
        return new List(this.answerData.data).toTree()
      }
    }
  },

  methods: {
    loadQuestionData (){
      this.questionStatus = 2
      _request({
        url: 'openquiz/getDetails',
        params: {
          quiz_id: this.qaId
        }
      }).then(({data}) =>{
        if(data.result){
          this.questionStatus = 3
          this.questionData = data.ret
        }else{
          this.questionStatus = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.questionStatus = 0
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    loadAnswer (){
      this.answerStatus = 2
      _request({
        baseURL: 'http://de.lljiankang.top/api/user/',
        url: 'openquiz/getAnswer',
        params: {
          quiz_id: this.qaId
        }
      }).then(({data}) =>{
        if(data.result){
          this.answerStatus = 3
          this.answerData = data.ret
        }else{
          this.answerStatus = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.answerStatus = 2
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },
    
    toggleFollow (){
      _request({
        url: 'openquiz/attention',
        method: 'post',
        data: {
          quiz_id: this.qaId,
          type: this.questionData.attention_status ? 0 : 1,
          ill_id: this.illId
        }
      }).then(({data}) =>{
        if(data.result){
          console.log(true)
          this.questionData.attention_status = !this.questionData.attention_status
          this.$bus.$emit('vux.toast', this.questionData.attention_status ? '已添加关注' : '已取消关注')
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
header{
  background-color: white;
  padding: 10px;
  border-bottom: 5px #ccc solid;


  .title, .content{
    padding-left: 10px;
  }

  .title{
    font-size: 20px;
  }

  .content{
    font-size: 16px;
  }

  .info{
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    flex-wrap: wrap;

    @media screen and (max-width: 330px){
      font-size: 12px;
    }

    > *{
      white-space: nowrap;
    }

    .attentionBtn{
      width: 70px;
      height: 30px;
      box-sizing: border-box;
      background-color: @theme;
      color: white;
      text-align: center;
      display: inline-block;
      padding: 5px 10px;
      border-radius: 5px;
      white-space: nowrap;

      &.followed{
        background-color: #ccc;
      }
    }
  }
}

.noAnswer{
  line-height: 40px;
  font-size: 18px;
  text-align: center;
  background-color: white;
}
</style>
