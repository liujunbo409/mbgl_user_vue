<template>
  <article-view v-bind="{ art, source }"></article-view>
</template>

<script>
import ArticleView from '@c/layout/ArticleView'

export default {
  components: {
    ArticleView
  },

  data (){
    return {
      art: null,
      articleId: '',
      illId: '',
      stageId: '',
      source: null,
    }
  },

  activated (){
    if(this.$route.params.illId){
      this.init()
      this.articleId = this.$route.params.articleId
      this.illId = this.$route.params.illId
      this.load()
    }
  },

  methods: {
    init (){
      this.art = null     // 文章数据
      this.illId = ''
      this.source = null    // 参考文献
      this.articleId = ''
    },

    // 载入文章数据
    load (){
      Promise.all([
        _request({
          url: 'xxjh/article',
          params: {
            ill_id: this.illId,
            article_id: this.articleId
          }
        }),

        _request({
          url: 'article/source',
          params: { article_id:this.articleId }
        })
      ]).then(([{data: art}, {data: source}]) =>{
        this.art = art.ret
        this.source = source.ret
      })
    }
  }
}
</script>

<style lang="less" scoped>

</style>
