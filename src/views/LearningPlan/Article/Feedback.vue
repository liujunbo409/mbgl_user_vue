<template>
  <vue-feedback feedbackType="article" :moduleId="moduleId"></vue-feedback>
</template>

<script>
import VueFeedback from '@c/layout/Feedback'

export default {
  components: {
    VueFeedback
  },

  data (){
    return {
      moduleId: 0
    }
  },

  mounted (){
    this.moduleId = this.$route.params.moduleId
  },

  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
