<template>
  <div>
    <x-header :left-options="{
        backText:ill_name,
        preventGoBack: back !== null
      }" @on-click-back="back && back()" class="header">
      <slot name="right" slot="right">
        定制个性化的疾病知识学习计划
      </slot>
    </x-header>
    <div class="selectIll com-onMask">
      <span>当前学习疾病：</span>
      <span class="selectedIll">{{ ill_name }}</span>
    </div>

    <div>
      <loading :show="!show_flag" text=""></loading>
    </div>

    <vux-group class="com-group-noMarginTop" style="margin-bottom: 55px;" v-if="show_flag">
      <dir-item v-for="(item, index) in ill_article_list" :key="index"
                :title="item.catalog_name"
                :files="item.article_list"
                @onClickItem="file => toArticle(file)"
      ></dir-item>
    </vux-group>
    <footer style="display: flex;justify-content: center;">
      <div class="mainBtn-container">
        <x-button @click.native="toLead">完善资料定制我的学习计划</x-button>
      </div>
    </footer>
  </div>
</template>


<script>
  import {Tab, TabItem, XButton, XHeader,Loading} from 'vux'
  import DirItem from '@c/cell/CourseDirItem'

  export default {
    components: {
      VuxTab: Tab, TabItem, DirItem, XButton, XHeader,Loading
    },
    props: {
      back: {
        default: null
      }
    },

    data() {
      return {
        status: 1,
        ill_id: '', //疾病ID
        ill_name: '', //疾病名称
        ill_article_list: [],//疾病文章列表
        show_flag: false, //展示标识
      }
    },

    mounted() {

      this.ill_id = this.$route.query.ill_id;
      this.ill_name = this.$route.query.ill_name;
      console.log(`this.ill_id == ${this.ill_id};;this.ill_name==${this.ill_name}`);

      _request({
        url: 'articleMulu/getCompulsoryArticle',
        params: {
          ill_id: this.ill_id
        }
      }).then(res => {
        for (let retKey in res.data.ret) {
          let ill_article = {
            catalog_name: retKey,
            article_list: res.data.ret[retKey]
          }
          this.ill_article_list.push(ill_article);
        }
        this.show_flag = true;
      })

    },

    computed: {

    },

    watch: {

    },

    methods: {
      toArticle(art) {
        this.$toView('course/course_article', {
          params: {
            articleId: art.article_id,
            illId: art.ill_id
          }
        })
      },
      toLead() {
        this.$toView('lead')
      }
    }
  }
</script>

<style lang="less" scoped>
  .com-container {
    background-color: white;
  }

  .selectIll {
    line-height: 40px;
    padding: 0 10px;
    background-color: white;
    border-bottom: 1px #ccc solid;
    box-sizing: border-box;
    position: relative;

    > * {
      vertical-align: middle;
    }
  }

  .selectedIll {
    display: inline-block;
    width: 7em;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    @media screen and (max-width: 330px) {
      width: 3em;
    }
  }

  .selectOtherIllBtn {
    color: @theme;
    margin-left: 10px;
    float: right;
  }

  .illList {
    display: flex;
    width: 100%;
    background-color: #F0F2F5;
    flex-wrap: wrap;
    justify-content: space-around;
    padding-bottom: 28px;
    position: absolute;
    top: 100%;
    left: 0;

    > .illBlock {
      width: 28%;
      margin-top: 10px;
      line-height: 26px;
      background-color: white;
      text-align: center;
    }

    > .selected {
      background-color: @theme;
      color: white;
    }

    > .closeIllListBtn {
      position: absolute;
      right: 10px;
      bottom: 5px;
      color: @theme;
    }
  }

  .mask {
    position: fixed;
    top: 150px;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: black;
    opacity: 0.2;
    z-index: 99;
  }

  .gray {
    color: #999;
  }

  .stageTitle {
    text-align: center;
    margin-top: 30px;
  }

  .articleList-container {
    width: 95%;
    margin: 0 auto;
    margin-top: 10px;
    border-radius: 10px 10px 0 0;
    overflow: hidden;
  }

  .articleList {
    width: 100%;

    table-layout: fixed;
    border-collapse: collapse;
    text-align: center;

    option {
      display: block;
      width: 100%;
      text-align: center;
    }

    th, td {
      padding: 5px;
      border: 1px #b5d6e6 solid;
      background-color: #efefef;
    }

    tr:first-of-type {
      border-radius: 10px 10px 0 0;

      th {
        background-color: @theme;
        color: white;
        font-weight: normal;
      }

      th:first-child {
        text-align: left;
      }
    }

    tr:last-of-type {
      td {
        background-color: #ccc;
        border-color: #ccc;
      }

      .toArticleBtn {
        background-color: #666;
      }
    }

    .toArticleBtn {
      display: inline-block;
      padding: 5px 10px;
      background-color: @theme;
      color: white;
      border-radius: 5px;
    }
  }

  .near {
    width: calc(~'100% + 20px');
    margin: 0 -10px;
    border-collapse: collapse;
    text-align: center;

    td {
      border: 1px #ccc solid;
      padding: 5px;
      width: 50%;

      p {
        font-weight: bold;
      }
    }

    .audio-container {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .audioText {
        font-size: 18px;
        font-weight: bold;
        position: relative;
        top: -2px;
        margin-left: 10px;
      }
    }
  }

  .mainBtn-container {
    position: fixed;
    bottom: 10px;
    width: 90%;

  }

  footer {
    background: white;
    height: 100%
  }
</style>



