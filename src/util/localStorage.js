// 获取数据时自动转换为对应类型的localStorage
// 注意：不要用这个来获取原生localStorage设置的值

export default {
  get (key, defaultVal) {
    key = 'user-'  + key
    var data = JSON.parse(localStorage.getItem(key) || '[]')
    var val = data.length ? data[0] : defaultVal || null
    return val
  },

  set (key, value) {
    key = 'user-'  + key
    localStorage.setItem(key, JSON.stringify([value]))
  },

  remove (key) {
    key = 'user-'  + key
    localStorage.removeItem(key)
  }
}