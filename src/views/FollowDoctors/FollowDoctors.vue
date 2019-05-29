<template>
  <div class="com-container">
    <vue-header title="关注列表"></vue-header>
    <vux-group class="com-group-noMarinTop">
      <vux-cell v-for="(item, index) in data" :key="index" :is-link="true"
        :title="item.real_name"
      ></vux-cell>
    </vux-group>
  </div>
</template>

<script>
export default {
  data (){
    return {
      data: []
    }
  },

  methods: {
    load (){
      _request({
        url: 'attention/getAttentionDoctors'
      }).then(({data}) =>{
        if(data.result){
          this.data = data.ret
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
  }
}
</script>

<style lang="less" scoped>

</style>
