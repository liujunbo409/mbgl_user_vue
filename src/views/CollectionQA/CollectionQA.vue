<template>
  <div class="com-container">
    <vue-header title="收藏问答"></vue-header>
    <div class="com-input-container">
      <input type="text">
      <span class="searchBtn">搜索</span>
    </div>
    <view-box minus="59px">
      <vux-group>
        <vux-cell v-for="(item, index) in collectionQaList" :key="index"  :title="item.qa.question" :inline-desc="`收藏时间:${item.qa.updated_at}`" :is-link="true"   @click.native="$toView('qa_bank', { query: { qaId: item.id } })"
        ></vux-cell>
      </vux-group>
    </view-box>
    <div class="pageSelectorBar">
      <span class="btn" v-text="'<'"></span>
      <span class="nowPage">{{ '1' }}</span>
      <span class="btn" v-text="'>'"></span>
      <span class="pageCount">共 {{ '10' }} 页</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user_id: '',
      questionSearch: '',
      collectionQaList: []
    }
  },

  mounted() {
    this.load()
  },

  methods: {
    load() {
      this.$bus.$emit('vux.spinner.show')
      _request({
        url: 'qa/collectList',
        params: {
          user_id: this.user_id,
          questionSearch: this.questionSearch
        }
      }).finally(() => this.$bus.$emit('vux.spinner.hide'))
      .then(({ data }) => {
          if (data.result) {
            this.collectionQaList = data.ret.collections.data
            // console.log(this.collectionQaList)
            this.$bus.$emit('vux.toast', {
              type: 'success',
              text: '已发送申请'
            })
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
    }
  }
}
// 跳转到零一页、

</script>

<style lang="less" scoped>
.com-input-container {
  background-color: white;
  width: 100%;
  display: flex;
  height: 30px;

  > input {
    padding: 5px;
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
