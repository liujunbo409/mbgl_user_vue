<template>
  <div class="com-container">
    <vue-header title="全部问答"></vue-header>
    <vux-tab :animate="false">
      <tab-item v-for="({name, id}, index) in baseIllList" :key="index" :ref="`tab-${id}`"
        @click.native="selected = id"
      >{{ name }}</tab-item>
    </vux-tab>
    <p class="btnBar">
      <span @click="toggleViewMode">{{ viewMode === 'all' ? '按照' : '忽略' }}分类查看</span>
    </p>
    
    <div class="com-input-container" v-if="viewMode !== 'classify'">
      <input type="text" v-model.trim="keyword">
      <span class="searchBtn" @click="getList(keyword)">搜索</span>
    </div>

    <div class="currentDir" v-if="viewMode === 'classifyList'">
      <span class="prifix">当前目录：</span>
      <span class="dir-text">
        {{ dirDepth.map(val => val.catalog_name).reverse().join('-') }}
      </span>
      <div class="backBtn" @click="backCatalog">
        <span>返回目录</span>
        <img src="@img/btn/dir-back.png" width="20px">
      </div>
    </div>
    
    <template v-if="showList && showList.length">
      <view-box :minus="`${135 + (viewMode === 'classifyList' ? 31.5 : 0)}px`" class="list" ref="list">
        <vux-group class="com-group-noMarginTop" >
          <vux-cell v-for="(item, index) in showList" :key="index" :is-link="true"
          :title="item.qa.question"
          :inline-desc="`浏览：${item.doctor_show_num + item.user_show_num}`"
          @click.native="showQaBank(item.id)"
        ></vux-cell>
        </vux-group>
      </view-box>
      
      <div class="pageSelectorBar">
        <span class="btn" v-text="'<'" @click="jumpPage(-1)"></span>
        <span class="nowPage">{{ data[selected].current_page || '...' }}</span> 
        <span class="btn" v-text="'>'" @click="jumpPage(1)"></span>
        <span class="pageCount">共 {{ Math.ceil(data[selected].total / 10) }} 页</span>
      </div>
    </template>

    <view-box minus="106px" class="catalog-container" v-show="viewMode === 'classify' && classifyData">
      <catalog-group :catalogs="classifyData[selected] ? classifyData[selected].toTree() : {}" class="catalog" :onClickTitle="onClickTitle"></catalog-group>
    </view-box>

    <qa-info :question_id="qa_id" :bank_id="dirDepth[0] ? dirDepth[0].id : 0" v-if="visibleQaBank" v-model="visibleQaBank" class="com-modal"></qa-info>
  </div>
</template>

<script>
import { Tab, TabItem, Cell } from 'vux'
import CatalogGroup from '@c/Catalog/CatalogGroup'
import QaInfo from './QaInfo'

