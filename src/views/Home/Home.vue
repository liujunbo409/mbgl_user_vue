<template>
  <div class="com-container">
    <vue-header title="首页" :visibleHomeBtn="false">
      <span slot="right" @click="$toView('settings')">设置</span>
    </vue-header>
    <vux-grid :col="3" :cols="3" class="body"
      :show-lr-borders="false"
      :show-vertical-dividers="false"
    >
      <grid-item v-for="({link, img, text, badge, badgeClass, hide, before = null}, index) in blocks" :key="index"
        @click.native="onClickItem(link, before)" :label="text" :class="{ hide }"
      >
        <img slot="icon" :src="img">
        <div v-if="badge" slot="icon" class="badge" :class="badgeClass">{{ badge }}</div>
      </grid-item>
    </vux-grid>
  </div>
</template>

<script>
import { Grid, GridItem } from 'vux'
import { mapState } from 'vuex'

function title(text){
  return {
    text,
    img: require(`@img/home/${text}.png`)
  }
}

export default {
  components: {
    VuxGrid: Grid,
    GridItem
  },

  data (){
    return {
      // 渲染主体
      blocks: [
        {
          ...title('个人资料'),
          link: 'my',
          badge: '',
          badgeClass: ''
        }, {
          ...title('基本病情'),
          link: 'health',
        }, {
          ...title('学习计划'),
          link: 'learning_plan',
          before: this.beforeCheckLearningPlan  // 前置判断，返回一个promise，reject状态时取消导航。
                                                // 不设置默认为resolve
        }, {
          ...title('家庭检测'),
          link: 'family_test',
        }, {
          ...title('关注医生'),
          link: 'follow_doctors'
        }, {
          ...title('亲友设定'),
          link: 'relative',
          hide: false
        }, {
          ...title('角色管理'),
          link: 'role_management',
        },
        
        {
          ...title('全部问答'),
          link: 'all_qa',
        }, {
          ...title('收藏问答'),
          link: 'collection_qa',
        }, {
          ...title('用户指南'),
          link: 'sub/create_plan_hint'
        }
        
        // , {
        //   ...title('公开问答'),
        //   link: 'open_qa'
        // }, {
        //   ...title('我的提问'),
        //   link: 'my_question'
        // }
      ]
    }
  },

  // beforeRouteLeave (to, from, next){
  //   if(!['my', 'my/role/doctor', 'my/role/nurse'].includes(to.name) && !this.isAccess){
  //     this.$bus.$emit('vux.alert', '您还没有进入该模块的权限，请先完成身份认证！')
  //     return
  //   }
  //   next()
  // },

  activated (){
    this.updateEidtStatus()
    this.$store.dispatch('user/editStatus/get')
    // 控制他人账户（store.state.userInfo2存在）时隐藏
    this.blocks[5].hide = !!this.$store.state.user.userInfo2
  },

  computed: {
    role (){
      return this.$store.state.user.userInfo.role
    },

    // 是否允许进入其他模块
    isAccess (){
      return this.$store.state.user.access
    },

    ...mapState('user/editStatus', {
      infoStatus: 'info',
      applyStatus: 'apply',
      czsjStatus: 'czsj'
    })
  },

  watch: {
    // 监听各状态变化
    infoStatus (){
      this.updateEidtStatus()
    },
  },

  methods: {    
    updateEidtStatus (){
      this.blocks[0].badge = this.infoStatus ? '完成' : '待填写'
      this.blocks[0].badgeClass = this.infoStatus ? 'info-done' : 'info-blank'
      this.blocks[2].badge = this.czsjStatus
    },

    onClickItem (link, before){
      before = before || (() => Promise.resolve())
      before().then(() => this.$toView(link))
    },

    beforeCheckLearningPlan (){
      return new Promise((resolve, reject) =>{
        _request({
          url: 'xxjh/haveXXJH'
        }).then(({data}) =>{
          if(!data.result){
            this.$toView('sub/create_plan_hint')
            reject()
            return
          }

          resolve()
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.body{
  background-color: white;
}

/deep/ .weui-grid__icon{
  position: relative;
}

.badge{
  position: absolute;
  bottom: 0;
  line-height: 1;
  left: 50%;
  white-space: nowrap;
  padding: 3px 5px;
  color: white;
  border-radius: 10px;
  transform: translateY(50%);
}

.info-done{
  background-color: rgb(42, 214, 31);
}
.info-blank{
  background-color: #ccc;
}

.shenhe-nosubmitted{
  background-color: #ccc;
}
.shenhe-ing{
  background-color: #03a9f4;
}
.shenhe-done{
  background-color: #2ad61f;
}
.shenhe-rejected{
  background-color: #f51f1f;
}

.chuzhen{
  transform: translate(-50%, 50%);
}
.chuzhen-has{
  background-color: @theme;
}

/deep/ .weui-grid__icon + .weui-grid__label{
  margin-top: 10px;
}

.assessBadge{
  @size: 1.5em;
  padding: 0;
  width: @size;
  height: @size;
  line-height: @size;
  text-align: center;
  border-radius: 50%;
  top: 0;
  transform: translateY(-50%);
}

// 干掉组件默认边框
/deep/ .weui-grid::after{
  display: none;
}

.hide{
  display: none;
}
</style>
