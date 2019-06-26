// 根实例的beforeCreate钩子，主要用于接收beforeInit的数据（存于window._GLOBAL）
import localStorage from '@u/localStorage'
import bigFontSizeTheme from '@/styles/theme/fontSize/big.html'

export default function(){
  this.$store.commit('user/editStatus/writeState', window._GLOBAL.editStatus)

  // 绑定字体大小切换方法
  var styleTag = document.createElement('style')
  document.body.appendChild(styleTag)
  window._changeFontSize = function(size){
    var peelTag = text => text.replace(/^<style>([\s\S]+)<\/style>$/, '$1')

    switch(size){
      case 'big': {
        styleTag.innerHTML = peelTag(bigFontSizeTheme)
        break
      }

      default : {
        styleTag.innerHTML = ''
      }
    }
  }

  var config = localStorage.get('config', {})
  _changeFontSize(config.fontSize)
}