<template>
  <div class="com-container">
    <vue-header title="问题详情"></vue-header>
    <template v-if="questionData && answerData">
      <view-box minus="50px">
        <header>
          <p class="title">{{ questionData.title }}</p>
          <div class="content">{{ questionData.content }}</div>
          <div class="info">
            <span class="answerCount">{{ questionData.answer_num }}个回答</span>
            <span class="attentionCount">{{ questionData.attention_num }}人关注</span>
            <span class="date">{{ questionData.created_at | date }}</span>
            <div class="attentionBtn" :class="{ followed: questionData.attention_status }" 
              @click="toggleFollow"
            >{{ questionData.attention_status ? '已' : '+ ' }}关注</div>
          </div>
        </header>

        <main>
          <div class="doctorInfo">
            <img src="@img/sub/doctor_icon.png" class="icon">
            <div class="info">
              <p class="realName">{{ answerData.role_name + role }}</p>
              <div class="zhi_cheng">{{ answerData.role_title_str }}</div>
            </div>
          </div>     
          <div class="content">{{ answerData.content }}</div>
          <div class="nextAnswerBtn" @click="nextAnswer">下一个回答</div>
        </main>

        <div class="comments" v-if="comments.length">
          <h2>评论</h2>
          <vue-comments :data="comments" :illId="illId" @update="getComments(false)"></vue-comments>
        </div>
        <div class="noComments" v-else>暂无评论</div>

      </view-box>
      <footer>
        <span class="thankCount">{{ answerData.approved_num ? answerData.approved_num : 0 }}人赞同</span>
        <div class="btn" @click="toggleThank">
          <img src="@img/btn/good_fill.png" v-if="answerData.thank_status">
          <img src="@img/btn/good.png" v-else>
          <p>感谢 {{ answerData.thank_num }}</p>
        </div>

        <div class="btn" @click="showCommentEditor">
          <img src="@img/btn/comment.png">
          <p>评论 {{ answerData.comment_num }}</p>
        </div>
      </footer>
    </template>

    <keep-alive>
      <router-view class="com-modal"></router-view>
    </keep-alive>
  </div>
</template>

<script>
import VueComments from '@c/Comments/Comments'
import List from '@u/list.js'

export default {
  components: {
    VueComments
  },

  data (){
    return {
      questionData: null,
      answerId: '',
      illId: '',
      answerData: null,

      clickBtnCount: 0      // 计数防止用户连点
    }
  },

  activated (){
    if(this.$route.params.data){
      this.questionData = this.$route.params.data
      this.answerId = this.$route.params.id
      this.illId = this.$route.params.illId
    }
  },

  computed: {
    role (){
      return {
        doctor: '医生',
        nurse: '护士'
      }[this.answerData.role]
    },

    comments (){
      return new List(this.answerData.comment_list).toTree()
    }
  },

  watch: {
    answerId (){
      this.getComments()
    },

    $route (route){
      if(route.name === 'all_qa/qa_info/answer_info'){
        this.getComments(false)
      }
    }
  },

  methods: {
    // 点击了头部右侧按钮
    onClickHeaderAnswerBtn (){
      if(this.questionData.have_myself_answer){
        if(this.answerId === this.questionData.have_myself_answer){
          this.$bus.$emit('vux.toast', '该条已经是您的回答')
          return
        }

        this.id = this.questionData.have_myself_answer
      }else{
        this.$toView('all_qa/qa_info/answer_editor', {
          params: {
            data: this.questionData, 
            illId: this.illId 
          } 
        })
      }
    },

    // 获取评论
    getComments (showLoading = true){
      showLoading && this.$vux.loading.show()
      _request({
        url: 'openquiz/getOneAnswer',
        params: {
          answer_id: this.answerId
        }
      }).finally(() => showLoading && this.$vux.loading.hide())
      .then(({data}) =>{
        if(data.result){
          this.answerData = data.ret
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
    },

    // 点击下一个回答
    nextAnswer (){
      if(!this.answerData.next_answer_id){
        this.$bus.$emit('vux.toast', '已经是最后一条回答')
      }else{
        this.answerId = this.answerData.next_answer_id
      }
    },

    // 打开评论编辑器
    showCommentEditor (){
      this.$toView('all_qa/qa_info/answer_info/commentEditor', {
        params: {
          quizId: this.answerData.quiz_id,
          illId: this.illId,
          fatherId: this.answerData.id,
          name: this.answerData.role_name
        }
      })
    },

    // 切换关注状态
    toggleFollow (){
      if(this.clickBtnCount > 5){
        this.$bus.$emit('vux.toast', '您的操作过于频繁')
        return
      }

      this.clickBtnCount++
      setTimeout(() => this.clickBtnCount--, 10000)

      this.$vux.loading.show()
      _request({
        url: 'openquiz/attention',
        method: 'post',
        data: {
          quiz_id: this.questionData.id,
          type: this.questionData.attention_status ? 0 : 1,
          ill_id: this.illId
        }
      }).finally(this.$vux.loading.hide)
      .then(({data}) =>{
        if(data.result){
          console.log(true)
          this.questionData.attention_status = !this.questionData.attention_status
          this.$bus.$emit('vux.toast', this.questionData.attention_status ? '已添加关注' : '已取消关注')
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
    },

    // 切换感谢状态
    toggleThank (){
      if(this.clickBtnCount > 5){
        this.$bus.$emit('vux.toast', '您的操作过于频繁')
        return
      }

      this.clickBtnCount++
      setTimeout(() => this.clickBtnCount--, 10000)

      this.$vux.loading.show()
      _request({
        url: 'openquiz/thank',
        method: 'post',
        data: {
          quiz_id: this.questionData.id,
          type: this.answerData.thank_status ? 0 : 1,
          ill_id: this.illId,
          answer_id: this.answerData.id
        }
      }).finally(this.$vux.loading.hide)
      .then(({data}) =>{
        if(data.result){
          this.answerData.thank_status = !this.answerData.thank_status
          this.answerData.thank_num += this.answerData.thank_status ? 1 : -1
          this.$bus.$emit('vux.toast', this.answerData.thank_status ? '已感谢' : '已撤销感谢')
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
  }
}
</script>

<style lang="less" scoped>
header{
  background-color: white;
  padding: 10px;

  .title{
    font-size: 16px;
    margin-bottom: 5px;
    margin-left: 5px;
  }

  .info{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
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

main{
  margin-top: 10px;
  background-color: white;
  padding: 10px;
  color: #666;

  .doctorInfo{
    width: 100%;
    display: flex;

    .icon{
      width: 40px;
      border-radius: 50%;
      margin-right: 10px;
    }

    .zhi_cheng{
      color: #aaa;
    }
  }

  .content{
    margin: 10px 10px 10px 0;
  }

  .nextAnswerBtn{
    display: table;
    padding: 10px 15px;
    background-color: #eee;
    border-radius: 25px;
    font-size: 16px;
    margin-left: auto;
  }
}

.comments{
  background-color: white;
  margin-top: 10px;

  h2{
    font-size: 18px;
    font-weight: normal;
    text-indent: 10px;
    padding-top: 10px;
    line-height: 30px;
  }
}

.noComments{
  line-height: 40px;
  font-size: 18px;
  text-align: center;
  background-color: white;
  margin-top: 10px;
}

footer{
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: white;

  .btn{
    text-align: center;

    > img{
      width: 25px;
      vertical-align: middle;
    }
  }
}
</style>
