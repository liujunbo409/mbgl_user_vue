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

    <view-box style="height:calc(100% - 110px)">
      <template v-if="selectedTab === 'write'">
        <div class="form">
          <div class="date form-line">
            <span>日期：</span>
            <div @click="openDateSelector" class="trigger">{{ date || '未选择' }}</div>
          </div>
          <div class="weight form-line">
            <span>体重：</span>
            <div class="com-input-container trigger" data-suffix="kg">
              <input type="number" v-model.trim.number="weight" >
            </div>
          </div>
          
          <div class="addBtn" @click="add">添加</div>
        </div>

        <table class="weight-table">
          <tr>
            <th colspan="3">体重表格</th>
          </tr>
          <tr>
            <td>时间</td>
            <td>体重</td>
            <td>操作</td>
          </tr>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.updated_at }}</td>
            <td>{{ item.value }}</td>
            <td>
              <span class="editBtn" @click="edit">修改</span>
              <span class="delBtn" @click="del">删除</span>
            </td>
          </tr>
        </table>
      </template>      
    </view-box>
 
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
      weight: '',
      data: [],
    }
  },

  mounted (){
    this.load()
  },

  methods: {
    load (){
      _request({
        url: 'cjsj/weightIndex'
      }).then(({data}) =>{
        if(data.result){
          this.data = data.ret
        }else{
          this.$bus.$emit('vux.taost', data.message)
        }
      })
    },
    
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

    },

    edit (){

    },

    del (){

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

.weight-table{
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  margin-top: 30px;
  font-size: 16px;

  th, td{
    border: 1px #b5d6e6 solid;
    padding: 10px 0;
  }

  th{
    padding: 15px 0;
    font-size: 18px;
    font-weight: normal;
  }

  .editBtn{
    color: @theme;
  }
  .delBtn{
    color: @danger;
  }
}
</style>
