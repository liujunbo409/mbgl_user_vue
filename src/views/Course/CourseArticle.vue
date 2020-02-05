<template>
  <div class="com-container">
    <x-header :left-options="{
        backText:'',
        preventGoBack: back !== null
      }" @on-click-back="back && back()" class="header">
      <slot name="right" slot="right">
        定制个性化的疾病知识学习计划
      </slot>
    </x-header>
    <main :class="{ hasFooter: $slots.default, visible: art && source }" :style="{
      ...(minusHeight ? { height: `calc(100% - ${minusHeight}${isRemoteMode ? '- 30px' : ''})` } : {})
    }">
      <div class="main-container" v-if="art && source">
        <h2 class="title">{{ `${art.title}(${art.style_str})` }}</h2>
        <p class="author">{{ art.author }}&nbsp;{{ art.updated_at }}</p>
        <div class="video-container" v-if="art.video_url">
          <div class="video-title" @click="visibleVideoPlayer = !visibleVideoPlayer">
            <img src="@img/btn/video.png" width="40px">
            <span>视频</span>
            <div class="video-switch">
              <span>{{ visibleVideoPlayer ? '收起' : '展开' }}</span>
              <img src="@img/btn/video-up.png" class="video-player-btn" v-if="visibleVideoPlayer">
              <img src="@img/btn/video-down.png" class="video-player-btn" v-else>
            </div>
          </div>
          <video-player :src="art.video_url" v-if="visibleVideoPlayer"></video-player>
        </div>
        <div class="content" v-html="art.html"></div>

        <p class="source-title com-fillTitle" v-if="source && source.length">参考文献</p>
        <div class="source" v-if="source">
          <p v-for="(item, index) in source" :key="index">
            <span class="count" v-text="`[${index + 1}].`"></span>&nbsp;
            <span class="text">{{ item.source_text }}</span>
          </p>
        </div>

        <p class="nexus-title com-fillTitle" v-if="nexus && nexus.length">关联文章</p>
        <div class="nexus" v-if="nexus">
          <p v-for="(item, index) in nexus" :key="index" @click="$emit('onClickNexus', item)">
            <span class="text">{{ `${item.name}（${item.style_str}）` }}</span>
          </p>
        </div>

        <table class="near">
          <tr v-if="near">
            <td @click="$emit('onClickLast', last)">
              <p>上一篇</p>
              <span v-if="lastStatus === 'success'">{{ last.title }}</span>
              <span v-if="lastStatus === 'loading'">加载中</span>
              <span v-if="lastStatus === 'error'">加载失败，点击重试</span>
            </td>
            <td @click="$emit('onClickNext', next)">
              <p>下一篇</p>
              <span v-if="nextStatus === 'success'">{{ next.title }}</span>
              <span v-if="nextStatus === 'loading'">加载中</span>
              <span v-if="nextStatus === 'error'">加载失败，点击重试</span>
            </td>
          </tr>
          <tr v-if="art.voice_url !== null">
            <td colspan="2">
              <div class="audio-container">
                <span class="audioText">{{ art.title }}</span>
                <audio-player :src="art.voice_url"></audio-player>
              </div>
            </td>
          </tr>
        </table>
        <slot name="innerFooter"></slot>
      </div>
    </main>
    <slot>
      <footer>
        <div class="mainBtn-container">
          <x-button @click.native="toLead">完善资料定制我的学习计划</x-button>
        </div>
      </footer>
    </slot>
  </div>
</template>

<script>
  import AudioPlayer from '@c/media/AudioPlayer'
  import VideoPlayer from '@c/media/VideoPlayer'
  import {XButton, XHeader} from 'vux'

  export default {
    components: {

      AudioPlayer, VideoPlayer, XButton, XHeader
    },
    props: {
      // art: {},
      // source: {},
      minusHeight: {},
      near: {
        default: false
      },
      next: {},
      last: {},
      nextStatus: {},
      lastStatus: {},
      nexus: {},
      back: {
        default: null
      }
    },
    data() {
      return {
        art: null,
        articleId: '',
        illId: '',
        source: null,
        visibleVideoPlayer: false
      }
    },

    activated() {
      if (this.$route.params.illId) {
        this.init();
        this.articleId = this.$route.params.articleId;
        this.illId = this.$route.params.illId;
        this.load();
      }

    },
    computed: {
      isRemoteMode() {
        return !!this.$store.state.user.userInfo2
      }
    },


    methods: {
      init() {
        this.art = null     // 文章数据
        this.illId = ''
        this.source = null    // 参考文献
        this.articleId = ''
      },

      // 载入文章数据
      load() {
        Promise.all([
          _request({
            url: 'article/getById',
            params: {
              ill_id: this.illId,
              article_id: this.articleId
            }
          }),

          _request({
            url: 'article/source',
            params: {article_id: this.articleId}
          })
        ]).then(([{data: art}, {data: source}]) => {
          this.art = art.ret
          this.source = source.ret
          console.log(`this.art == ${JSON.stringify(art)}`)
          console.log(`this.source ==${JSON.stringify(this.source)}`)
        })
      },

      toLead() {
        this.$toView('lead')
      }
    }
  }
</script>

<style lang="less" scoped>
  main {
    visibility: hidden;
    height: ~'calc(100% - 46px)';
    overflow: auto;

    .main-container {
      height: 100%;
      box-sizing: border-box;
      padding: 15px 10px;
    }

    .title {
      text-align: center;
      margin-bottom: 15px;
    }

    .author {
      text-align: center;
      font-size: 14px;
      color: #666;
    }

    .video-container {
      padding: 5px;
      padding-top: 0;
      box-sizing: border-box;
      border: 1px #ccc solid;
      text-align: center;


      .video-title {
        font-size: 18px;
        position: relative;

        > * {
          vertical-align: middle;
        }
      }

      .video-switch {
        padding-right: 10px;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);

        > * {
          vertical-align: middle;
        }

        .video-player-btn {
          width: 30px;
        }
      }
    }

    .content {
      padding: 10px;
      font-size: 16px;
    }

    .source-title, .nexus-title {
      font-size: 16px;
      line-height: 26px;
      border-radius: 10px;
    }

    .source {
      text-indent: 10px;
      padding: 5px;
    }
  }

  .visible {
    visibility: visible;
  }

  // 减去上栏(46px) + 下栏(默认50px)
  .hasFooter {
    height: ~'calc(100% - 46px - 50px)';
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
    // position: absolute;
    bottom: 0;
    width: 90%;
    margin: 0 auto;

  }

</style>
