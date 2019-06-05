<template>
  <div class="item">
    <div class="line">
      <div class="left">
        <p>{{ data.name }}</p>
      </div>
      <div class="right">
        <div class="editBtn" @click="$emit('onClickEdit')">编辑</div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['data'],

  data (){
    return {

    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.item{
  min-height: 35px;
  padding: 10px;
  background-color: white;
  border-bottom: 1px #ccc solid;
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .line{
    display: flex;
    width: 100%;
    justify-content: space-between;    

    .left, .right{
      display: flex;
      align-items: center;
    }

    .editBtn{
      display: inline-block;
      padding: 3px 10px;
      background-color: white;
      color: @theme;
      border: 1px @theme solid;
      border-radius: 5px;
    }
  }


}
</style>
