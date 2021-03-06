import { composeUserWsUrl } from '../sys-app/util';
import { pako } from '../lib/constant';
const $win = window.$(window);
$win.on('resize', function(){
  store.commit('set', {
    winW: $win.width(),
    winH: $win.height()
  })
  store.commit('setDeskTopWH');
});

$win.on('online', function(){
  store.commit('chOnline', true)
});
$win.on('offline', function(){
  store.commit('chOnline', false);
});


window.APP = Object.create(null);

import { TypeOf } from '../lib/util';
import { SR_KEY_TERM_WRITE, WS_RECONNECT_TIME, AFR_TIMEOUT} from '../lib/constant';
import language from './module/language';
import { termWrite, termExit } from '../sys-app/terminal/map';
import block from './module/block';
import upload from './module/upload';
import error from './module/error';
import task from './module/task';
import fsClipBoard from './module/fs-clip-board';
import flyTextarea from './module/fly-textarea';
import sysAppMap from './module/sys-apps-map';
import users from './module/users';
import fs from './module/fs';
import desktop from './module/desktop';
const SocketRequest = require('@hezedu/socket-request');

let ws, sr;
let wsCloseTime = 0;


function _def$rootEmit(){
  console.error('unroot emit', arguments);
};
let $rootEmit = _def$rootEmit;

