<template lang="jade">
.lr-fs-wrap
  NavBar(ref='navBar', @change="handleNavChange")
  .lr-fs-bottom-wrap
    .lr-fs-index(v-if='address === ""')
      div(@click='go("/")') /
      div(@click='go(homedir)') Home
    Folder(v-else-if='address', :address='address', :app="task.app", :triggerContainSame='triggerContainSame')
</template>

<script>
import NavBar from './nav-bar.vue';
import Folder from './folder/folder.vue';

export default {
  provide(){
    return {
      taskWindow: this.$parent
    }
  },
  props: ['task'],
  components:{
    NavBar,
    Folder
  },
  data(){
    return {
      address: null,
      triggerContainSame : null
    }
  },
  computed: {
    go(){
      return this.$refs.navBar.go;
    },
    homedir(){
      return this.$store.state.homedir;
    }
  },
  methods: {
    handleNavChange(address){
      this.address = address;

      // 相同的 字符串 address 变化,触发不了watch.所以用Objcet 触发.
      this.triggerContainSame = {
        address
      };

    }
  },
  mounted(){
    const opt = this.task.launchOption;
    const address = opt.address || this.homedir;
    this.$refs.navBar.setAddress(address);
  }
}
</script>
