<template>
  <div class="com-container">
    <vue-header title="学习计划"></vue-header>
    <vux-tab :animate="false">
      <tab-item ref="firstTab" @click.native="selectedTab = 'active'">正在学习</tab-item>
      <tab-item @click.native="selectedTab = 'all'">全部学习</tab-item>
    </vux-tab>

    <div class="selectIll com-onMask">
      <span>当前学习疾病：</span> 
      <span class="selectedIll">{{ showSelectedIllName }}</span>
      <span class="selectOtherIllBtn" @click="visibleIllList = true">选择其他疾病</span>

      <div class="illList com-onMask" v-if="visibleIllList">
        <div class="illBlock" v-for="(item, index) in showIllList" :key="index"
          :class="{ hidden: !item.value, selected: illId === item.key }"
          @click="selectIll(item.key)"
        >{{ item.value }}</div>
        <div class="closeIllListBtn" @click="visibleIllList = false">取消</div>
      </div>
    </div>

    <div class="mask" v-if="visibleIllList"></div>

    <view-box style="height:calc(100% - 138px)" v-if="selectedTab === 'active'">
      <p class="stageTitle">当前学习阶段：{{ stage.catalog_name }}</p>
      <div class="articleList-container">
        <table class="articleList">
          <tr>
            <th width="60%">目录名</th>
            <th width="20%">学习状态</th>
            <th width="20%">操作</th>
          </tr>
          <tr v-for="({article, status}, index) in stageArticle" :key="index">
            <td>{{ article.title }}</td>
            <td :class="{ gray: !status }">{{ status ? '已通过' : '待学习' }}</td>
            <td><div class="toArticleBtn" 
              @click="$toView('learning_plan/article', { params: { article, illId } })">学习
            </div></td>
          </tr>
        </table>
      </div>
    </view-box>
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
export default {
  components: {
    VuxTab: Tab, TabItem,
  },

  data (){
    return {
      illId: '',
      selectedTab: 'active',
      illList: [],
      stage: {},
      stageArticle: {},
      visibleIllList: false,
      activeIll: '',
      status: 'init',
    }
  },

  mounted (){
    this.$refs.firstTab.$el.click()
    this.loadIllList()
    this.getSelectedIllId()
  },

  computed: {
    showSelectedIllName (){
      if(!(this.illId && this.illList.length)){ return '读取中' }
      var selected = this.illList.filter(val => val.ill_id === this.illId)
      if(!selected.length){
        return '未选择'
      }else{
        return selected[0].ill_name
      }
    },

    showIllList (){
      var list = this.illList.map(val => ({ key: val.ill_id, value: val.ill_name }))
      var needCount = 3 - list.length % 3
      for(let i=0; i < needCount; i++){
        list.push({ key: '', value: '' })
      }
      return list
    }
  },  

  watch: {
    illId (){
      this.loadNowStage().then(() => this.loadStageArticle())
      this.loadAllStage()
    }
  },

  methods: {
    getSelectedIllId (){
      return new Promise((resolve, reject) =>{
        _request({
          url: 'xxjh/nowIll'
        }).then(({data}) =>{
          if(data.result){
            this.illId = data.ret
            resolve(data.ret)
          }else{
            reject(data)
          }
        }).catch(e =>{
          console.log(e)
          reject({ timeout: true })
        })
      })
    },

    loadIllList (){
      _request({
        url: 'xxjh/XXJHIllList'
      }).then(({data}) =>{
        if(data.result){
          this.illList = data.ret
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    },

    loadNowStage (){
      return new Promise((resolve, reject) =>{
        _request({
          url: 'xxjh/nowXXJH',
          params: {
            ill_id: this.illId
          }
        }).then(({data}) =>{
          this.stage = data.ret
          resolve()
        })
        .catch(e =>{
          reject()
          if(e.timeout){
            this.$bus.$emit('vux.toast', {
              type: 'cancel',
              text: '网络错误'
            })
          }else{
            this.$bus.$emit('vux.toast', e.message)
          }
        })
      })
    },

    loadAllStage (){
      _request({
        url: 'xxjh/illAllStage',
        params: {
          ill_id: this.illId
        }
      }).then(({data}) =>{
        console.log(data)
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    loadStageArticle (){
      _request({
        url: 'xxjh/stageArticle',
        params: {
          stage: this.stage.id
        }
      }).then(({data}) =>{
        this.stageArticle = data.ret
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    selectIll (illId){
      this.visibleIllList = false
      if(this.illId === illId){ return }
      _request({
        url: 'xxjh/nowIllUpdate',
        params: {
          ill_id: iLLid
        }
      })

      this.illId = illId
      this.loadNowStage()
    },


  }
}
</script>

<style lang="less" scoped>
.com-container{
  background-color: white;
}

.selectIll{
  line-height: 40px;
  padding: 0 10px;
  background-color: white;
  border-bottom: 1px #ccc solid;
  box-sizing: border-box;
  position: relative;

  > *{
    vertical-align: middle;
  }
}

.selectedIll{
  display: inline-block;
  width: 8em;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  @media screen and (max-width: 330px) {
    width: 5em;
  }
}

.selectOtherIllBtn{
  color: @theme;
  margin-left: 10px;
  float: right;
}

.illList{
  display: flex;
  width: 100%;
  background-color: #F0F2F5;
  flex-wrap: wrap;
  justify-content: space-around;
  padding-bottom: 28px;
  position: absolute;
  top: 100%;
  left: 0;

  > .illBlock{
    width: 28%;
    margin-top: 10px;
    line-height: 26px;
    background-color: white;
    text-align: center;
  }

  > .selected{
    background-color: @theme;
    color: white;
  }

  > .closeIllListBtn{
    position: absolute;
    right: 10px;
    bottom: 5px;
    color: @theme;
  }
}

.mask{
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: black;
  opacity: 0.2;
  z-index: 99;
}

.gray{
  color: #ccc;
}

.stageTitle{
  text-align: center;
  margin-top: 30px;
}

.articleList-container{
  width: 95%;
  margin: 0 auto;
  margin-top: 10px;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.articleList{
  width: 100%;

  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;

  option{
    display: block;
    width: 100%;
    text-align: center;
  }

  th, td{
    padding: 5px;
    border: 1px #b5d6e6 solid;
    background-color: #efefef;
  }

  tr:first-of-type{
    border-radius: 10px 10px 0 0;
    
    th{
      background-color: @theme;
      color: white;
      font-weight: normal;
    }
    
    th:first-child{
      text-align: left;
    }
  }

  .toArticleBtn{
    display: inline-block;
    padding: 5px 10px;
    background-color: @theme;
    color: white;
    border-radius: 5px;
  }
}
</style>
