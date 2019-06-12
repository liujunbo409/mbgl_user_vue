<template>
  <div class="com-container">
    <vue-header title="选择疾病"></vue-header>    
    <vux-checker v-model="selected"
      class="checkers-container" 
      default-item-class="checkers"
      selected-item-class="selected"
    >
      <checker-item v-for="({id, name}, index) in list" :key="index" :value="id">{{ name }}</checker-item>
    </vux-checker>
    <div class="noData" v-if="status === 3 && !list.length">已经添加了全部的疾病</div>
    <div class="mainBtn-container">
      <x-button v-if="list.length" @click.native="submit" :disabled="disabled">确定选择</x-button>
      <x-button v-else @click.native="$router.back" :disabled="disabled">点击返回</x-button>
    </div>
  </div>
</template>

<script>
import { XButton, Checker, CheckerItem } from 'vux'

export default {
  components: {
    XButton, VuxChecker: Checker, CheckerItem
  },

  data (){
    return {
      list: [],     // 可选疾病列表
      selected: '',
      status: 1,
      disabled: false
    }
  },

  mounted (){
    // 载入全部疾病
    _request({
      url: 'jkda/otherIll'
    }).then(({data}) =>{
      if(data.result){
        this.list = data.ret
      }
    }).catch(e =>{
      console.log(e)
    })
  },

  methods: {
    // 提交
    submit (){
      this.disabled = true
      _request({
        url: 'jkda/addIll',
        method: 'post',
        data: {
          ill_id: this.selected
        }
      }).then(({data}) =>{
        this.disabled = false
        if(data.result){
          this.$bus.$emit('vux.toast', {
            type: 'success',
            text: '添加成功'
          })
          this.$toView('health')
          Vue.nextTick(() =>{
            this.$bus.$emit('vux.toast', {
              width: '10em',
              text: '请点击刚刚选择的疾病，并填写问卷'
            })
          }, 2000)
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        console.log(e)
        this.disabled = false
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.option{

}

.mainBtn-container{
  padding: 0 10px;
  margin-top: 50px;
}

.noData{
  line-height: 60px;
  text-align: center;
  background-color: white;
  font-size: 18px;
}

.checkers-container{
  text-align: center;
  padding-top: 50px;
}

.checkers{
  padding: 7px 14px;
  border: 1px #ccc solid;
  border-radius: 20px;
  margin: 10px;
  margin-top: 0;
  background-color: white;
}

.selected{
  background-color: @theme;
  border-color: @theme;
  color: white;
}
</style>
