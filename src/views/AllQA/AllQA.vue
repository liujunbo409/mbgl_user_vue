<template>
  <div class="com-container">
    <vue-header title="问答"></vue-header>
     <vux-tab :animate="false">
      <tab-item @click.native="wenda_type = 0" ref="allqatab">全部问答</tab-item>
      <tab-item @click.native="wenda_type = 1">收藏问答</tab-item>
      <!-- <tab-item @click.native="$toView('collection_qa')">收藏问答</tab-item> -->
      <tab-item  @click.native="$toView('open_qa/all_ill')">公开问答</tab-item>
    </vux-tab>
    <div v-if="wenda_type === 0">
      <div>
      <vux-tab :animate="false">
      <tab-item v-for="({ill_name: name, ill_id: id}, index) in baseIllList" :key="index" :ref="`tab-${id}`"
                @click.native="selected = id"
      >{{ name }}
      </tab-item>
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
        <vux-group class="com-group-noMarginTop">
          <vux-cell v-for="(item, index) in showList" :key="index" :is-link="true"
                    :title="item.qa.question"
                    :inline-desc="`浏览：${item.doctor_show_num + item.user_show_num}`"
                    @click.native="$toView('all_qa/qa_info', { query: { questionId: item.qa.id, bankId: selected } })"
          ></vux-cell>
        </vux-group>
      </view-box>

      <page-selector
        :nowPage="illListData[viewMode === 'classifyList' ? '$' + selectedMenuId : selected].current_page || '...'"
        :pageCount="Math.ceil(illListData[viewMode === 'classifyList' ? '$' + selectedMenuId : selected].total / 10)"
        @onClickLeft="jumpPage(-1)"
        @onClickRight="jumpPage(1)"
      ></page-selector>
    </template>

    <view-box minus="106px" class="catalog-container" v-show="viewMode === 'classify' && classifyData">
      <catalog-group :catalogs="classifyData[selected] ? classifyData[selected].toTree() : {}" class="catalog"
                     :onClickTitle="onClickTitle"></catalog-group>
    </view-box>

    <div class="com-noData" :class="{ remainSearchBar: viewMode != 'classify' }" v-if="
      ((viewMode === 'all' || viewMode === 'classifyList') && (!showList || !showList.length)) ||
      (viewMode === 'classify' && !classifyData[selected].data.length)
    ">暂无数据
    </div>

    <router-view class="com-modal"></router-view>
    </div>
    </div>
    <div v-if="wenda_type === 1">
      <div class="com-container " >
    <div class="com-input-container" style="margin-top:90px;">
      <input type="text" v-model.trim="keyword">
      <span class="searchBtn" @click="load(keyword)">搜索</span>
    </div>
    <view-box minus="59px" ref="list">
      <vux-group class="com-group-noMarginTop" >
        <vux-cell 
          v-for="(item, index) in {}.constructor.keys(collectionQaList).length ? collectionQaList.data : []"  
          :key="index" :is-link="true" 
          :title="item.qa.question" :inline-desc="`收藏时间:${item.qa.updated_at}`" 
          @click.native="$toView('collection_qa/qa_info', { query: { questionId: item.qa.id } })"
        ></vux-cell>
      </vux-group>
    </view-box>

    <page-selector
      :nowPage="collectionQaList.current_page || '...'"
      :pageCount="Math.ceil(collectionQaList.total / 10)"
      @onClickLeft="jumpPage(-1)"
      @onClickRight="jumpPage(1)"
    ></page-selector>

    <div class="noData" v-if="{}.constructor.keys(collectionQaList).length && 
      !collectionQaList.data.length"
    >暂无数据</div>

    <router-view class="com-modal"></router-view>
  </div>
    </div>
    <div v-if="wenda_type === 2">
  
      <div class="com-container">
    <inline-loading v-if="illistStatus === 2"></inline-loading>
    <template v-if="illistStatus === 3">
      <div class="tabs-container">
        <vux-tab :animate="false" class="tabs">
          <tab-item ref="firstTab" @click.native="openqaSelected = 'recent'">最近更新</tab-item>
          <tab-item v-for="({ill_name, ill_id}, index) in selectedIllList" :key="index"
            :ref="`tab-${ill_id}`"
            @click.native="openqaSelected = ill_id"
          >{{ ill_name }}</tab-item>
        </vux-tab>
        <span class="moreIllBtn" @click="$toView('open_qa/all_ill', { params: { selectedIllList } })"></span>
      </div>

      <div class="com-input-container" id ="openqa-input" v-if="openqaSelected !== 'recent'">
        <input type="text" v-model.trim="openqaKeyword" placeholder="请输入要搜索的问题">
        <x-icon type="ios-search-strong" size="30" @click="getQAList(1, openqaKeyword)"></x-icon>
      </div>

      <view-box :minus="`${154 - (openqaSelected === 'recent' ? 37 : 0)}px`" class="list-container" ref="list">
        <div style="display: flex;justify-content: center;margin-top: 45px;font-size: 20px;color: #888888;"
             v-if="QAData[openqaSelected] && !QAData[openqaSelected].data.length" >
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
    </div>
  </div>
