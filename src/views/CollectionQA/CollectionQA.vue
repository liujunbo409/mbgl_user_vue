<template>
  <div class="com-container">
    <vue-header title="我收藏的问答题库"></vue-header>
    <div class="com-input-container">
      <input type="text" v-model="questionSearch">
      <span class="searchBtn" @click="load(questionSearch)">搜索</span>
    </div>
    <view-box minus="59px" ref="list">
      <vux-group class="com-group-noMarginTop">
        <vux-cell v-for="(item, index) in collectionQaList.data" :key="index" :is-link="true" 
          :title="item.qa.question" :inline-desc="`收藏时间:${item.qa.updated_at}`" 
          @click.native="showQaInfo(item.id)"
        ></vux-cell>
      </vux-group>
    </view-box>

    <div class="pageSelectorBar">
      <span class="btn" v-text="'<'" @click="jumpPage(-1)"></span>
      <span class="nowPage">{{ collectionQaList.current_page || '...' }}</span> 
      <span class="btn" v-text="'>'" @click="jumpPage(1)"></span>
      <span class="pageCount">共 {{ Math.ceil(collectionQaList.total / 10) }} 页</span>
    </div>

    <qa-info :question_id="qa_id" v-if="visibleQaInfo" v-model="visibleQaInfo" class="com-modal"></qa-info>
  </div>
</template>

<script>
import QaInfo from '@v/AllQA/QaInfo'
export default {
  components: {
    QaInfo
  },

  data() {
    return {
      user_id: '',
      qa_id: '',
      questionSearch: '',
      collectionQaList: [],
      visibleQaInfo: false
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    load(questionSearch, currentPage = 1) {
      if(this.collectionQaList && (currentPage > this.collectionQaList.last_page)){
        this.$bus.$emit('vux.toast', '已经是最后一页')
        return
      }
      if(currentPage < 1){
        this.$bus.$emit('vux.toast', '已经是第一页')
        return
      }

      this.$bus.$emit('vux.spinner.show')
      _request({
        url: 'qa/collectList',
        params: {
          questionSearch,
          page: currentPage,
        }
      }).finally(() => this.$bus.$emit('vux.spinner.hide'))
      .then(({ data }) => {
        if (data.result) {
          this.collectionQaList = data.ret.collections
        } else {
          this.$bus.$emit('vux.toast', data.message)
        }
      })
      .catch(e => {
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    jumpPage (num){
      var page = this.collectionQaList.current_page + num
      this.load(this.questionSearch, page)
      Vue.nextTick(() => this.$refs.list.scrollTo(0))      
    },

    showQaInfo (id){
      this.qa_id = id      
      this.visibleQaInfo = true
    }
  }
}

</script>

<style lang="less" scoped>
.com-input-container {
  background-color: white;
  width: 100%;
  display: flex;
  height: 30px;

  > input {
    padding: 5px;
    border-bottom: 2px #aaa solid;
  }

  > .searchBtn {
    display: inline-block;
    width: 70px;
    line-height: 30px;
    text-align: center;
    .themeBtn;
  }
}

.pageSelectorBar {
  text-align: center;
  color: #666;
  font-size: 15px;
  margin-top: 5px;
  background-color: white;

  .btn {
    margin: 0 20px;
    font-size: #aaa;
    font-weight: 500;
  }
  .nowPage {
    color: @theme;
    font-weight: 500;
  }
}
</style>
