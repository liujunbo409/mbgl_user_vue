<template>
  <div class="com-container">
    <vue-header title="采集血糖"></vue-header>
    <vux-group class="com-group-noMarginTop">
      <vux-cell title="日期" :value="date.join(' / ')"></vux-cell>
      <vux-cell title="时间段" :value="pointer.type_name"></vux-cell>
      <vux-datetime title="测量时间" v-model="collectTime" format="HH:mm"></vux-datetime>
      <x-input title="血糖数值" v-model="XT_value" text-align="right" type="number"
        placeholder="待填写"
        :is-type="testXT"
      ></x-input>   
      <cell-box class="limitTarget">
        <span class="title">控制目标</span>
        <span>
          <span class="bg-gray">{{ min }}</span> - <span class="bg-gray">{{ max }}</span>
        </span>
        <span class="changeBtn" @click="$baseToView('xtmb')">点此更改</span>
      </cell-box>
    </vux-group>
    <div class="com-mainBtn-container">
      <x-button @click.native="save">保存</x-button>
    </div>
  </div>
</template>

<script>
import { Datetime, XInput, CellBox, XButton } from 'vux'
import CellInput from '@c/cell/CellInput'
export default {
  components: {
    VuxDatetime: Datetime,
    XInput, CellBox, XButton,
    CellInput
  },

  data (){
    return {
      date: [],   // 日期
      pointer: {},    // 采集时间信息对象
      collectTime: '',  // 采集时间
      XT_value: '',   // 血糖值
      data: {}, //  之前已填写的信息，没有时为null
      min: 0,   // 控制目标最小值
      max: 0    // 控制目标最大值
    }
  },

  activated (){
    if(this.$route.params.date){
      this.init()
      this.date = this.$route.params.date
      this.pointer = this.$route.params.pointer
      this.data = this.$route.params.data
      if(this.data){
        this.XT_value = this.data.value
      }
    }
    this.get_XT_Target()
  },

  methods: {
    // 初始化
    init (){
      this.XT_value = ''
      this.collectTime = ''
      this.min = 0
      this.max = 0
    },

    // 获取血糖目标
    get_XT_Target (){
      _request({
        url: 'cjsj/getXTCJIndex',
        params: {
          date: this.date.join('-'),
          type: this.pointer.type
        }
      }).then(({data}) =>{
        this.max = data.ret.max
        this.min = data.ret.min
      }).catch(e =>{
        console.log(e)
      })
    },

    // 判断血糖值是否合法，Xinput也要用此函数
    testXT (val){
      if(val > 500  || val < 0){
        return { valid: false, msg: '血糖值必须在0~500之间' }
      }

      return { valid: true }
    },

    // 保存
    save (){
      if(!this.collectTime){
        this.$bus.$emit('vux.toast', '请填写采集时间')
        return
      }

      var testXT = this.testXT(this.XT_value)
      if(!testXT.valid){
        this.$bus.$emit('vux.toast', testXT.msg)
        return
      }

      _request({
        url: 'cjsj/cjXT',
        method: 'post',
        data: {
          date: this.date.join('-'),
          type: this.pointer.type,
          value: this.XT_value,
          min: this.min,
          max: this.max
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.alert', '保存成功')
          this.$baseToView('xt')
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
    }
  },
}
</script>

<style lang="less" scoped>
.bg-gray{
  display: inline-block;
  padding: 5px 20px;
  font-size: 13px;
  background-color: #eee;
  border-radius: 20px;
}

.limitTarget{
  justify-content: space-between;
}

.changeBtn{
  display: inline-block;
  padding: 5px 10px;
  background-color: @theme;
  color: white;
  border-radius: 7px;
  font-size: 13.5px;
}
</style>
