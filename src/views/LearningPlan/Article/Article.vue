<template>
  <article-view v-bind="{ art, source }">
    <footer slot="innerFooter">
      <div class="btn" @click="$baseToView('test')">文章考核</div>
      <div class="btn" @click="$baseToView('feedback')">文章反馈</div>
    </footer>
  </article-view>
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
      illId: '',
      source: null,
    }
  },

  activated (){
    if(this.$route.params.article){
      this.art = this.$route.params.article
      this.illId = this.$route.params.illId
      this.load()
    }
  },

  methods: {
    load (){
      Promise.all([
        _request({
          url: 'xxjh/article',
          params: {
            ill_id: this.illId,
            article_id: this.art.id
          }
        }),

        _request({
          url: 'article/source',
          params: { article_id: this.art.id }
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
footer{
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
}

.btn{
  display: inline-block;
  padding: 6px 30px;
  border-radius: 30px;
  background-color: @theme;
  color: white;
}
</style>
