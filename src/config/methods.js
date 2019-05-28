// 实例方法
import Vue from 'vue'

Vue.prototype.$toView = function(name, options = {}){
  this.$router.push({ name, ...options })
}

Vue.prototype.$baseToView = function(name, options ={}){
  var basePath = this.$route.name.replace(/^(.+\/)[^\/]+$/, '$1')
  this.$router.push({ name: basePath + name, ...options })
}