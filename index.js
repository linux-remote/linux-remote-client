const nodeModuleStatic = require('./node-module-static');
const map = Object.create(null);
const path = require('path');
const publicPath = require('lr-public');

['jquery', 'vue', 'vuex', 'vue-router'].forEach(name => {
  map[name] = nodeModuleStatic(name)
})

exports.publicPath = publicPath;
exports.faviconPath = path.join(__dirname,  'logo_def.png');
exports.dir = __dirname;
exports.nodeModuleStaticMap = map;