import List from '@u/list'
export default {
  components: {
    VuxTab: Tab, TabItem,
    VuxCell: Cell,
    CatalogGroup, QaInfo
  },

  data (){
    return {
      selected: '',   // 已选中疾病id
      selectedMenuId: '',   // 已选中目录id
      keyword: '',    // 搜索关键词
      tabsCache: {},  // 管理缓存状态
      data: {},       // 所有疾病列表数据的集合，以$开头的数据为分类下目录数据
      classifyData: {},   // 分类目录数据 
      dirDepth: [],       // 分类目录层级
      viewMode: 'all',    // 显示模式，有all(不按分类显示)、classify(分类树)、classifyList(分类树下问答list)
      qa_id: '',        // 传给qa-bank模态框的id
      visibleQaBank: false,
      status: 'init'
    }
  },

  mounted (){
    this.$store.dispatch('baseIllList/load').then(() =>{
      // 记得最后改成自动选第一个
      this.$refs[`tab-${this.baseIllList[3].id}`][0].$el.click()
    })
  },

  watch: {
    selected (val){
      // 读入缓存
      this.keyword = ''
      this.viewMode = 'all'
      var page

      if(val in this.tabsCache){
        this.keyword = this.tabsCache[val].keyword || ''
        page = this.tabsCache[val].page || 1
        this.viewMode = this.tabsCache[val].viewMode || 'all'
      }

      this.getList(this.keyword, page)
      this.getClassifyData()
    },

    keyword (val){
      // 缓存搜索文字
      this.tabsCache[this.selected].keyword = val
    }
  },

  computed: {
    // 基础疾病列表
    baseIllList (){
      return this.$store.getters['baseIllList/plain']
    },

    // 要交给列表组件显示的数据
    showList (){
      if(!this.data[this.selected]){ return [] }
      if(this.viewMode === 'all'){
        return this.data[this.selected].data
      }
      if(this.viewMode === 'classifyList'){
        if(!this.data[`$${this.selectedMenuId}`]){ return [] }
        return this.data[`$${this.selectedMenuId}`].data
      }
    }
  },

  methods: {
    // 获取列表，按不按分类获取都使用这个函数，按分类获取时，必须传入bank_id
    getList (keyword, currentPage = 1, bank_id){
      if(this.viewMode === 'classify'){ return }

      if(this.data[this.selected] && (currentPage > this.data[this.selected].last_page)){
        this.$bus.$emit('vux.toast', '已经是最后一页')
        return
      }
      if(currentPage < 1){
        this.$bus.$emit('vux.toast', '已经是第一页')
        return
      }

      var ill_id = this.selected
      this.status = 'loading'
      this.$bus.$emit('vux.spinner.show')
      _request({
        url: `qa/${this.viewMode === 'all' ? 'illQa' : 'qa'}List`,
        params: { 
          ill_id, 
          questionSearch: keyword,
          page: currentPage,
          bank_id
        },
      })
      .finally(() => this.$bus.$emit('vux.spinner.hide'))
      .then(({data}) =>{
        if(data.result){
          this.status = 'success'
          if(!(ill_id in this.tabsCache)){
            Vue.set(this.tabsCache, ill_id, {})
          }

          // 保存分类下列表时添加$前缀
          Vue.set(this.data, (this.viewMode === 'classifyList' ? '$' + this.selectedMenuId : ill_id), data.ret.data)

          // 缓存页数
          if(this.viewMode === 'all'){
            this.tabsCache[this.selected].page = data.ret.data.current_page
          }
        }else{
          this.error = 'error'
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

    // 切换视图模式all或classify
    toggleViewMode (){
      var changedViewMode = this.viewMode === 'all' ? 'classify' : 'all'
      this.viewMode = changedViewMode
      if(!this.tabsCache[this.selected]){
        Vue.set(this.tabsCache, ill_id, {})
      }

      // 缓存视图模式
      this.tabsCache[this.selected].viewMode = changedViewMode
    },

    // 获取分类树data
    getClassifyData (){
      _request({
        url: 'qa/bankList',
        params: {
          ill_id: this.selected
        }
      }).then(({data}) =>{
        Vue.set(this.classifyData, this.selected, new List(data.ret))
      })
    },

    // 跳转至指定页
    jumpPage (num){
      var page = this.data[this.selected].current_page + num
      this.getList(this.keyword, page)
      Vue.nextTick(() => this.$refs.list.scrollTo(0))
    },

    backCatalog (){
      this.viewMode = 'classify'
    },

    showQaBank (id){
      console.log(id)
      this.qa_id = id
      this.visibleQaBank = true
    },

    // 点击目录树的最下级分类时触发
    onClickTitle (menu){
      if(!menu.childs.length){    // 最下级分类childs.length为0
        this.viewMode = 'classifyList'
        this.selectedMenuId = menu.id
        this.dirDepth = this.classifyData[this.selected].getParents(menu)
        this.getList(this.keyword, 1, menu.id)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.btnBar{
  padding: 5px;
  color: @theme;
}

.com-input-container{
  background-color: white;
  width: 100%;
  display: flex;
  height: 30px;

  > input{
    padding: 5px;
    border-bottom: 2px #aaa solid;
  }

  > .searchBtn{
    display: inline-block;
    width: 70px;
    line-height: 30px;
    text-align: center;
    .themeBtn;
  }
}

.list{
  background-color: white;
}

.pageSelectorBar{
  text-align: center;
  color: #666;
  font-size: 15px;
  margin-top: 5px;
  background-color: white;

  .btn{
    margin: 0 20px;
    font-size: #aaa;
    font-weight: 500;
  }
  
  .nowPage{
    color: @theme;
    font-weight: 500;
  }
}

.catalog-container{
  background-color: white;

  .catalog{
    margin-left: 10px;
  }
}

.currentDir{
  box-sizing: border-box;
  font-size: 13px;
  padding: 5px;

   > *{
     vertical-align: middle;
   }

   .prifix{
     position: relative;
     top: 0.5px;
   }

  .dir-text{
    display: inline-block;
    width: calc(~'100% - 100px - 5em');
    overflow: auto;
    white-space: nowrap;
  }

  .backBtn{
    color: @theme;
    font-size: 14px;
    float: right;
    margin-right: 5px;
    position: relative;
    top: -1px;

    > * {
      vertical-align: middle;
    }
  }
}
</style>
