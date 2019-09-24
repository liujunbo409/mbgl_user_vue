<template>
  <div class="com-container">
    <vue-header :title="moduleData.name"></vue-header>
    <inline-loading v-if="status === 2"></inline-loading>
    <view-box class="com-header-view" v-if="status === 3">
      <vux-group class="com-group-noMarginTop">
        <vux-checker v-model="selected" :type="moduleData.multi_status ? 'checkbox' : 'radio'"
          default-item-class="unchecked checker-item"
          selected-item-class="selected"
        >
          <template v-for="(item, index) in data.filter(val => !(val.id.toString().indexOf('$') === 0))">
            <!-- 
              这里点击后无论是单选模式还是多选模式，都会改变visibleChildMenus中的状态，只不过单选模式下
              不使用visibleChildMenus的状态判断罢了
             -->
            <checker-item :value="item.id" :key="index"
              @click.native="visibleChildMenus[item.id] = !visibleChildMenus[item.id]">
              <cell-box>
                <vux-icon type="success" class="com-xicon-theme hide"></vux-icon>
                <div class="com-unchecked"></div>
                <span class="option-text">{{ item.name }}</span>
              </cell-box>
            </checker-item>

            <div v-if="visibleActiveMenu(item.id)" :key="'menu' + index">
              <vux-group class="com-group-noMarginTop">
                <vux-datetime placeholder="未选择" v-model="optionsForm[item.id].date">
                  <span slot="title" class="menuItem-title">
                    <span>诊断日期</span>
                    <sup v-if="item.date_status">*必填</sup>
                  </span>
                </vux-datetime>
                <vux-selector v-if="item.level.length" v-model="optionsForm[item.id].level"
                  class="menu-levelSelector"
                  :class="{ required_Fen_Xing: item.level_status }"
                  title="分型分期"
                  placeholder="未选择"
                  :options="item.level.map(val => ({ key: val.id, value: val.name }))"
                ></vux-selector>
              </vux-group>
            </div>
          </template>

          <template v-if="moduleData.custom_status">
            <div class="com-fillTitle">自定义疾病列表</div>
            <template v-for="item in data.filter(val => val.id.toString().indexOf('$') === 0)">
              <checker-item :value="item.id" :key="item.id"
                @click.native="visibleChildMenus[item.id] = !visibleChildMenus[item.id]">
                <cell-box>
                  <vux-icon type="success" class="com-xicon-theme hide"></vux-icon>
                  <div class="com-unchecked"></div>
                  <span class="option-text">{{ item.name }}</span>
                </cell-box>
              </checker-item>

              <div v-if="visibleActiveMenu(item.id)" :key="'menu' + item.index">
                <vux-group class="com-group-noMarginTop">
                  <vux-datetime placeholder="未选择" v-model="optionsForm[item.id].date">
                    <span slot="title" class="menuItem-title">
                      <span>诊断日期</span>
                    </span>
                  </vux-datetime>
                </vux-group>
              </div>
            </template>
          </template>
        </vux-checker>
      </vux-group>

      <div class="addCustomBtn" v-if="moduleData.custom_status" @click="addCustomIll">新增</div>

      <div class="com-mainBtn-container">
        <x-button @click.native="submit" :disabled="submitStatus === 'loading'">
          {{ 
            (selected === '' || (typeof selected === 'object' && !selected.length)) &&
            !moduleData.mandatory_status
            ? '跳过' : '确定' 
          }}
        </x-button>
      </div>
    </view-box>
  </div>
</template>

