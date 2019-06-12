<template>
  <div class="com-container">
    <vue-header title="当前目标">
      <div class="infoBtn" slot="right" @click="toView('family_test/xtmb/info')">检测说明</div>
    </vue-header>
    <view-box>
      <inline-loading v-if="status === 2"></inline-loading>
      <main v-if="status === 3">
        <header>
          <span class="fen_Xing_Name">{{ data.fenxingname }}</span>
          <span class="changeBtn" @click="$toView('family_test/xtmb/change_fen_xing')">切换分型</span>
        </header>
        <p class="subtitle">
          <vux-icon type="warn"></vux-icon>
          <span class="text">各类糖尿病血糖标准</span>
        </p>

        <table class="table">
          <tr>
            <td colspan="3">
              <span>目标开始时间：{{ data.start_time || '获取中' }}</span>
              <span></span>
            </td>
          </tr>
          <tr>
            <td>时间段</td>
            <td>目标下限</td>
            <td>目标上限</td>
          </tr>
          <tr v-for="(line, index) in data.taglist" :key="index">
            <td>{{ line.tag_name }}</td>
            <td>
              <div class="com-input-container">
                <input type="number" v-model.number.trim="line.min" min="0" max="500">
              </div>
            </td>
            <td>
              <div class="com-input-container">
                <input type="number" v-model.number.trim="line.max" min="0" max="500">
              </div>
            </td>
          </tr>
        </table>

        <div class="mainBtn-container">
          <x-button @click.native="save">保存</x-button>
        </div>
      </main>
    </view-box>
    <readonly-mask></readonly-mask>
  </div>
</template>

<script>
import { Icon, XButton } from 'vux'

export default {
  components: {
    VuxIcon: Icon, XButton
  },

  data (){
    return {
      data: [],
      status: 1,
      table: [],
    }
  },

  mounted (){
    this.loadData()
  },

  methods: {
    // 加载数据
    loadData (){
      this.status = 2
      _request({
        url: 'xtmb/getXTMBList'
      }).then(({data}) =>{
        if(data.result){
          this.status = 3
          this.data = data.ret
        }else{
          this.status = 0
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.status = 0
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 保存数据
    save (){
      var stop = this.data.taglist.some(val =>{
        var {min, max ,tag_name} = val
        if(min > 501 || min < 0 || max > 501 || max < 0){
          this.$bus.$emit('vux.toast', '所有上下限必须在0~500之间')
          return true
        }
        
        console.log(min, max)
        if(min > max){
          this.$bus.$emit('vux.toast', `${tag_name}时间段的下限不能大于上限`)
          return true
        }
      })
      if(stop){ return }

      _request({
        url: 'xtmb/indexPost',
        method: 'post',
        data: {
          start_time: this.data.start_time,
          id: this.data.id,
          data: JSON.stringify(this.data.taglist)
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.alert', '信息修改成功')
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.com-container{
  background-color: white;
}

main{
  padding: 0 10px;
}

header{
  margin-top: 30px;
  text-align: center;
  position: relative;

  .fen_Xing_Name{
    font-size: 18px;
  }

  .changeBtn{
    color: @theme;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.subtitle{
  margin-top: 20px;
  
  > *{
    vertical-align: middle;
  }

  .text{
    color: #aaa;
  }
}

.table{
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-top: 20px;
  table-layout: fixed;

  tr {
    width: 33.33%;
  }

  td{
    border: 1px #ccc solid;
    padding: 10px 0;
  }
}

.mainBtn-container{
  padding: 0 30px;
  margin-top: 30px;
}
</style>
