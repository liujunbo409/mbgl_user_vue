<template>
  <div>
    <x-header :left-options="{
        backText:showSelectedIllName,
        preventGoBack: back !== null
      }" @on-click-back="back && back()" class="header">
      <slot name="right" slot="right">
        定制个性化的疾病知识学习计划
      </slot>
    </x-header>
    <div class="selectIll com-onMask">
      <span>当前学习疾病：</span>
      <span class="selectedIll">{{ showSelectedIllName }}</span>
      <span class="selectOtherIllBtn" @click="visibleIllList = true">选择其他疾病</span>

      <div class="illList com-onMask" v-if="visibleIllList">
        <div class="illBlock" v-for="(item, index) in showIllList" :key="index"
             :class="{ hidden: !item.value, selected: illId === item.key }"
             @click="selectIll(item.key)"
        >{{ item.value }}
        </div>
        <div class="closeIllListBtn" @click="visibleIllList = false">取消</div>
      </div>
    </div>
    <div class="mask" v-if="visibleIllList"></div>

    <vux-group class="com-group-noMarginTop" style="margin-bottom: 55px;">
      <dir-item v-for="(item, index) in allStage" :key="index"
                :title="item.catalog_name"
                :files="allArticle[item.id]"
                @click.native="loadArticleByStageId(item.id)"
                @onClickItem="file => toArticle(item, file)"
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
  import {Tab, TabItem, XButton, XHeader} from 'vux'
  import DirItem from '@c/cell/DirItem'

  export default {
    components: {
      VuxTab: Tab, TabItem, DirItem, XButton, XHeader
    },
    props: {
      back: {
        default: null
      }
    },

    data() {
      return {
        illId: '',                // 当前选中疾病id
        selectedTab: 'active',    // 选中的tab
        illList: [],              // 疾病列表
        stage: {},                // 当前阶段
        stage_select_id: null,    // 当前阶段id
        stageArticle: {},         // 阶段下所有文章
        visibleIllList: false,    // 显示疾病选择列表
        examData: [],             // 考核数据
        allStage: [],             // 全部阶段
        last_stage: {},           // 上一阶段学习
        next_stage: {},           // 下一阶段学习
        allArticle: {},           // 全部阶段的全部文章
        status: 1,
      }
    },

    mounted() {

      this.loadIllList().then(() => {
        this.getSelectedIllId()
      })
    },

    computed: {
      // 疾病显示名
      showSelectedIllName() {
        if (!(this.illId && this.illList.length)) {
          return '读取中'
        }
        var selected = this.illList.filter(val => val.ill_id === this.illId);
        if (!selected.length) {
          return '未选择'
        } else {
          return selected[0].ill_name
        }
      },

      // 疾病选择列表
      showIllList() {
        var list = this.illList.map(val => ({key: val.ill_id, value: val.ill_name}));
        var needCount = 3 - list.length % 3
        for (let i = 0; i < needCount; i++) {
          list.push({key: '', value: ''})
        }
        return list
      },

      isRemoteMode() {
        return !!this.$store.state.user.userInfo2
      }
    },

    watch: {
      // 当疾病id改变时，重新加载（选择疾病功能）
      illId() {
        this.loadNowStage().then(() => this.loadStageArticle());
        this.loadAllStage()
      }
    },

    methods: {
      init() {
        this.last_stage = {};
        this.next_stage = {};
        this.stage = {};
        this.stageArticle = {};
      },
      // 获取选择的疾病id
      getSelectedIllId() {
        return new Promise((resolve, reject) => {
          _request({
            url: 'xxjh/nowIll'
          }).then(({data}) => {
            if (data.result) {
              this.illId = data.ret || this.illList[0].ill_id  // 如果获取当前学习疾病失败，则自动选中疾病列表的第一项
              resolve(data.ret)
            } else {
              reject(data)
            }
          }).catch(e => {
            console.log(e)
            reject({timeout: true})
          })
        })
      },

      // 载入疾病list
      loadIllList() {
        return new Promise((resolve, reject) => {
          _request({
            url: 'xxjh/XXJHIllList'
          }).then(({data}) => {
            if (data.result) {
              this.illList = data.ret
              resolve()
            } else {
              this.$bus.$emit('vux.toast', data.message)
              reject()
            }
          }).catch(e => {
            console.log(e)
            reject({timeout: true})
          })
        })
      },

      // 载入当前阶段
      loadNowStage() {
        return new Promise((resolve, reject) => {
          _request({
            url: 'xxjh/nowXXJH',
            params: {
              ill_id: this.illId
            }
          }).then(({data}) => {
            this.stage = data.ret.now_stage;
            this.last_stage = data.ret.last_stage;
            this.next_stage = data.ret.next_stage;
            if (this.stage_select_id == null) {
              this.stage_select_id = data.ret.now_stage.id;
            }
            resolve()
          }).catch(e => {
            reject();
            if (e.timeout) {
              this.$bus.$emit('vux.toast', {
                type: 'cancel',
                text: '网络错误'
              })
            } else {
              this.$bus.$emit('vux.toast', e.message)
            }
          })
        })
      },

      // 载入全部阶段
      loadAllStage() {
        _request({
          url: 'xxjh/illAllStage',
          params: {
            ill_id: this.illId
          }
        }).then(({data}) => {
          this.allStage = data.ret;
        }).catch(e => {
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
        })
      },

      // 载入阶段下全部文章
      loadStageArticle() {
        _request({
          url: 'xxjh/stageArticle',
          params: {
            stage: this.stage.id
          }
        }).then(({data}) => {
          this.stageArticle = data.ret
        }).catch(e => {
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
        })
      },

      // 选择疾病
      selectIll(illId) {
        this.visibleIllList = false
        if (this.illId === illId) {
          return
        }
        _request({
          url: 'xxjh/nowIllUpdate',
          params: {
            ill_id: illId
          }
        })

        this.illId = illId
        this.loadNowStage()
      },

      // 跳转至阶段考核
      toExam() {
        _request({
          url: 'xxjh/judgeStage',
          params: {
            stage: this.stage.id
          }
        }).then(({data}) => {
          if (data.ret === 'no_have_other') {
            this.$toView('learning_plan/exam', {
              params: {
                illId: this.illId,
                stageId: this.stage.id
              }
            })
          } else {
            this.$bus.$emit('vux.toast', '你还有没通过考核的文章')
          }
        })
      },

      loadArticleByStageId(id) {
        if (id in this.allArticle) {
          return
        }
        _request({
          url: 'xxjh/stageArticle',
          params: {
            stage: id
          }
        }).then(({data}) => {
          Vue.set(this.allArticle, id, data.ret)
          console.log(123)
        }).catch(e => {
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
        })
      },

      toArticle(stage, art) {
        this.$toView('course/course_article', {
          params: {
            articleId: art.article.id,
            illId: this.illId,
            stageId: stage.id

          }
        })
        console.log(567)
      },
      //上一个学习阶段
      lastStage(stage_id) {
        this.init();
        _request({
          url: 'xxjh/nowXXJH',
          params: {
            ill_id: this.illId,
            stage_id: stage_id,
          }
        }).then(({data}) => {
          this.stage = data.ret.show_stage;
          this.last_stage = data.ret.last_stage;
          this.next_stage = data.ret.next_stage;
          this.stageArticle = data.ret.xxjh_lists;
          if (this.stage_select_id == null) {
            this.stage_select_id = data.ret.now_stage.id;
          }
        })
      },
      //下一个学习阶段
      nextStage(stage_id) {
        this.init();
        _request({
          url: 'xxjh/nowXXJH',
          params: {
            ill_id: this.illId,
            stage_id: stage_id,
          }
        }).then(({data}) => {
          // this.$set(this.stage, product_index, data.ret.now_stage);
          this.stage = data.ret.show_stage;
          // this.stage = data.ret.now_stage;
          this.last_stage = data.ret.last_stage;
          this.next_stage = data.ret.next_stage;
          this.stageArticle = data.ret.xxjh_lists;
          if (this.stage_select_id == null) {
            this.stage_select_id = data.ret.now_stage.id;
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



