<template>
  <vue-main></vue-main>
</template>

<script>
import VueMain from '@v/Main/Main'

export default {
  components: {
    VueMain
  },

  data (){
    return {
      blobUri: '',  
    }
  },

  mounted (){
   
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import '~@/styles/main.less';

</style>
