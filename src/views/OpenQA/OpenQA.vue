<template>
  <div class="com-container">
    <vue-header title="公开提问"></vue-header>
    <inline-loading v-if="illistStatus === 2"></inline-loading>
    <template v-if="illistStatus === 3">
      <div class="openqa-tabs-container">
        <vux-tab :animate="false" class="tabs">
          <tab-item ref="firstTab" @click.native="openqaSelected = 'recent'">最近更新</tab-item>
          <tab-item v-for="({ill_name, ill_id}, index) in selectedIllList" :key="index"
            :ref="`tab-${ill_id}`"
            @click.native="openqaSelected = ill_id"
          >{{ ill_name }}</tab-item>
        </vux-tab>
        <span class="moreIllBtn" @click="$toView('open_qa/all_ill', { params: { selectedIllList } })"></span>
      </div>

      <div class="com-input-container" v-if="openqaSelected !== 'recent'">
        <input type="text" v-model.trim="openqaKeyword" placeholder="请输入要搜索的问题">
        <x-icon type="ios-search-strong" size="30" @click="getQAList(1, openqaKeyword)"></x-icon>
      </div>

      <view-box :minus="`${154 - (openqaSelected === 'recent' ? 37 : 0)}px`" class="list-container" ref="list">
        <div style="display: flex;justify-content: center;margin-top: 45px;font-size: 20px;color: #888888;"
             v-if="QAData[openqaSelected] && !QAData[openqaSelected].data.length">
          —没有数据—
        </div>
        <vux-group class="com-group-noMarginTop">
          <vux-cell v-for="(item, index) in (QAData[openqaSelected] ? QAData[openqaSelected].data : [])" :key="index"
            :title="item.title"
            :inline-desc="`${item.answer_num}个回答　${item.attention_num}人关注`"
            :value="item.created_at.split(' ')[0]"
            @click.native="$toView('open_qa/qa_info', { query: { qaId: item.id, illId: item.ill_id } })"
          ></vux-cell>
        </vux-group>
      </view-box>
      <page-selector v-if="QAData[openqaSelected]"
        :nowPage="QAData[openqaSelected].current_page || '...'"
        :pageCount="Math.ceil(QAData[openqaSelected].total / 10)"
        @onClickLeft="jumpPage(-1)"
        @onClickRight="jumpPage(1)"
      ></page-selector>

      <!-- 加载时显示的静态翻页栏，防止数据加载完ui篡位 -->
      <page-selector v-else
        nowPage="..."
        pageCount="0"
        @onClickLeft="() => {}"
        @onClickRight="() => {}"
      ></page-selector>

      <footer @click="toQuestion">
        <img src="@img/btn/edit.png">
        <span>我要提问</span>
      </footer>
    </template>
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import PageSelector from '@c/block/PageSelector'
export default {
  components: {
    VuxTab: Tab, TabItem,
    PageSelector
  },

  data (){
    return {
      openqaSelected: '',
      selectedIllList: [],
      illistStatus: 1,
      QAData: {},     // 问题数据
      openqaKeyword: ''
    }
  },

  activated (){
    this.loadSelectedIllList().then(() =>{
      console.log(2222)
      // 路由有select参数，选中指定id的tab
      if(this.$route.params.select){
        this.$refs[`tab-${this.$route.params.select}`][0].$el.click()
      }else if(this.$route.params.add){   // 有add，添加指定id并选中
       if(!this.selectedIllList.some(val => val.ill_id === this.$route.params.add.ill_id)){
         this.selectedIllList.unshift(this.$route.params.add)
       }
       Vue.nextTick(() => this.$refs[`tab-${this.$route.params.add.ill_id}`][0].$el.click())
      }else{
        if(this.openqaSelected && this.openqaSelected !== 'recent'){
          Vue.nextTick(() => this.$refs[`tab-${this.openqaSelected}`][0].$el.click())
        }else{
          this.$refs.firstTab.$el.click()   // 都没有，默认选择第一项（最近更新）
        }
      }
    })
  },

  computed: {

  },

  watch: {
    openqaSelected (){
      this.getQAList()
    }
  },

  methods: {
    // 获取已选疾病列表
    loadSelectedIllList (){
      console.log(3333)
      return new Promise((resolve, reject) =>{
        this.illistStatus = 2
        _request({
          url: 'jkda/getJKDAIllList',
        }).then(({data}) =>{
          if(data.result){
            this.illistStatus = 3
            this.selectedIllList = data.ret
            resolve()
          }else{
            this.illistStatus = 0
            this.$bus.$emit('vux.toast', data.message)
            reject()
          }
        }).catch(e =>{
          this.illistStatus = 0
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
          reject()
        })
      })
    },

    // 请求问答列表
    getQAList (page = 1, openqaKeyword){
      if(this.QAData[this.openqaSelected] && (page > this.QAData[this.openqaSelected].last_page)){
        this.$bus.$emit('vux.toast', '已经是最后一页')
        return
      }
      if(page < 1){
        this.$bus.$emit('vux.toast', '已经是第一页')
        return
      }

      this.$bus.$emit('vux.spinner.show')

      // 这里要用到三个接口
      var url = 'openquiz/recentList'   // 最近更新
      if(this.openqaSelected !== 'recent'){
        url = 'openquiz/getListByIll'   // 按疾病全部
      }
      if(openqaKeyword){
        url = 'openquiz/getListBySearch'    // 按疾病搜索
      }
      _request({
        url,
        params: {
          ill_id: this.openqaSelected,
          page_size: 10,
          page,
          search_word: openqaKeyword
        }
      })
      .finally(() => this.$bus.$emit('vux.spinner.hide'))
      .then(({data}) =>{
        if(data.result){
          Vue.set(this.QAData, this.openqaSelected, data.ret)
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

    // 切换页面
    jumpPage (num){
      this.getQAList(this.QAData[this.openqaSelected].current_page + num)
      Vue.nextTick(() => this.$refs.list.scrollTo(0))
    },

    toQuestion (){
      if(this.openqaSelected === 'recent'){
        this.$toView('open_qa/all_ill', { params: { selectedIllList: this.selectedIllList } })
        this.$bus.$emit('vux.toast', '请先选择要提问的疾病')
      }else{
        this.$toView('open_qa/question', {
          params: {
            ill: this.selectedIllList.filter(val => val.ill_id === this.openqaSelected)[0]
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.openqa-tabs-container{
  position: relative;

  .tabs{
    margin-right: 44px;
  }
}

.moreIllBtn{
  background-image: url('~@img/btn/menu.png');
  background-size: 90%;
  background-repeat: no-repeat;
  background-position: center 4px;

  @size: 43px;
  width: @size;
  height: @size;
  position: absolute;
  top: 0;
  right: 0;
  background-color: white;
  box-shadow: -2px -1px 2px #666;
}

.com-input-container{
  background-color: #eee;
  height: 35px;
  border-bottom: 2px #ccc solid;
  display: flex;
  align-items: center;

  > input{
    padding: 5px;
  }
}

.list-container{
  background-color: white;

  /deep/ .weui-cell__ft{
    height: 48px;
  }
}

footer{
  @height: 44px;
  height: @height;
  line-height: @height;
  background-color: @theme;
  font-size: 20px;
  text-align: center;
  color: white;

  > img{
    width: 25px;
    vertical-align: text-top;
    margin-right: 5px;
  }
}

.com-noData{
  top: 127px;
  background-color: white;
}
</style>
