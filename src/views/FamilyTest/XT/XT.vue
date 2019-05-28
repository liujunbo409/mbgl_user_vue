<template>
  <div class="com-container">
    <vue-header :title="'血糖' +  (selectedTab === 'collect' ? '采集' : '统计')"></vue-header>
    <!-- 添加v-model，调整样式 -->
    <vux-checker
      class="checkers-container" 
      default-item-class="checkers"
      selected-item-class="selected"
    >
      <checker-item>采集</checker-item>
      <checker-item>统计</checker-item>
    </vux-checker>
  </div>
</template>

<script>
import { Checker, CheckerItem } from 'vux'

export default {
  components: {
    VuxChecker: Checker, CheckerItem
  },

  data (){
    return {
      selectedTab: 'collect'
    }
  },

  mounted (){
    this.$refs.firstTab.$el.click()
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.container{
  background-color: white;
}

.checkers-container{
  text-align: center;
  margin-top: 30px;
}

.checkers{
  padding: 5px 0;
  width: 40%;
  text-align: center;
  border: 1px #ccc solid;
  border-radius: 20px;
  margin: 10px;
  margin-top: 0;
}

.selected{
  background-color: @theme;
  border-color: @theme;
  color: white;
}
</style>
