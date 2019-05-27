<template>
  <div class="com-container">
    <vue-header :title="data.title"></vue-header>
    <article-view v-bind="{ art: data, source }"></article-view>
  </div>
</template>

<script>
import ArticleView from '@c/layout/ArticleView'

export default {
  props: ['data'],

  components: {
    ArticleView
  },

  data (){
    return {
      source: [],

    }
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
