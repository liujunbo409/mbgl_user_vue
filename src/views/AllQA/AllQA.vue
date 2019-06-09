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
      selected: '',
      keyword: '',
      viewMode: 'all'
    }
  },

  mounted (){
    this.$store.dispatch('baseIllList/load').then(() =>{
      this.$refs[`tab-${this.baseIllList[0].id}`][0].$el.click()
    })
  },

  computed: {
    baseIllList (){
      return this.$store.getters['baseIllList/plain']
    }
  },

  methods: {
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
</style>
