<template>
  <div class="com-container">
    <vue-header :title="'体重' +  (selectedTab === 'write' ? '录入' : '统计')"></vue-header>
    <vux-checker v-model="selectedTab" :radio-required="true"
      class="checkers-container" 
      default-item-class="checkers"
      selected-item-class="selected"
    >
      <checker-item value="write">录入</checker-item>
      <checker-item value="stats">统计</checker-item>
    </vux-checker>   

    <view-box minus="64px">
      <template v-if="selectedTab === 'write'">
        <div class="form">
          <div class="date form-line">
            <span>日期：</span>
            <div @click="openDateSelector" class="trigger">{{ date || '未选择' }}</div>
          </div>
          <div class="weight form-line">
            <span>体重：</span>
            <div class="com-input-container trigger" data-suffix="kg">
              <input type="number" v-model.trim.number="weight" @change="testWeight($event.target.value)">
            </div>
          </div>
          
          <div class="form-btns">
            <div class="addBtn" @click="editTarget ? edit() : add()">确定</div>
            <div class="clearBtn" @click="editTarget = null">清空</div>
          </div>
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
            <td>{{ item.date.split(' ')[0] }}</td>
            <td>{{ item.value }}</td>
            <td>
              <span class="editBtn" @click="editTarget = item">修改</span>
              <span class="delBtn" @click="del(item)">删除</span>
            </td>
          </tr>
        </table>
      </template> 

      <template v-if="selectedTab === 'stats'">
        <div class="search">
          <div class="begin block" @click="openDateSelectorForSearchBegin">{{ searchBegin }}</div>
          <span> - </span>
          <div class="end block" @click="openDateSelectorForSearchEnd">{{ searchEnd }}</div>
          <div class="searchBtn" @click="getStatsData('withSearch')">搜索</div>
        </div>

        <v-chart :data="statsData" v-if="{}.constructor.keys(statsData).length" class="chart">
          <v-scale x field="date" type="timeCat" mask="MM/DD" :tick-count="3" />
          <v-scale y field="value" :min="0" alias="当时体重" :tick-count="5" />
          <v-point
            :style="{
              stroke: '#fff',
              lineWidth: 1
            }"
            shape="smooth" />
          <v-line shape="smooth" />
        </v-chart>     
        <div v-else class="noData">暂未录入数据</div>  
      </template>     
    </view-box>
    <readonly-mask minus="100px"></readonly-mask>
  </div>
</template>

<script>
// 转date对象为[YY, MM, DD]格式
function toDateStrArr(date){
  return [date.getFullYear(), bu_Wei(date.getMonth() + 1), bu_Wei(date.getDate())]
}

// 将格式为YY-MM-DD格式的日期转为date对象
function toDateObj(str){
  var dateArr = str.split('-')
  var dateObj = new Date()
  dateObj.setFullYear(dateArr[0])
  dateObj.setMonth(parseInt(dateArr[1]) - 1)
  dateObj.setDate(dateArr[2])
  return dateObj
}

import { 
  Checker, CheckerItem, XDialog,
  VChart, VLine, VPoint, VScale, VTooltip
 } from 'vux'
var bu_Wei = val => val < 10 ? '0' + val : val    // 小于10的补前置0


