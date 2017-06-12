const Vuex = require('vuex');

const store = new Vuex.Store({
  state: {
    loginedList: []
  },
  mutations: {
    set (state, newList) {
      state.loginedList = newList;
    }
  }
})

export default store;