const store = new window.Vuex.Store({
  modules: {
    language,
    upload,
    error,
    task,
    users,
    flyTextarea,
    fsClipBoard,
    fs,
    desktop,
    block
  },
  state: {
    // global
    winH: $win.height(),
    winW: $win.width(),
    // sess
    isExit: false,
    // ptyList: [],
    // desktop
    loginOut: '',
    deskTopW: 0,
    deskTopH: 0,
    hostname: '',
    isOnLine: true,
    wsIsConnected: false,
    nsIsConnected: false,
    username:'',
    homedir: '',

    sessError: null,
    sysAppMap
  },
  mutations: {
    // ptyListPush(state, str){
    //   // let arr = str.split('\n');
    //   // let arr2 = state.ptyList;
    //   // const MAX = 30;
    //   const arr = state.ptyList;
    //   arr.push(str);
    //   if(arr.length > 10){
    //     arr.shift();
    //   }
    //   // arr.forEach(line => {
    //   //   arr2.push(line);
    //   //   if(arr2.length > 30){
    //   //     arr2.shift();
    //   //   }
    //   // });
    // },
    setUsername(state, username){
      state.username = username;
    },
    chOnline(state, bool){
      state.isOnLine = bool;
    },
    setRootEmit(state, emitFn){
      $rootEmit = emitFn;
    },
    removeRootEmit(){
      $rootEmit = _def$rootEmit;
    },
    wsConnect(state, callback){
      if(state.wsIsConnected){
        return;
      }
      if(ws){
        if(ws.readyState !== WebSocket.CLOSED){
          console.log('wsConnect: ws is not close.', ws.readyState);
          return;
        }
      }
      // getPako((pako) => {
        const url = composeUserWsUrl(state.username);
        ws = new WebSocket(url);
        
        ws.onopen = () => {
          console.log('WS Connected!');

          
          wsCloseTime = 0;

          sr = new SocketRequest(ws, srOpts);

          sr.onRequest = handleSrRequest;
          // keepAliveTimer = setInterval(() => {
          //   sr.request([aliveKey]);
          // }, keepAliveInterval);
          this.commit('set', {
            wsIsConnected: true
          });
          callback && callback();
        }

        const handleClose =  (e) => {
          // if(keepAliveTimer){
          //   clearInterval(keepAliveTimer);
          //   keepAliveTimer = null;
          // }
          this.commit('set', {
            wsIsConnected: false
          });
          if(state.isExit){
            return;
          }
          if(e.code === 1000){
            return;
          }
          // if(e.code !== 1000){
            
            if(wsCloseTime){
              wsCloseTime = Date.now();
            }
            
            if(wsCloseTime){
              if((Date.now() - wsCloseTime) >= AFR_TIMEOUT){
                this.commit('onExit', 'clientTimeout');
                return;
              }
            }

            if(!state.isOnLine){
              window.addEventListener('online', () => {
                store.commit('wsConnect');
              }, {
                once: true
              });
            } else {
              const _reconent = () => {
                setTimeout(() => {
                  store.commit('wsConnect');
                }, WS_RECONNECT_TIME);
              }
              this.request({
                type: 'get',
                url: '~/alive',
                success: () => {
                  _reconent();
                },
                error: (xhr) => {
                  if(xhr.status !== 403){
                    // checkSessionAliveTime = 0;
                    _reconent();
                  }
                }
              });
              // if(_isNeedCheckSessionAlive()){
              //   this.request({
              //     type: 'get',
              //     url: '~/alive',
              //     success: () => {
              //       _reconent();
              //     },
              //     error: (xhr) => {
              //       if(xhr.status !== 403){
              //         checkSessionAliveTime = 0;
              //         _reconent();
              //       }
              //     }
              //   });
              //   return;
              // }
              // _reconent();

              // if(e.code === 1006){
              //   // 1006:
              //   // Connection closed before receiving a handshake response
              //   // ECONREFUSED 


              // } else {
              //   setTimeout(() => {
              //     store.commit('wsConnect');
              //   }, WS_RECONNECT_TIME);
              // }
            }
          // }
        }
        ws.onclose = handleClose;
      // });
    },
    onExit(state, msg){
      state.isExit = true;
      if(ws.readyState <= 1){
        ws.close();
      }
      
      if(msg){
        // window.alert('exit' + msg);
        // location.href = '/#u=' + state.username;
        this.commit('needRelogin', msg);
      } else {
        // 正常退出.
        location.href = '/';
      }
    },
    setDeskTopWH(state){
      var dom = document.getElementById('lr-desktop');
      if(dom){
        state.deskTopW = dom.offsetWidth;
        state.deskTopH = dom.offsetHeight;
      }
    },

    wsRequest(state, opts){
      if(!opts.error){
        opts.error = globalWsErrorHandle;
      }
      if(!state.wsIsConnected){
        opts.error({
          status: 0,
          method: opts.method,
          message: 'disConnected'
        });
        return;
      }
      if(ws){
        if(ws.readyState !== WebSocket.OPEN){
          opts.error({
            status: 1,
            method: opts.method,
            message: 'readyStateNotOpen'
          });
          return;
        }
      }
      const requestData = opts.isArray ? 
      opts.data : 
      {method: opts.method, data: opts.data};

      if(opts.noReply){
        sr.request(requestData);
        return;
      }
      sr.request(requestData, (resData) => {
        opts.complete && opts.complete(resData);
        if(resData.status === 200){
          opts.success && opts.success(resData.data);
        } else {
          resData.method = opts.method;
          opts.error(resData);
        }
      });
    },

    recycleBinChange(state, len){
      const app = state.sysAppMap['sys_app_recycle_bin'];
      app.iconUrl = len === 0 ? 'nuvola/user-trash.png' : 'nuvola/user-trash-full.png';

    },

    needRelogin(state, msg){
      console.log('needRelogin');
      state.sessError = {
        message: msg || ''
      };
    },
    set (state, data) {
      if(TypeOf(data)  !== 'Object'){
        throw new Error('data must be a object.');
      }
      Object.assign(state, data);
    },
    chNsStatus(state, bool){
      state.nsIsConnected = bool;
      if(bool){
        console.log('chNsStatus: nsConnected')
        $rootEmit('nsConnected');
      } else {
        $rootEmit('nsDisconnected');
      }
    },
    clearDesktop(){
      store.commit('task/closeAll');
      store.commit('users/clear');
      store.commit('fsClipBoard/clear');
    }
  }
});



function globalWsErrorHandle({status, method, message}){
  console.error(method, status, message);
}

const srOpts = {
  isWs: true, 
  isCompress: true,
  inflateFn: (data, cb) => {
    var reader = new FileReader();
    reader.onload = (e) => {
        var strData = pako.inflate(e.target.result, { to: 'string' });
        cb(strData);
    }
    reader.readAsArrayBuffer(data);
  },
  deflateFn: (data) => {
    return pako.deflate(data);
  }
}

function handleSrRequest(data){
  if(Array.isArray(data)){
    const key = data[0];
    switch(key){
      case SR_KEY_TERM_WRITE:
        termWrite(data);
        break;
      case 'termExit':
        termExit(data);
        break;
      case 'nsOpen':
        console.log('nsOpen')
        store.commit('chNsStatus', true);
        break;
      case 'nsClose':
        store.commit('chNsStatus', false);
        break;
      case 'USP_UNCAUGH_EXCEPTION':
        store.commit('onExit', data[1]);
        break;
      default:
        console.error('un handle onRequest key: ' + key);
    }
  } else {
    console.error('un handle onRequest data', data);
  }
}

export default store;
