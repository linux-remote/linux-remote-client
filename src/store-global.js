import _Vue from 'vue';
import Vuex from 'vuex';
_Vue.use(Vuex);

import $ from 'jquery';
const $win = $(window);
const {findLast, sortBy} = require('lodash');

$win.on('resize', function(){
  store.commit('set', {
    winH: $win.height(),
    winW: $win.width()
  })
});

window.APP = {
  $win,
  $elMain: null
}


const store = new Vuex.Store({
  state: {
    // global
    winH: $win.height(),
    winW: $win.width(),

    // sess
    isSelfSigned: false,
    CADownloadedCount: -1,
    CACertPath: '',
    loginedList: [],
    indexNotice: '',
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
    showTasks: [],
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
      data.draggable = false;
      data.isMin = false;
      data.isMax = false;
      data.bakBeforeMax = null;
      data.resizeStartData = null;

      if(state.tasks.length){
        store.commit('taskGetPosition', data);

        // const currTask = state.currTask;
        // const top = currTask.positionTop + 50;
        // const left = currTask.positionLeft + 50;
        //
        // if(top + data.height >= state.winH){
        //   data.positionTop = 0;
        // }else{
        //   data.positionTop = top;
        // }
        //
        // if(left + data.width >= state.winW){
        //   data.positionLeft = 0;
        // }else{
        //   data.positionLeft = left;
        // }

      }else{ // Appear in center
        data.positionTop = (state.winH - data.height) / 2;
        data.positionLeft = (state.winW - data.width) / 2;
      }

      store.commit('taskWindowFocus', data);
      data.id = state.taskMaxZindex;
      state.latestTask = data;
      state.tasks.push(data);
    },
    taskGetPosition(state, data){
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
    },
    hiddenTask(state, task){
      task.isMin = true;
      task.focus = false;
      store.commit('focusNextTask');
    },
    showTask(state, task){
      task.isMin = false;
      if(task !== state.currTask && task.positionLeft === state.currTask.positionLeft && task.positionTop === state.currTask.positionTop){
        store.commit('taskGetPosition', task);
      }
      store.commit('taskWindowFocus', task);
    },
    focusNextTask(state){
      const test = sortBy(state.tasks, 'zIndex');
      const preTask = findLast(test,
        {isMin: false});
      if(preTask){
        store.commit('taskWindowFocus', preTask);
      }else{
        console.log('preTask is hidden')
      }
    },
    removeTask(state, taskPosition){
      state.tasks.splice(taskPosition.index, 1);
      store.commit('focusNextTask');
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
