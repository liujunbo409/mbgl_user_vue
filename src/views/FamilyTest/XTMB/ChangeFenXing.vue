<template>
  <div class="com-contianer">
    <vue-header title="切换分型"></vue-header>
    <vux-group>
      <vux-selector v-model="selected" title="分型"
        placeholder="未选择"
        :options="data.map(val => ({ key: val.id, value: val.name }))"
      ></vux-selector>
    </vux-group>
    <div class="com-mainBtn-container">
      <x-button @click.native="save">保存</x-button>
    </div>
  </div>
</template>

<script>
import { Selector, XButton } from 'vux'

export default {
  components: {
    VuxSelector: Selector, XButton
  },

  data (){
    return {
      data: [],
      selected: '',
    }
  },

  mounted (){
    _request({
      url: 'xtmb/getStyleList'
    }).then(({data}) =>{
      if(data.result){
        this.data = data.ret
        this.data.some(val => {
          if(val.pitch){
            this.selected = val.id
            return true
          }
        })
      }else{
        this.$bus.$emit('vux.toast', data.message)
      }
    })

    this.$vux.confirm.show({
      content: '请根据自身情况如实填写，是否确认修改？',
      onCancel: () => this.$router.back()
    })
  },

  methods: {
    save (){
      if(!this.selected){
        this.$bus.$emit('vux.toast', '必须选择分型')
        return
      }

      _request({
        url: 'xtmb/qiehuan',
        method: 'post',
        data: {
          id: this.selected
        }
      }).then(({data}) =>{
        if(data.result){
          this.$router.back()
          this.$bus.$emit('vux.alert', '保存成功')
        }else{
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: data.message
          })
        }
      }).catch(e =>{
        console.log(e)
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

</style>
