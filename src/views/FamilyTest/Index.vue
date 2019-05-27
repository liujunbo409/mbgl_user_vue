<template>
  <div class="com-container">
    <vue-header title="家庭检测"></vue-header>
    <vux-grid :col="1" :cols="4" class="body"
      :show-lr-borders="false"
      :show-vertical-dividers="false"
    >
      <grid-item @click.native="toXTMB" label="血糖目标">
        <img slot="icon" :src="require('@img/btn/xtmb.png')">
      </grid-item>
      <grid-item @click.native="$toView('')" label="血糖">
        <img slot="icon" :src="require('@img/btn/xt.png')">
      </grid-item>
      <grid-item @click.native="$toView('')" label="体重">
        <img slot="icon" :src="require('@img/btn/tz.png')">
      </grid-item>
    </vux-grid>
    <div class="banner">
      <p>定期进行健康监测</p>
      <p>更好管理您的健康</p>
      <img src="https://org.modao.cc/uploads4/images/3302/33023022/v2_ppzahn.png" style="min-height:250px">
    </div>
  </div>
</template>

<script>
import { Grid, GridItem } from 'vux'
export default {
  components: {
    VuxGrid: Grid,
    GridItem
  },

  data (){
    return {

    }
  },

  methods: {
    toXTMB (){
      _request({
        url: 'xtmb/accessXTMB'
      }).then(({data}) =>{
        if(data.result){
          this.$toView('family_test/xtmb')
        }else{
          this.$bus.$emit('vux.toast', '您没有进入该功能的权限')
        }
      }).catch(e =>{
        console.log(e)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.body{
  background-color: white;
}
.banner{
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;

  > p{
    font-size: 26px;
    color: @theme;
    text-align: center;
    margin: 5px 0;
  }

  > img{
    width: 80%;
    display: table;
    margin: 0 auto;
  }
}
</style>
