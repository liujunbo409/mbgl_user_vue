<template>
  <div class="com-container">
    <vue-header title="全部问答"></vue-header>
    <vux-tab :animate="false">
      <tab-item v-for="({name, id}, index) in baseIllList" :key="index" :ref="`tab-${id}`"
        @click.native="selected = id"
      >{{ name }}</tab-item>
    </vux-tab>
    <p class="btnBar">
      <span @click="toggleViewMode">按照分类查看</span>
    </p>
    
    <div class="com-input-container" v-if="viewMode === 'all'">
      <input type="text" v-model="keyword">
      <span class="searchBtn" @click="search">搜索</span>
    </div>
    
    <view-box minus="116px" class="list">
      
    </view-box>
  </div>
</template>

<script>
import { Tab, TabItem, Cell } from 'vux'
export default {
  components: {
    VuxTab: Tab, TabItem,
    VuxCell: Cell
  },

  data (){
    return {
      selected: '',
      keyword: '',
      viewMode: 'all',
      status: 'init'
    }
  },

  mounted (){
    this.$store.dispatch('baseIllList/load').then(() =>{
      this.$refs[`tab-${this.baseIllList[0].id}`][0].$el.click()
      this.getList()
    })
  },

  watch: {
    selected (){
      this.getList() 
    },
  },

  computed: {
    baseIllList (){
      return this.$store.getters['baseIllList/plain']
    }
  },

  methods: {
    getList (){
      this.status = 'loading'
      this.$bus.$emit('vux.spinner.show')
      _request({
        url: 'openquiz/getListByIll',
        params: {
          ill_id: this.selected,
        }
      }).finally(() =>{
        this.$bus.$emit('vux.spinner.show')
      })
      .then(({data}) =>{
        if(data.result){
          this.status = 'success'
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

    search (){

    },

    toggleViewMode (){

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
  margin-top: 10px;
  background-color: white;
}
</style>
