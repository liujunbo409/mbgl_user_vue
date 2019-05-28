<template>
  <article-view v-bind="{ art, source }">
    <footer slot="innerFooter">
      <div class="btn" @click="toTest">文章考核</div>
      <div class="btn" @click="$baseToView('feedback', { params: { moduleId: art.id } })">文章反馈</div>
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
      this.stageId = this.$route.params.stageId
      this.load()
    }
  },

  methods: {
    init (){
      this.art = null
      this.illId = ''
      this.source = null
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
    },

    toTest (){
      this.$baseToView('test', { 
        params: { 
          articleId: this.art.id,
          stageId: this.stageId
        }
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
  margin: 20px 0;
}

.btn{
  display: inline-block;
  padding: 6px 30px;
  border-radius: 30px;
  background-color: @theme;
  color: white;
}
</style>
