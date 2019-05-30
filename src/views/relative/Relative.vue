<template>
  <div class="com-container">
    <vue-header title="我的亲友"></vue-header>
    <vux-group title="搜索亲友">
      <x-input title="姓名　　" v-model="name" placeholder="待填写"></x-input>
      <x-input title="电话号码" v-model="phoneNum" placeholder="待填写"
        type="number"
        is-type="china-mobile"
      ></x-input>
      <vux-selector title="亲友关系" v-model="relation" placeholder="请选择"
        :options="relativeList.map(val => ({ key: val.type, value: val.id }))"
      ></vux-selector>
      <!-- 拿到list了但没显示 -->
      <cell-box class="btn-container">
        <div class="addBtn" @click="add">添加亲友</div>
      </cell-box>
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
      relation: '',
      relativeList: []
    }
  },

  mounted (){
    _request({
      url: 'qsgx/getTypeList'
    }).then(({data}) =>{
      if(data.result){
        this.relativeList = this.data.ret
      }else{
        this.$bus.$emit('vux.toast', data.message)
      }
    })
  },

  methods: {
    add (){

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


</style>