</template>

<script>
    import {Tab, TabItem} from 'vux'
    import CatalogGroup from '@c/Catalog/CatalogGroup'
    import PageSelector from '@c/block/PageSelector'

    import List from '@u/list'

    export default {
        components: {
            VuxTab: Tab, TabItem,
            CatalogGroup, PageSelector
        },

        data() {
            return {
                selected: '',   // 已选中疾病id
                selectedMenuId: '',   // 已选中目录id
                keyword: '',    // 搜索关键词
                tabsCache: {},  // 管理缓存状态
                illListData: {},       // 所有疾病列表数据的集合，以$开头的数据为分类下目录数据
                classifyData: {},   // 分类目录数据
                dirDepth: [],       // 分类目录层级
                viewMode: 'all',    // 显示模式，有all(不按分类显示)、classify(分类树)、classifyList(分类树下问答list)
                status: 1,
                baseIllList: null,
                wenda_type:0,  //0:全部问答；1：收藏问答；2：公开问答
                qaId: '',
                keyword: '',
                collectionQaList: {},
                openqaSelected: '',
                selectedIllList: [],
                illistStatus: 1,
                QAData: {},     // 问题数据
                openqaKeyword: ''
            }
        },
           created (){
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
                // this.$refs.firstTab.$el.click()   // 都没有，默认选择第一项（最近更新）
              }
            }
          })
        },
        mounted() {
               this.load()
            _request({
                url: 'jkda/getJKDAIllList'
            }).then(({data}) => {
                if (data.result) {
                    this.baseIllList = data.ret;
                    this.$nextTick(() => this.$refs[`tab-${data.ret[0].ill_id}`][0].$el.click()) //加载完视图后执行
                }
            }).catch(e => {
                console.log(e)
            })
             this.$refs.allqatab.$el.click()
        },

        watch: {
             openqaSelected (){
            this.getQAList()
           
            },
            selected(val) {
                // 读入缓存
                this.keyword = '';
                this.viewMode = 'all';
                var page;

                if (val in this.tabsCache) {
                    this.keyword = this.tabsCache[val].keyword || '';
                    page = this.tabsCache[val].page || 1;
                    this.viewMode = this.tabsCache[val].viewMode || 'all'
                }

                this.getList(this.keyword, page);
                this.getClassifyData()
            },

            keyword(val) {
                // 缓存搜索文字
                this.tabsCache[this.selected].keyword = val
            },
          
        },
        
        computed: {
            // 要交给列表组件显示的数据
            showList() {
              
                if (!this.illListData[this.selected]) {
                    return []
                }
                if (this.viewMode === 'all') {
                    return this.illListData[this.selected].data
                }
                if (this.viewMode === 'classifyList') {
                    if (!this.illListData[`$${this.selectedMenuId}`]) {
                        return []
                    }
                    return this.illListData[`$${this.selectedMenuId}`].data
                }
            }
        },

        methods: {
         
            // 获取列表
            getList(keyword, currentPage = 1) {
                if (this.viewMode === 'classify') {
                    return
                }

                console.log("selected"+this.selected)
                console.log("selectedMenuId"+this.selectedMenuId)
                var selectedMenu = this.illListData[this.viewMode === 'classifyList' ? '$' + this.selectedMenuId : this.selected]
            
                if (selectedMenu && (currentPage > selectedMenu.last_page)) {
                    this.$bus.$emit('vux.toast', '已经是最后一页');
                    return
                }

                if (currentPage < 1) {
                    this.$bus.$emit('vux.toast', '已经是第一页');
                    return
                }
                  console.log("selectedMenu"+selectedMenu);
                var ill_id = this.selected;
                this.status = 2;
                this.$bus.$emit('vux.spinner.show');
                _request({
                    url: `qa/${this.viewMode === 'all' ? 'illQa' : 'qa'}List`,
                    params: {
                        ill_id,
                        questionSearch: keyword,
                        page: currentPage,
                        bank_id: this.selectedMenuId
                    },
                })
                    .finally(() => this.$bus.$emit('vux.spinner.hide'))
                    .then(({data}) => {
                        if (data.result) {
                            this.status = 3;
                            if (!(ill_id in this.tabsCache)) {
                                Vue.set(this.tabsCache, (this.viewMode === 'classifyList' ? '$' + this.selectedMenuId : ill_id), {})
                            }

                            // 保存分类下列表时添加$前缀
                            Vue.set(this.illListData, (this.viewMode === 'classifyList' ? '$' + this.selectedMenuId : ill_id), data.ret.data)

                            // 缓存页数
                            if (this.viewMode === 'all') {
                                this.tabsCache[this.selected].page = data.ret.data.current_page
                            }
                        } else {
                            this.status = 0;
                            this.$bus.$emit('vux.toast', data.message)
                        }
                    }).catch(e => {
                    console.log(e);
                    this.status = 0;
                    this.$bus.$emit('vux.toast', {
                        type: 'cancel',
                        text: '网络错误'
                    })
                })
            },

            // 切换视图模式all或classify
            toggleViewMode() {
                var changedViewMode = this.viewMode === 'all' ? 'classify' : 'all';
                this.viewMode = changedViewMode;
                if (!this.tabsCache[this.selected]) {
                    Vue.set(this.tabsCache, ill_id, {})
                }

                // 缓存视图模式
                this.tabsCache[this.selected].viewMode = changedViewMode
            },

            // 获取分类树data
            getClassifyData() {
                _request({
                    url: 'qa/bankList',
                    params: {
                        ill_id: this.selected
                    }
                }).then(({data}) => {
                    Vue.set(this.classifyData, this.selected, new List(data.ret))
                })
            },

            // 跳转至指定页
            jumpPage(num) {
                var page = this.illListData[this.viewMode === 'classifyList' ? '$' + this.selectedMenuId : this.selected].current_page + num
                this.getList(this.keyword, page);
                Vue.nextTick(() => this.$refs.list.scrollTo(0));
            },

            // 返回按钮
            backCatalog() {
                this.viewMode = 'classify';
            },

            // 点击目录树的最下级分类时触发
            onClickTitle(menu) {
                this.viewMode = 'classifyList';
                this.selectedMenuId = menu.id;
                this.dirDepth = this.classifyData[this.selected].getParents(menu);
                this.getList(this.keyword, 1);
            },


            load(keyword, currentPage = 1) {
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
                  questionSearch: keyword,
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

            // 跳页
            jumpPage (num){
              var page = this.collectionQaList.current_page + num
              this.load(this.keyword, page)
              Vue.nextTick(() => this.$refs.list.scrollTo(0))      
            },
           
            // 获取已选疾病列表
              loadSelectedIllList (){
                console.log(111111)
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
              // jumpPage (num){
              //   this.getQAList(this.QAData[this.openqaSelected].current_page + num)
              //   Vue.nextTick(() => this.$refs.list.scrollTo(0))
              // },

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
  .btnBar {
    padding: 5px;
    color: @theme;
  }

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

  .list {
    background-color: white;
  }

  .catalog-container {
    background-color: white;

    .catalog {
      margin-left: 10px;
    }
  }

  .currentDir {
    box-sizing: border-box;
    font-size: 13px;
    padding: 5px;

    > * {
      vertical-align: middle;
    }

    .prifix {
      position: relative;
      top: 0.5px;
    }

    .dir-text {
      display: inline-block;
      width: calc(~'100% - 100px - 5em');
      overflow: auto;
      white-space: nowrap;
    }

    .backBtn {
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

  // .com-noData {
  //   // top: 194.5px;
  // }
  

.noData{
  position: fixed;
  top: 76px;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #eee;
  color: #666;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}




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
  top: 90px;
  right: 0;
  background-color: white;
  // box-shadow: -2px -1px 2px #666;
  z-index:100;
  border-left: 1px solid #666;

}

#openqa-input{
  background-color: #eee;
  height: 35px;
  border-bottom: 2px #ccc solid;
  display: flex;
  align-items: center;

  > input{
    padding: 5px;
    border: 0;
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

// #openqa-noData{
//   top: 127px;
//   background: yellow;
//   background-color: white;
// }
</style>
