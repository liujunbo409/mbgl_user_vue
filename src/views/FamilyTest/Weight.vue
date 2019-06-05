<template>
  <div class="com-container">
    <vue-header :title="'体重' +  (selectedTab === 'write' ? '录入' : '统计')"></vue-header>
    <vux-checker v-model="selectedTab" :radio-required="true"
      class="checkers-container" 
      default-item-class="checkers"
      selected-item-class="selected"
    >
      <checker-item value="write">录入</checker-item>
      <checker-item value="stats">统计</checker-item>
    </vux-checker>   

    <view-box minus="64px">
      <template v-if="selectedTab === 'write'">
        <div class="form">
          <div class="date form-line">
            <span>日期：</span>
            <div @click="openDateSelector" class="trigger">{{ date || '未选择' }}</div>
          </div>
          <div class="weight form-line">
            <span>体重：</span>
            <div class="com-input-container trigger" data-suffix="kg">
              <input type="number" v-model.trim.number="weight" @change="testWeight($event.target.value)">
            </div>
          </div>
          
          <div class="form-btns">
            <div class="addBtn" @click="editTarget ? edit() : add()">确定</div>
            <div class="clearBtn" @click="editTarget = null">清空</div>
          </div>
        </div>

        <table class="weight-table">
          <tr>
            <th colspan="3">体重表格</th>
          </tr>
          <tr>
            <td>时间</td>
            <td>体重</td>
            <td>操作</td>
          </tr>
          <tr v-for="(item, index) in data" :key="index">
            <td>{{ item.updated_at.split(' ')[0] }}</td>
            <td>{{ item.value }}</td>
            <td>
              <span class="editBtn" @click="editTarget = item">修改</span>
              <span class="delBtn" @click="del(item)">删除</span>
            </td>
          </tr>
        </table>
      </template>      
    </view-box>
    <readonly-mask minus="100px"></readonly-mask>
  </div>
</template>

<script>
import { Checker, CheckerItem, XDialog  } from 'vux'

export default {
  components: {
    VuxChecker: Checker, CheckerItem, XDialog
  },

  data (){
    return {
      selectedTab: 'write',
      date: '',
      weight: '',
      data: [],
      editTarget: null,     // 修改目标，当非unll时，上面的日期体重输入框为修改下方表格的信息
    }
  },

  mounted (){
    this.load()
  },

  watch: {
    // 监视编辑目标
    editTarget (val){
      if(val === null){   // 变为null时说明点击了清空按钮
        this.date = ''
        this.weight = ''
      }else{
        this.date = val.updated_at.split(' ')[0]
        this.weight = val.value
      }
    }
  },

  methods: {
    // 载入数据
    load (){
      _request({
        url: 'cjsj/weightIndex'
      }).then(({data}) =>{
        if(data.result){
          this.data = data.ret.data
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },
    
    // 开启时间选择器
    openDateSelector (){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',

        onConfirm: val =>{
          this.date = val
        }
      })
    },

    // 判断体重是否合法
    testWeight (val, showMsg = true){
      if(val < 20 || val > 300){
        showMsg && this.$bus.$emit('vux.toast', '体重的范围必须在20~300kg之间')
        return false
      }
      return true
    },

    // 添加
    add (){
      if(!this.date){
        this.$bus.$emit('vux.toast', '请选择日期')
        return
      }
      if(!this.weight){
        this.$bus.$emit('vux.toast', '体重不能为空')
        return
      }
      if(!this.testWeight(this.weight)){ return }
      _request({
        url: 'cjsj/addWeight',
        method: 'post',
        data: {
          date: this.date,
          value: this.weight
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '添加成功')
          this.load()
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
        console.log(e)
        this.$bus.$emit('vux.toast', {
          type: 'cancel',
          text: '网络错误'
        })
      })
    },

    // 修改
    edit (item){
      if(!this.weight){
        this.$bus.$emit('vux.toast', '体重不能为空')
        return
      }
      if(!this.testWeight(this.weight)){ return }
      _request({
        url: 'cjsj/changeWeight',
        method: 'post',
        data: {
          id: this.editTarget.id,
          date: this.date,
          value: this.weight
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '修改成功')
          this.load()
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    },

    // 删除
    del (item){
      _request({
        url: 'cjsj/delWeight',
        method: 'post',
        data: {
          id: item.id
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', '删除成功')
          this.load()
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      }).catch(e =>{
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
.com-container{
  background-color: white;
}

.checkers-container{
  text-align: center;
  margin-top: 20px;
}

.checkers{
  padding: 5px 0;
  width: 40%;
  text-align: center;
  border: 1px #ccc solid;
  border-radius: 20px;
  margin: 10px;
  margin-top: 0;
}

.selected{
  background-color: @theme;
  border-color: @theme;
  color: white;
}

.form{
  font-size: 16px;

  .form-line{
    line-height: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 5px 0;

    .trigger{
      width: 170px;
      height: 30px;
      background-color: #eee;
      border-radius: 20px;
    }

    .com-input-container{
      text-align: center;

      > input{
        width: calc(100% - 20px);
      }
    }
  }

  .date .trigger{
    text-align: center;
  }

  .form-btns{
    text-align: center;
    margin-top: 10px;

    .addBtn, .clearBtn{
      display: inline-block;
      padding: 5px 15px;
      .themeBtn;
      border-radius: 10px;
      margin: 0 5px;
    }
  
    .clearBtn{
      background-color: #ccc;
    }
  }

}

.weight-table{
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  text-align: center;
  margin-top: 30px;
  font-size: 16px;

  th, td{
    border: 1px #b5d6e6 solid;
    padding: 10px 0;
  }

  th{
    padding: 15px 0;
    font-size: 18px;
    font-weight: normal;
  }

  .editBtn{
    color: @theme;
  }
  .delBtn{
    color: @danger;
  }
}
</style>