export default {
  components: {
    VuxChecker: Checker, CheckerItem, XDialog,
    VChart, VLine, VPoint, VScale, VTooltip
  },

  data (){
    return {
      selectedTab: 'write',
      date: '',
      weight: '',
      data: [],     // 现有体重数据
      editTarget: null,     // 修改目标，当非unll时，上面的日期体重输入框为修改下方表格的信息

      // 一个月前日期
      searchBegin: toDateStrArr(new Date(new Date().setDate(new Date().getDate() - 30))).join('-'),
      searchEnd: toDateStrArr(new Date()).join('-'),
      statsData: {}
    }
  },

  mounted (){
    this.load()
  },

  watch: {
    // 监视编辑目标
    editTarget (val){
      if(val === null){   // 变为null时说明点击了清空按钮
        this.date = ''
        this.weight = ''
      }else{
        this.date = val.date
        this.weight = val.value
      }
    },

    selectedTab (val){
      if(val === 'stats'){
        this.getStatsData()
      }
    }
  },

  methods: {
    // 载入数据
    load (){
      _request({
        url: 'cjsj/weightIndex'
      }).then(({data}) =>{
        if(data.result){
          this.data = data.ret.data
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
    
    // 开启时间选择器
    openDateSelector (){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',

        onConfirm: val =>{
          this.date = val
        }
      })
    },

    // 判断体重是否合法
    testWeight (val, showMsg = true){
      if(val < 20 || val > 300){
        showMsg && this.$bus.$emit('vux.toast', '体重的范围必须在20~300kg之间')
        return false
      }
      return true
    },

    // 添加
    add (){
      if(!this.date){
        this.$bus.$emit('vux.toast', '请选择日期')
        return
      }
      if(!this.weight){
        this.$bus.$emit('vux.toast', '体重不能为空')
        return
      }
      if(!this.testWeight(this.weight)){ return }
      _request({
        url: 'cjsj/addWeight',
        method: 'post',
        data: {
          date: this.date,
          value: this.weight
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '添加成功')
          this.load()
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

    // 修改
    edit (item){
      if(!this.weight){
        this.$bus.$emit('vux.toast', '体重不能为空')
        return
      }
      if(!this.testWeight(this.weight)){ return }
      _request({
        url: 'cjsj/changeWeight',
        method: 'post',
        data: {
          id: this.editTarget.id,
          date: this.date,
          value: this.weight
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '修改成功')
          this.load()
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    },

    // 删除
    del (item){
      _request({
        url: 'cjsj/delWeight',
        method: 'post',
        data: {
          id: item.id
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '删除成功')
          this.load()
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

    // 打开搜索的开始时间设置菜单
    openDateSelectorForSearchBegin (){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',

        onConfirm: val =>{
          this.searchBegin = val
        }
      })
    },

    // 打开搜索的结束时间设置菜单
    openDateSelectorForSearchEnd (){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',

        onConfirm: val =>{
          this.searchEnd = val
        }
      })
    },

    getStatsData (type){
      var beginObj = toDateObj(this.searchBegin),
      endObj = toDateObj(this.searchEnd)
      if(beginObj > endObj){
        this.$bus.$emit('vux.toast', '开始时间不能晚于结束时间')
        return
      }

      _request({
        url: 'cjsj/statisticWeight',
        params: {
          start: this.searchBegin,
          end: this.searchEnd
        }
      }).then(({data}) =>{
        if(data.result){
          var {dates, values} = data.ret
          this.statsData = dates.map((val, ind) => ({
            date: val,
            value: values[ind] + 'kg'
          }))
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

  .form-btns{
    text-align: center;
    margin-top: 10px;

    .addBtn, .clearBtn{
      display: inline-block;
      padding: 5px 15px;
      .themeBtn;
      border-radius: 10px;
      margin: 0 5px;
    }
  
    .clearBtn{
      background-color: #ccc;
    }
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

.search{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  .block{
    width: 100px;
    @height: 30px;
    height: @height;
    line-height: @height;
    text-align: center;
    background-color: #eee;
    display: inline-block;
    padding: 0 5px;
    vertical-align: middle;
    margin: 0 5px;
    border-radius: 10px;
  }

  .searchBtn{
    color: @theme;
    font-size: 16px;
    margin-left: 10px;
  }
}

.stats-table{
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  margin-top: 30px;
  
  td{
    border: 1px #b5d6e6 solid;
    padding: 10px 0;
  }
}

.chart{
  margin-top: 30px;
}

.noData{
  text-align: center;
  font-size: 18px;
  margin-top: 30px;
}
</style>
