import _Vue from 'vue';
import Vuex from 'vuex';
_Vue.use(Vuex);

import $ from 'jquery';
const $win = $(window);
const {find} = require('lodash');

$win.on('resize', function(){
  store.commit('set', {
    winH: $win.height(),
    winW: $win.width()
  })
});

window.APP = {
  $win
}


const store = new Vuex.Store({
  state: {
    // global
    winH: $win.height(),
    winW: $win.width(),

    // sess
    CADownloadedCount: -1,
    CACertPath: '',
    loginedList: [],

    // desk
    deskInited: false,
    username:'',
    hostname: '',
    homedir: '',
    //arch: '',

    time: 0,
    timeZoneName: '',
    timeZoneOffset: 0,

    // tasks
    tasks: [], // tasks stack
    latestTask: {}, // last created task
    currTask: {}, // focused task
    taskMaxZindex: 0,

    sessError: false
  },
  mutations: {
    needRelogin(state){
      console.log('needRelogin');
      state.sessError = true;
    },
    addTask(state, data){
      data.width = data.width || 400;
      data.height = data.height || 400;
      data.type = data.type || null;
      console.log('data.type', data.type)
      data.draggable = false;
      data.isMin = false;
      data.isMax = false;
      data.bakBeforeMax = null;
      if(state.tasks.length){

        const currTask = state.currTask;
        const top = currTask.positionTop + 50;
        const left = currTask.positionLeft + 50;

        if(top + data.height >= state.winH){
          data.positionTop = 0;
        }else{
          data.positionTop = top;
        }

        if(left + data.width >= state.winW){
          data.positionLeft = 0;
        }else{
          data.positionLeft = left;
        }

      }else{ // Appear in center
        data.positionTop = (state.winH - data.height) / 2;
        data.positionLeft = (state.winW - data.width) / 2;
      }

      store.commit('taskWindowFocus', data);

      data._omitBlur = true;
      state.latestTask._omitBlur = false;
      data.id = state.taskMaxZindex;
      state.latestTask = data;
      state.tasks.push(data);
    },
    hiddenTask(state){
      state.currTask.isMin = true;
    },

    focusNextTask(state, zIndex){
      if(zIndex === state.currTask.zIndex){
        const preTask = find(state.tasks,
          {zIndex: zIndex - 1});
        if(preTask){
          preTask.focus = true;
          state.currTask = preTask;
        }
      }
    },
    removeTask(state, taskPosition){
      store.commit('focusNextTask', taskPosition.zIndex);
      state.tasks.splice(taskPosition.index, 1);
    },
    currTaskWindowUnFocus(state){
      state.currTask.focus = false;
    },
    taskWindowFocus(state, task){
      if(task.focus === true) return;

      if(state.currTask === task){
        task.focus = true;
        return;
      }
      state.taskMaxZindex = state.taskMaxZindex + 1;
      state.currTask.focus = false;
      task.focus = true;
      task.zIndex = state.taskMaxZindex;
      state.currTask = task;
    },
    set (state, data) {
      Object.assign(state, data);
    },

  }
});

export const Vue = _Vue;
export default store;
