<template>
  <div class="mask" :style="`z-index:${zIndex}`"></div>
</template>

<script>
export default {
  props: {
    zIndex: {
      default: 99
    }
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
.mask{
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: black;
  opacity: 0.2;
  z-index: 99;
}
</style>
