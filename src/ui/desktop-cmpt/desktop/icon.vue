<template lang="jade">
button.lr-desktop-icon(
              draggable="true",
              @dblclick="handleDblclick",
              @dragstart.stop='handleDragStart(item, $event)',
              @dragend.stop='handleDragEnd',
              :style='{left: item.x + "px", top: item.y + "px"}',
              :class='{lr_draging: isDraging}')
  Contextmenuable(ref="ctx")
    .lr-desktop-icon-img(v-open-icon="app.iconUrl")
    .lr-desktop-icon-text {{app.name}}
    //- .lr-desktop-icon-img(v-if="iconUrl", v-open-icon="iconUrl")
    //- .lr-desktop-icon-cls(v-else, :class="app.iconClassName")
    //- .lr-desktop-icon-text {{app.name}}
    template(v-slot:contextmenu)
      template(v-if="app.ctx")
        .lr-ctx-item(@click="handleSpecialCtxClick(app)") {{app.ctx}}
        .lr-hr
      .lr-ctx-item(@click="remove") Remove
  //- ContextMenu(ref='ctx')
    
  //-   .lr-ctx-item(@click="remove")
  //-     | Remove
  //-   template(v-if="app.ctx")
  //-     .lr-ctx-item(v-for="name in app.ctx", @click="handleSpecialCtxClick(item.id, name)") {{name}}
</template>
<script>
import Contextmenuable from '../global/contextmenuable.vue';
export default {
  components: {
    Contextmenuable
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  data(){
    return {
      isDraging: true
    }
  },
  computed: {
    app(){
      return this.$store.state.sysAppMap[this.item.id];
    }
    // LANG(){
    //   return this.$store.getters['language/currLanguage'][this.item.id] || {
    //     title: 'Unknown'
    //   }
    // },
    // iconUrl(){
    //   const type = this.item.type;
    //   if(!type){
    //     return this.app.iconUrl;
    //   }
    //   switch(type){
    //     case 'folder':
    //       return 'tan2go/folder.png';
    //     case 'file':
    //       return 'nuvola/accessories-text-editor-6.png'
    //   }
    // },
    // name(){
    //   const type = this.item.type;
    //   if(!type){
    //     return this.LANG.title;
    //   }
    //   switch(type){
    //     case 'folder':
    //     case 'file':
    //       return this.item.name;
    //   }
    // }
  },
  methods: {
    onBeSelecting(isBelectSelected){
      this.isBelectSelected = isBelectSelected;
    },
    handleSpecialCtxClick(app) {
      this.$root.$emit(app.id + '_ctx', app);
      this.$refs.ctx.close();
    },
    remove(){
      this.$store.commit('desktop/removeIcon', this.index);
      this.$refs.ctx.close();
    },
    handleDblclick(){
      this.launch();
    },
    launch(){
      this.$store.commit('task/add', this.item.id);
    },
    handleDragStart(v, e){
      // console.log('Desktop icon handleDragStart');
      this.isDraging = true;
      const value = JSON.stringify({
        id: this.item.id,
        from: 'desktop',
        startClient : {
          x: e.clientX,
          y: e.clientY
        }
      });
      e.dataTransfer.setData("text", value);
      e.dataTransfer.dropEffect = 'move';

      return;
    },
    handleDragEnd(){
      this.isDraging = false;
    }
  }
}

</script>
