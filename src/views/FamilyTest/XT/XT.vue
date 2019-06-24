<template>
  <div class="com-container">
    <vue-header :title="'血糖' +  (selectedTab === 'collect' ? '采集' : '统计')">
      <!-- <div class="infoBtn" slot="right"
        @click="toView('family_test/explain', { query: { type: '' } })"
      >检测说明</div> -->
    </vue-header>
    <view-box>
      <vux-checker v-model="selectedTab"
        class="checkers-container" 
        default-item-class="checkers"
        selected-item-class="selected"
      >
        <checker-item value="collect">采集</checker-item>
        <checker-item value="stats" @click.native="getStatsData('withTab')">统计</checker-item>
      </vux-checker>

      <inline-loading v-if="tableData === null"></inline-loading>
      <table class="collect-table" v-if="selectedTab === 'collect' &&  tableData">
        <tr>
          <td>时间段</td>
          <td>{{ date[2].join('/') }}</td>
          <td>{{ date[1].join('/') }}</td>
          <td>{{ date[0].join('/') }}</td>
        </tr>
        <tr v-for="(pointer, index) in XT_Pointer" :key="index">
          <td>{{ pointer.type_name }}</td>
          <td 
            @click="toCollectXT(date[2], pointer, tableData[2][index])"
            :class="{ red: is_XT_Danger(tableData[2][index]) }"
          >{{ tableData[2][index] | showData }}</td>
          <td 
            @click="toCollectXT(date[1], pointer, tableData[1][index])"
            :class="{ red: is_XT_Danger(tableData[1][index]) }"
          >{{ tableData[1][index] | showData }}</td>
          <td
            @click="toCollectXT(date[0], pointer, tableData[0][index])"
            :class="{ red: is_XT_Danger(tableData[0][index]) }"
          >{{ tableData[0][index] | showData }}</td>
        </tr>
      </table>

      <template v-if="selectedTab === 'stats' &&  statsData">
        <div class="search">
          <div class="begin block" @click="openDateSelectorForSearchBegin">{{ searchBegin }}</div>
          <span> - </span>
          <div class="end block" @click="openDateSelectorForSearchEnd">{{ searchEnd }}</div>
          <div class="searchBtn" @click="getStatsData('withSearch')">搜索</div>
        </div>
        <table class="stats-table">
          <tr><td>监测总次数</td><td>{{ statsData.total_num }}</td></tr>
          <tr><td>空腹监测次数</td><td>{{ statsData.empty_stomach_num }}</td></tr>
          <tr><td>餐前监测次数</td><td>{{ statsData.before_meal_num }}</td></tr>
          <tr><td>低血糖次数</td><td>{{ statsData.glycopenia_num }}</td></tr>
          <tr><td>高血糖次数</td><td>{{ statsData.hyperglycaemia_num }}</td></tr>
          <tr><td>达标率</td><td>{{ statsData.reaching_rate }}</td></tr>
        </table>
      </template>
    </view-box>
    <readonly-mask minus="100px"></readonly-mask>
  </div>
</template>

<script>
import { Checker, CheckerItem } from 'vux'

var bu_Wei = val => val < 10 ? '0' + val : val    // 小于10的补前置0

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

// 获取日期范围，格式：[年, 月, 日]
// count为负数时，向之前的日期取值
function getDateRangeByStr(begin, count){
  begin = toDateObj(begin)

  var result = [toDateStrArr(begin)]
  if(count > 0){
    for(let i=0; i < count; i++){
      begin.setDate(begin.getDate() + 1)
      result.push(toDateStrArr(begin))
    }
  }else{
    for(let i=0; i < Math.abs(count); i++){
      begin.setDate(begin.getDate() - 1)
      result.push(toDateStrArr(begin))
    }
  }

  return result
}

export default {
  components: {
    VuxChecker: Checker, CheckerItem
  },

  filters: {
    showData (val){
      return val ? val.value : '未采集'
    }
  },

  data (){
    return {
      // 计算最近三天日期
      date: (function(){
        var result = []
        var date = new Date()
        result.push(toDateStrArr(date))
        date.setDate(date.getDate() - 1)
        result.push(toDateStrArr(date))
        date.setDate(date.getDate() - 1)
        result.push(toDateStrArr(date))
        return result
      })(),
      
      selectedTab: 'collect',

      tableData: null,         // 列表数据
      XT_Pointer: [],       // 血糖时间点数据

      statsData: null,      // 统计数据
      searchBegin: '',      // 统计搜索时间段开始
      searchEnd: ''         // 结束
    }
  },

  mounted (){
    this.getXT_Pointer()
    this.getData()
    
    var dateRange = getDateRangeByStr(toDateStrArr(new Date()).join('-'), -6)
    this.searchBegin = dateRange[dateRange.length - 1].join('-')
    this.searchEnd = dateRange[0].join('-')
  },

  methods: {
    // 获取时间点
    getXT_Pointer (){
      _request({
        url: 'cjsj/getXTPoint',
      }).then(({data}) =>{
        this.XT_Pointer = data.ret
      }).catch(e =>{
        console.log(e)
      })
    },

    // 获取最近三天的血糖记录
    getData (){
      Promise.all([
        _request({
          url: 'cjsj/getXTByDate',
          params: { date: this.date[0].join('-') }
        }),
        _request({
          url: 'cjsj/getXTByDate',
          params: { date: this.date[1].join('-') }
        }),
        _request({
          url: 'cjsj/getXTByDate',
          params: { date: this.date[2].join('-') }
        }),
      ]).then(data =>{
        this.tableData = data.map(val => val.data.ret)
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 前往收集血糖页面
    toCollectXT (date, pointer, data){
      this.$baseToView('collect_xt', {
        params: { date, pointer, data }
      })
    },

    // 获取统计数据，通过type判断函数的触发形式
    // tab：若检测到开始时间晚于结束时间，则自动纠正为默认值
    // search：更新数据后显示toast，若检测到开始时间晚于结束时间，则进行提示
    getStatsData (type){
      var beginObj = toDateObj(this.searchBegin),
      endObj = toDateObj(this.searchEnd)
      if(beginObj > endObj){
        if(type === 'withSearch'){
          this.$bus.$emit('vux.toast', '开始时间不能晚于结束时间')
          return
        }else if(type === 'withTab'){
          var dateRange = getDateRangeByStr(toDateStrArr(new Date()).join('-'), -6)
          this.searchBegin = dateRange[dateRange.length - 1].join('-')
          this.searchEnd = dateRange[0].join('-')
        }
      }

      _request({
        url: 'cjsj/xtStatistic',
        params: {
          start: this.searchBegin,
          end: this.searchEnd
        }
      }).then(({data}) =>{
        if(data.result){
          this.statsData = data.ret
          type === 'withSearch' && this.$bus.$emit('vux.toast', {
            type: 'success',
            text: '数据已更新'
          })
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
    
    is_XT_Danger (val){
      return val && (parseFloat(val.value) > val.max || parseFloat(val.value) < val.min)
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

.collect-table{
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  margin-top: 10px;

  td{
    border: 1px #b5d6e6 solid;
    padding: 10px 0;
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

.red{
  color: @danger;
}
</style>
