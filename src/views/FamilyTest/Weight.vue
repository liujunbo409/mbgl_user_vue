<template>
  <div class="com-container">
    <vue-header :title="'体重' +  (selectedTab === 'write' ? '录入' : '统计')"></vue-header>
    <vux-checker v-model="selectedTab"
      class="checkers-container" 
      default-item-class="checkers"
      selected-item-class="selected"
    >
      <checker-item value="write">录入</checker-item>
      <checker-item value="stats">统计</checker-item>
    </vux-checker>    

    <div class="form">
      <div class="date form-line">
        <span>日期：</span>
        <div @click="openDateSelector" class="trigger">{{ date || '未选择' }}</div>
      </div>
      <div class="weight form-line">
        <span>体重：</span>
        <div class="com-input-container trigger" data-suffix="kg">
          <input type="number" v-model="weight" >
        </div>
      </div>
      
      <div class="addBtn" @click="add">添加</div>
    </div>

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
      selectedTab: 'write',
      date: '',
      weight: ''
    }
  },

  methods: {
    openDateSelector (){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',

        onConfirm: val =>{
          this.date = val
        }
      })
    },

    add (){

    }
  }
}
</script>

<style lang="less" scoped>
.com-container{
  background-color: white;
}

.checkers-container{
  text-align: center;
  margin-top: 20px;
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

.form{
  font-size: 16px;

  .form-line{
    line-height: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 5px 0;

    .trigger{
      width: 170px;
      height: 30px;
      background-color: #eee;
      border-radius: 20px;
    }

    .com-input-container{
      text-align: center;

      > input{
        width: calc(100% - 20px);
        text-align: left;
      }
    }
  }

  .date .trigger{
    text-align: center;
  }

  .addBtn{
    display: table;
    padding: 5px 15px;
    .themeBtn;
    border-radius: 10px;
    margin: 0 auto;
    margin-top: 10px;
  }
}
</style>
