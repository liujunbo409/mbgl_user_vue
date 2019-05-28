<template>
  <div class="com-container">
    <vue-header title="错题解析"></vue-header>
    <view-box class="com-header-view">
      <div v-for="({ title, content }, index) in data" :key="index" class="block">
        <p class="title">
          <strong class="number">{{ index + 1 }}. </strong>
          <span class="text">{{ title }}</span>
        </p>
        <div class="content">{{ content }}</div>
      </div>

      <div class="com-mainBtn-container">
        <x-button @click.native="isFromExam ? $toView('learning_plan') :$baseToView('article')">重新学习</x-button>
        <x-button @click.native="$router.back">重新考核</x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
import { XButton } from 'vux'
export default {
  components: {
    XButton
  },

  data (){
    return {
      data: this.$route.params.data,
      isFromExam: this.$route.params.isFromExam
    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>
.block{
  margin: 10px 5px;
  font-size: 16px;

  .title{
    margin-left: 5px;
  }

  .content{
    margin-top: 10px;
    padding-left: 1.2em;
  }
}
</style>
