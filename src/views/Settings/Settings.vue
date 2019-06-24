<template>
  <div class="com-container">
    <vue-header title="设置"></vue-header>
    <vux-group>
      <vux-selector v-model="fontSize" title="字体大小" direction="rtl"
        :options="fontSizes"
      ></vux-selector>
    </vux-group>
  </div>
</template>

<script>
import { Selector } from 'vux'
import localStorage from '@u/localStorage'

export default {
  components: {
    VuxSelector: Selector
  },
  
  data (){
    return {
      fontSizes: [
        { key: 'normal', value: '标准' },
        { key: 'big', value: '大' },
      ],

      config: {
        fontSize: 'normal',
        ...localStorage.get('config')
      }
    }
  },

  computed: {
    fontSize: {
      get (){ return this.config.fontSize },

      set (val){
        _changeFontSize(val)
        this.config.fontSize = val
        localStorage.set('config', this.config)
      }
    }
  },
  
  watch: {
    
  },

  methods: {
    
  }
}
</script>

<style lang="less" scoped>

</style>
