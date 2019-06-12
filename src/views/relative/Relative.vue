<template>
  <div class="com-container">
    <vue-header title="我的亲友"></vue-header>
    <vux-group title="搜索亲友">
      <x-input title="真实姓名" v-model="name" placeholder="待填写"></x-input>
      <x-input title="电话号码" v-model="phoneNum" placeholder="待填写"
        type="number"
        is-type="china-mobile"
      ></x-input>
      <vux-selector title="亲友关系" v-model="relation" placeholder="请选择"
        :options="relationList.map(val => ({ key: val.id, value: val.type }))"
      ></vux-selector>

      <cell-box class="btn-container">
        <div class="addBtn" @click="add">添加亲友</div>
      </cell-box>
    </vux-group>

    <vux-group title="我的亲友">
      <table class="relativeList">
        <tr>
          <th>亲友</th>
          <th>权限</th>
          <th>授权状态</th>
          <th>操作</th>
        </tr>
        <tr v-for="(item, index) in relativeList" :key="index">
          <td>{{ item.real_name }}<br><span style="color:#aaa">{{ item.type_str }}</span></td>
          <td @click="open_Quan_Xian_Selector(item.id)" style="vertical-align:top">
            {{ item.quanxian_str }}
            <br><span class="color-theme">点击修改</span>
          </td>
          <td>{{ item.quanxian > 0 ? '已' : '未' }}授权</td>
          <td><span class="delBtn" @click="del(item.id, index)">删除</span></td>
        </tr>
      </table>
    </vux-group>
  </div>
</template>

<script>
import { XInput, Selector, CellBox } from 'vux'
export default {
  components: {
    XInput, VuxSelector: Selector, CellBox
  },

  data (){
    return {
      name: '',
      phoneNum: '',
      relation: '',     // 关系
      relationList: [],       // 关系列表
      relativeList: []        // 亲友列表
    }
  },

  mounted (){
    this.loadRrelationList()
    this.load()
  },

  methods: {
    load (){    // 获取亲友列表
      _request({
        url: 'qsgx/getRelativeList',
      }).then(({data}) =>{
        if(data.result){
          this.relativeList = data.ret
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })
    },

    loadRrelationList (){   // 获取关系列表
      _request({
        url: 'qsgx/getTypeList'
      }).then(({data}) =>{
        if(data.result){
          this.relationList = data.ret
        }else{
          this.$bus.$emit('vux.toast', data.message)
        }
      })      
    },

    add (){     // 发送申请
      if(!this.name || !this.phoneNum || !this.relation){
        this.$bus.$emit('vux.toast', '请检查是否有未填项')
        return
      }
      if(!/^[\u4E00-\u9FA5a-z・]{2,20}$/.test(this.name)){
        this.$bus.$emit('vux.toast', '姓名不符合规范')
        return
      }
      if(!/^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/.test(this.phoneNum)){
        this.$bus.$emit('vux.toast', '手机号格式不正确')
        return
      }

      _request({
        url: 'qsgx/addRelative',
        params: {
          name: this.name,
          type: this.relation,
          phonenum: this.phoneNum
        }
      }).then(({data}) =>{
        if(data.result){
          this.$bus.$emit('vux.toast', {
            type: 'success',
            text: '已发送申请'
          })
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

    del (id, index){     // 删除亲友
      this.$vux.confirm.show({
        title: '提示',
        content: '确定要解除亲友关系吗？',
        onConfirm: () =>{
          _request({
            url: 'qsgx/delRelative',
            method: 'post',
            data: { id }
          }).then(({data}) =>{
            if(data.result){
              this.relativeList.splice(index, 1)
              this.$bus.$emit('vux.toast', {
                type: 'success',
                text: '操作成功'
              })
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
      })
    },

    // 打开权限列表
    open_Quan_Xian_Selector (id){
      this.$bus.$emit('vux.actionsheet', {
        menus: [
          {
            label: '无权限',
            value: 0
          }, {
            label: '查看',
            value: 1
          }, {
            label: '编辑',
            value: 2
          }
        ],

        onClick: selected =>{
          _request({
            url: 'qsgx/changeQuanxian',
            params: {
              id,
              action: selected
            }
          }).then(({data}) =>{
            if(data.result){
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
      })
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .vux-selector .weui-select{
  direction: ltr;
  margin-left: -20px;
}

/deep/ input::-webkit-input-placeholder{
  color: rgb(169, 169, 169);
}

.btn-container{
  justify-content: center;

  .addBtn{
    display: inline-block;
    .themeBtn;
    padding: 5px 10px;
    border-radius: 10px;
  }
}

.relativeList{
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  text-align: center;

  th, td{
    padding: 5px;
  }

  th{
    padding: 10px;
    font-weight: normal;
    border-bottom: 2px #ccc solid;
  }

  td{
    font-size: 15px;
  }

  .delBtn{
    display: inline-block;
    padding: 5px 10px;
    color: white;
    background-color: @danger;
    border-radius: 15px;
    font-size: 15px;
  }
}
</style>