<script>
import { Checker, CheckerItem, CellBox, Icon, Datetime, Selector, XButton } from 'vux'
export default {
  components: {
    VuxChecker: Checker, CheckerItem, CellBox, VuxIcon: Icon, VuxDatetime: Datetime,
    VuxSelector: Selector, XButton
  },

  data (){
    return {
      moduleData: {},     // 传来的模块数据
      data: [],           // 选项数据，开始时载入基础选项数据，追加的自定义疾病也将存入这里
      userData: [],       // user自定义的选项数据，每次提交前和该组数据进行比对，以判断是新建选项还是更新选项
      visibleChildMenus: {},    // 统一控制点击项目后展开的菜单，key为项id，val为布尔值
      optionsForm: {},       // 保存统一的表单数据，提交前使用selected进行过滤，筛选出已选中的项目
      selected: [],         // 当前选中的项，单选为字符串or数字(id)，多选为数组
      status: 1,
      submitStatus: 'init'
    }
    // 自定义疾病的id在该组件内都以$为前缀，新生成还未提交过的疾病以时间戳为id，提交过从服务读取过来的使用服务器提供的id
  },

  mounted (){
    this.moduleData = this.$route.params.moduleData
    this.loadData()
  },

  computed: {

  },

  methods: {
    // 这个函数作计算属性使用，判断控制各选项的菜单显示
    visibleActiveMenu (itemId){
      if(this.moduleData.multi_status){
        return this.visibleChildMenus[itemId]   // 在多选模式下以visibleChildMenus中的状态判断
      }else{
        return this.selected === itemId         // 单选模式下以itemId判断
      }
      // 为什么这样做：vux的checker在单选的情况下selected直接保存选中值，在多选模式下为一个数组
    },

    // 初始化，用于跳转前(该页面复用)清空组件数据
    init (){
      this.moduleData = {}
      this.data = []
      this.userData = [] 
      this.visibleChildMenus = []
      this.optionsForm = {}
      this.selected = []
      this.status = 1
      this.submitStatus = 'init'
    },

    // 加载基础选项数据
    loadData (){
      this.status = 2
      _request({
        url: 'jkda/xuanxiang',
        params: {
          modular_id: this.moduleData.id
        }
      }).then(({data}) =>{
        if(data.result){
          this.status = 3
          this.data = data.ret
          data.ret.forEach(val => {
            Vue.set(this.visibleChildMenus, val.id, false)
            Vue.set(this.optionsForm, val.id, {})
          })
          this.loadUserData()
          this.loadUserCustomData()
        }else{
          this.status = 0
        }
      }).catch(e =>{
        this.status = 0
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 加载用户已选基础项
    loadUserData (){
      _request({
        url: 'jkda/userXuanxiang',
        params: {
          modular_id: this.moduleData.id
        }
      }).then(({data}) =>{
        if(data.result){
          this.userData = this.userData.concat(data.ret)
          data.ret.forEach(val =>{
            if(val.xuanxiang_id in this.optionsForm){
              if(this.moduleData.multi_status){
                if(typeof this.selected === 'string'){
                  this.selected = [val.xuanxiang_id]
                }else{
                  this.selected.push(val.xuanxiang_id)
                }
              }else{
                this.selected = val.xuanxiang_id
              }
              // 装入已填数据
              this.optionsForm[val.xuanxiang_id].date = val.date
              // 展开已选项
              this.visibleChildMenus[val.xuanxiang_id] = true
            }
            var allLevel = []
            this.data.forEach(option =>{
              allLevel = allLevel.concat(option.level || [])
            })

            // 为将选项项目加到其对应的疾病中
            allLevel.some(option => {
              if(val.xuanxiang_id === option.id){
                this.optionsForm[option.father_id].level = val.xuanxiang_id
              }
            })
          })
        }
      }).catch(e =>{
        console.log(e)
      })
    },

    // 加载用户自定义项&自定义已选项
    loadUserCustomData (){
      _request({
        url: 'jkda/userCustom',
        params: {
          modular_id: this.moduleData.id
        }
      }).then(({data}) =>{
        if(data.result){
          this.userData = this.userData.concat(data.ret)
          this.data = this.data.concat(data.ret.map(val =>({ id: '$' + val.id, name: val.name })))
          data.ret.forEach(val =>{
            Vue.set(this.optionsForm, '$' + val.id, { name: val.name, date: val.date })
          })

          var filtered = data.ret.filter(val => val.status)
          filtered.forEach(val =>{
            
            if(this.moduleData.multi_status){
              if(typeof this.selected === 'string'){
                this.selected = ['$' + val.id]
              }else{
                this.selected.push('$' + val.id)
              }
            }else{
              this.selected = '$' + val.id
            }
          })
        }
      })
    },

    // 添加自定义疾病
    addCustomIll (){
      this.$vux.confirm.show({
        showInput: true,
        hideOnBlur: true,
        title: '自定义疾病',
        placeholder: '请输入疾病名称',

        onConfirm: name =>{
          if(name.trim() === ''){
            this.$bus.$emit('vux.toast', '疾病名不能为空')
            return
          }
          var id = '$' + new Date().getTime()
          this.data.push({ id, name })
          Vue.set(this.visibleChildMenus, id, false)
          Vue.set(this.optionsForm, id, { name })
        }
      })
    },

    // 提交
    submit (){
      var options = []
      var data = {}

      if(
        (!this.selected || (typeof this.selected === 'object' && !this.selected.length)) &&
        !this.moduleData.mandatory_status
      ){
        this.$bus.$emit('vux.toast', '请至少选择一项')
        return
      }

      // 因为单选为字符串or数字(id)，多选为数组，下面统一以数组格式处理，这里将非数组格式的selected转为数组格式
      var selected = JSON.parse(JSON.stringify(this.selected))
      if(!this.moduleData.multi_status && typeof selected !== 'object'){
        if(selected){
          selected = [selected]
        }else{
          selected = []
        }
      }

      var dataIdMap = {} 
      this.data.forEach(val =>{         // 以id映射选项基础数据
        dataIdMap[val.id] = val
      })
      for(let i=0, len=selected.length; i < len; i++){
        var id = selected[i]

        if(
          (dataIdMap[id].date_status && !this.optionsForm[id].date) ||
          (dataIdMap[id].level_status && !this.optionsForm[id].level) 
        ){
          this.$bus.$emit('vux.toast', '请检查是否有未填的必填项')
          return
        }
      }

      this.submitStatus = 'loading'
      this.$vux.loading.show({ text: '请稍候' })

      if(selected.length){
        if(!this.moduleData.multi_status){
          data = {
            [this.selected]: this.optionsForm[this.selected]
          }
        }else{
          for(let key in this.optionsForm){
            // id统一拿字符串格式匹配
            if(selected.map(val => val.toString()).includes(key.toString())){
              data[key] = this.optionsForm[key]
            }
          }
        }

        var getId = optionId =>{
          var id = 0
          optionId = parseInt(optionId.toString().replace(/^\$/, ''))
          this.userData.some(val =>{
            if(val.id === optionId){
              id = val.id
              return true
            }
          })
          return id
        }

        console.log(data)

        // 判断自定义的疾病（id以$开头）
        for(let key in data){
          if(Object.values(data[key]).length){
            options.push({
              id: getId(key),
              name: data[key].name,
              xuanxiang_id: key.toString().indexOf('$') === 0 ? 0 : key,
              date: data[key].date
            })


            if(data[key].level){
              options.push({
                id: getId(data[key].level),
                xuanxiang_id: data[key].level,
              })
            }
          }
        }
      }

      console.log(options)

      _request({
        url: 'jkda/xuanxiangPost',
        method: 'post',
        data: {
          modular_id: this.moduleData.id,
          xuanxiangs: options
        }
      }).then(({data}) =>{
        this.$vux.loading.hide()
        if(data.result){
          var illId = this.moduleData.ill_id
          if(!data.ret.modular_id){
            this.submitStatus = 'success'
            this.$router.replace({
              name: 'health/ill_info/index',
              params: { illId }
            })
            this.$bus.$emit('vux.alert', '填写完成')
          }else{
            var moduleData = this.$store.state.jkda[illId].filter(val => val.id === data.ret.modular_id)[0]
            if(moduleData.type === 'medicinal'){
              this.$toView('health/ill_info/medicinal', {
                params: { moduleData }
              })
            }else{
              this.init()
              this.moduleData = moduleData
              this.loadData()
            }
          }
        }else{
          this.submitStatus = 'error'
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        this.$vux.loading.hide()
        this.submitStatus = 'error'
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
/deep/ .weui-select{
  direction: rtl;
}

.hide{
  display: none;
}
.com-xicon-theme{
  width: 23px;
  
  &::before{
    margin: 0;
  }
}
.selected{
  .com-xicon-theme{
    display: initial;
  }
  .com-unchecked{
    display: none;
  }
}

.checker-item{
  display: block;
  border-bottom: 1px #eee solid;
}
.option-text{
  margin-left: 10px;
}

.menuItem-title{
  margin-left: 50px;
}
sup{
  color: @danger;
}
.menu-levelSelector{
  /deep/ .weui-label{
    margin-left: 50px;
  }
}

.addCustomBtn{
  display: table;
  background-color: @theme;
  color: white;
  padding: 5px 20px;
  border-radius: 7px;
  margin: 0 auto;
  margin-top: 5px;
}

.required_Fen_Xing /deep/ .weui-label{
  white-space: nowrap;

  &::after{
    content: " *必填";
    display: inline;
    color: @danger;
    vertical-align: super;
    font-size: smaller;
    margin-left: 5px;
  }
}
</style>
