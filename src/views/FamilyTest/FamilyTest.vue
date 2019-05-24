<template>
  <div class="com-container">
    <vue-header title="家庭检测"></vue-header>
    <vux-grid :col="4" :cols="1" class="body"
      :show-lr-borders="false"
      :show-vertical-dividers="false"
    >
      <grid-item @click.native="$toView('')" label="血糖目标">
        <img slot="icon" :src="require('@img/xtmb.png')">
      </grid-item>
      <grid-item @click.native="$toView('')" label="血糖">
        <img slot="icon" :src="require('@img/xt.png')">
      </grid-item>
      <grid-item @click.native="$toView('')" label="体重">
        <img slot="icon" :src="require('@img/tz.png')">
      </grid-item>
    </vux-grid>
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

  }
}
</script>

<style lang="less" scoped>

</style>
