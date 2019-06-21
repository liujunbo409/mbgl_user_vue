<template>
  <div class="com-container">
    <vue-header title="我的提问"></vue-header>
    <inline-loading v-if="illListStatus === 2"></inline-loading>
    <template v-if="illListStatus === 3">
      <vux-tab :animate="false">
        <tab-item ref="firstTab" @click.native="selected = 'questionedList'">我提问的</tab-item>
        <tab-item @click.native="selected = 'attentionList'">我关注的</tab-item>
        <tab-item @click.native="selected = 'thankedList'">我感谢的</tab-item>
        <tab-item @click.native="selected = 'commentedList'">我评论的</tab-item>
      </vux-tab>
      <div class="hint" @click="toQuestion">
        <img src="@img/btn/edit_black.png">
        <span>去提问</span>
      </div>
      <div class="selectorBar">
        <select v-model="selectedIll" class="illSelector">
          <option value="">全部疾病</option>
          <option v-for="(option, index) in illList" :key="index"
            :value="option.ill_id"
          >{{ option.ill_name }}</option>
        </select>
        <select v-model="selectedMode" class="modeSelector">
          <option value="created_at">按时间排序</option>
          <option value="approved_num">按热度排序</option>
        </select>
      </div>

      <view-box minus="153px" ref="list">
        <template v-if="$data[selected]">
          <template v-if="selected === 'thankedList'">
            <answer-item v-for="(item, index) in $data[selected].data" :key="index"
              :data="item.openquiz_answer"
              @click.native="toAnswerInfo(item)"
            ></answer-item>
          </template>

          <template v-if="['questionedList', 'attentionList'].includes(selected)">
            <question-item  v-for="(item, index) in $data[selected].data" :key="index"
              :data="item"
              @click.native="toQuestionInfo(item)"
            ></question-item>
          </template>

          <template v-if="selected === 'commentedList'">
            <!-- 接口数据不对，暂时没法做 -->
          </template>
        </template>
      </view-box>

      <page-selector v-if="$data[selected]"
        :nowPage="$data[selected].current_page || '...'"
        :pageCount="Math.ceil($data[selected].total / 10)"
        @onClickLeft="jumpPage(-1)"
        @onClickRight="jumpPage(1)"
      ></page-selector>
      
      <keep-alive>
        <router-view class="com-modal"></router-view>
      </keep-alive>
    </template>
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import PageSelector from '@c/block/PageSelector'
import AnswerItem from '@c/item/AnswerItem'
import QuestionItem from '@c/item/QuestionItem'

export default {
  components: {
    VuxTab: Tab, TabItem,
    PageSelector, AnswerItem, QuestionItem
  },

  data (){
    return {
      selected: '',   // 选中的tab
      selectedIll: '',
      selectedMode: 'created_at',
      illList: [],
      illListStatus: 1,
      
      questionedList: null,
      attentionList: null,
      thankedList: null,
      commentedList: null
    }
  },

  mounted (){
    this.loadIllList().then(() =>{
      this.$refs.firstTab.$el.click()
    })
  },

  watch: {
    selected (){
      this.getList()
    },

    selectedIll (){
      this.getList(true)
    },

    selectedMode (){
      this.getList(true)
    }
  },

  methods: {
    // 获取已选疾病列表
    loadIllList (){
      return new Promise((resolve, reject) =>{
        this.illListStatus = 2
        _request({
          url: 'jkda/getJKDAIllList',
        }).then(({data}) =>{
          if(data.result){
            this.illListStatus = 3
            this.illList = data.ret
            resolve()
          }else{
            this.illListStatus = 0
            this.$bus.$emit('vux.toast', data.message)
            reject()
          }
        }).catch(e =>{
          this.illListStatus = 0
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
          reject()
        })
      })
    },

    getList (force = false, page = 1){
      if(this[this.selected] && (page > this[this.selected].last_page)){
        this.$bus.$emit('vux.toast', '已经是最后一页')
        return
      }
      if(page < 1){
        this.$bus.$emit('vux.toast', '已经是第一页')
        return
      } 

      var apiName = {
        questionedList: '',
        attentionList: 'Attention',
        thankedList: 'Thank',
        commentedList: 'Comment'
      }[this.selected]

      if(this[this.selected] && !force){ return }

      this.$vux.loading.show()
      _request({
        url: `openquiz/my${apiName}OpenQuiz`,
        params: {
          page_size: 10,
          orderby: this.selectedMode,
          ill_id: this.selectedIll,
          page
        }
      }).finally(this.$vux.loading.hide)
      .then(({data}) =>{
        if(data.result){
          this[this.selected] = data.ret
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    },

    jumpPage (num){
      this.getList(true, this[this.selected].current_page + num)
      Vue.nextTick(() => this.$refs.list.scrollTo(0))
    },

    toQuestionInfo (data){
      this.$toView('open_qa/qa_info', {
        query: {
          qaId: data.id,
          illId: data.ill_id
        }
      })
    },

    toAnswerInfo (data){
      this.$toView('my_question/answer_info', {
        params: {
          data: data.openquiz,
          id: data.id,
          illId: data.illId
        }
      })
    },

    toQuestion (){
      this.$toView('open_qa/question', {
        params: {
          ill: this.selectedIll ? this.illList.filter(val => val.ill_id === this.selectedIll) : this.illList[0]
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.hint{
  line-height: 39px;
  text-align: center;
  background-color: white;
  border-bottom: 1px #666 solid;

  img{
    width: 1.2em;
    vertical-align: sub;
    font-size: 16px;
    margin-right: 5px;
  }
}

.selectorBar{
  width: 100%;
  height: 39px;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 0 10px;
  display: flex;
  border-bottom: 1px #666 solid;
  box-sizing: border-box;

  select{
    border: none;
    appearance: none;
    font-size: 16px;
    outline: none;
    background-color: white;
  }

  .modeSelector{
    
  }
}
</style>
