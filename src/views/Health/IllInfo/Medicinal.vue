<template>
  <div class="com-container">
    <vue-header :title="moduleData.name" :visibleBackBtn="false"></vue-header>
    <view-box class="com-header-view">
      <inline-loading v-if="status === 2"></inline-loading>
      
      <vux-tab :animate="false">
        <tab-item v-for="({name, id, medicines}, index) in data" :key="index"
          @click.native="selected = id"
          :ref="`tab${index}`"
        >{{ name }}</tab-item>
      </vux-tab>

      <p class="selected_Yao_list-title">已选药物</p>
      <div class="selected_Yao_list">
        <p v-for="(name, index) in showSelected_Yao_Lists" :key="index">{{ name }}</p>
      </div>

      <!-- 这里和接口的思路不一样，只在提交时统一操作，而不是点一下就发一个请求 -->
      <vux-checklist title="药物列表" ref="checklist" :min="0"
        v-model="selected_Yao_Lists[selected]"
        :options="yao_List"
      ></vux-checklist>

      <div class="mainBtn-container">
        <x-button @click.native="submit">填写完成</x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
import { Tab, TabItem, Checklist, XButton } from 'vux'

export default {
  components: {
    VuxTab: Tab, TabItem, VuxChecklist: Checklist, XButton
  },

  data (){
    return {
      moduleData: {},           // 从index页面传来的模块数据
      data: [],                     // 药物数据
      loadedSelected_Yao_List: [], // 获取到的之前已选药品
      selected: '',               // 选中的药类id
      selectedTab: '',
      selectedList: {},          // 选中药品类别下的药品列表
      selected_Yao_Lists: {},    // 已选药物列表，因为checklist限制选中数不能大于options数，
                                 // 这里用每种药类都用一个数组保存，里面是选中的药名
      status: 1,
    }
  },

  mounted (){
    this.moduleData = this.$route.params.moduleData
    // 初始化药类&已有数据
    this.loadClassifyList().then(() =>{
      this.loadSelected()
    })
  },

  computed: {
    // 过滤出药品list
    yao_List (){
      if(!this.selected){ return [] }
      return this.data.filter(val => val.id === this.selected)[0].medicines
      .map(val => ({ key: val.medicine_id, value: val.name })) // vux有bug，key不能为对象
    },

    // 已选药物
    // 这里拿把data中的medicines都取出来，再用所有选项id组成的数组过滤
    showSelected_Yao_Lists (){
      var data = [], selected = []
      this.data.forEach(val => data = data.concat(val.medicines))
      Object.values(this.selected_Yao_Lists).forEach(val => selected = selected.concat(val))
      return data.filter(val => selected.includes(val.medicine_id)).map(val => val.name)
    },
  },

  watch: {
    // 载入药类结束默认选中第一项
    data (){
      Vue.nextTick(() => this.$refs.tab0[0].$el.click())
    }
  },

  methods: {
    // 初始化
    init (){
      this.data = []
      this.loadedSelected_Yao_List = []
      this.selectedList = {}
      this.selected_Yao_Lists = {}
    },

    // 载入药类数据
    loadClassifyList (){
      this.status = 2
      return new Promise((resolve, reject) =>{
        _request({
          url: 'jkda/classifyList',
          params: {
            modular_id: this.moduleData.id
          }
        }).then(({data}) =>{
          if(data.result){
            this.status = 3
            this.data = data.ret
            data.ret.forEach(val => Vue.set(this.selected_Yao_Lists, val.id, []))
            resolve()
          }else{
            this.status = 0
            this.$bus.$emit('vux.toast', data.message)
          }
        }).catch(e =>{
          this.status = 0
          console.log(e)
          this.$bus.$emit('vux.toast', {
            type: 'cancel',
            text: '网络错误'
          })
        })
      })

    },

    // 载入之前的选项
    loadSelected (){
      _request({
        url: 'jkda/userMedicine',
        params: {
          modular_id: this.moduleData.id
        }
      }).then(({data}) =>{
        if(data.result){
          data.ret.forEach(val =>{
            this.loadedSelected_Yao_List.push(val.medicine_id)
            var data = []
            this.data.forEach(foo => data = data.concat(foo.medicines))
            data.forEach(bar => {
              if(bar.medicine_id === val.medicine_id){
                if(!this.selected_Yao_Lists[bar.classify_id]){
                  this.selected_Yao_Lists[bar.classify_id] = []
                }
                this.selected_Yao_Lists[bar.classify_id].push(val.medicine_id)
              }
            })
          })
        }
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 提交，判断哪些项增加了，哪些项减少了，之后统一发起请求
    submit (){
      var selected = []
      Object.values(this.selected_Yao_Lists).forEach(val => selected = selected.concat(val))
      var add = selected.filter(val => !this.loadedSelected_Yao_List.includes(val))
      var del = this.loadedSelected_Yao_List.filter(val => !selected.includes(val))
      
      var requests = []
      add.forEach(medicine_id =>{
        requests.push(_request({
          url: 'jkda/userMedicinePost',
          method: 'post',
          data: {
            medicine_id,
            status: 1
          }
        }))
      })

      del.forEach(medicine_id =>{
        requests.push(_request({
          url: 'jkda/userMedicinePost',
          method: 'post',
          data: {
            medicine_id,
            status: 0
          }
        }))
      })

      Promise.all(requests).then(() =>{
        // 因为需要获取跳转目标页面，虽然用药单独有一个接口，这里也要调用一下post选项接口，获取目标页面
        _request({
          url: 'jkda/xuanxiangPost',
          method: 'post',
          data: {
            modular_id: this.moduleData.id
          }
        }).then(({data}) =>{
          if(data.result){
            var illId = this.moduleData.ill_id
            if(!data.ret.modular_id){
              this.$router.replace({
                name: 'health/ill_info/index',
                params: { illId }
              })
              this.$bus.$emit('vux.alert', '填写完成')
            }else{
              var moduleData = this.$store.state.jkda[illId].filter(val => val.id === data.ret.modular_id)[0]
              this.$toView('health/ill_info/other', {
                params: { moduleData }
              })
            }            
          }
        })
      }).catch(e =>{
        // 出错重加载
        this.init()
        this.loadClassifyList().then(() =>{
          this.loadSelected()
        })

        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.selected_Yao_list{
  height: 150px;
  overflow: auto;
  padding: 5px 10px 10px 15px;
  font-size: 17px;
  background-color: white;

  > p{
    padding: 1px 0;
  }

  .title{
    margin-left: -5px;
    color: #c6c6c6;
    font-size: 18px;
  }
}

.selected_Yao_list-title{
  margin-top: 0.77em;
  margin-bottom: 0.3em;
  padding-left: 15px;
  padding-right: 15px;
  color: #999999;
}

.mainBtn-container{
  padding: 10px;
  margin-top: 50px;
}
</style>
