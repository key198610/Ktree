<template>
  <div id="app">
    <div class='tree'>
      <k-tree :data='treeData' node-key="code" :defaultProps="defaultProps" default-expand-all :treeOption='treeOption' :checkCode='checkCode'></k-tree>
    </div>
  </div>
</template>

<script>
import kTree from './components/kTree.vue'
import axios from 'axios'

export default {
  name: 'App',
  components: {
    kTree
  },
  data() {
    return {
      treeData: [],
      checkCode:'EC01030104404090',
      treeOption: {
        height: 30
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },

  created() {
    const vm = this
    vm.getTreeData()
  },

  methods: {
    getTreeData() {
      const vm = this
      var instance = axios.create()
      instance.defaults.headers.common['userId'] = '1'
      instance.defaults.headers.common['userName'] = 'admin'
      instance.defaults.headers.common['token'] = '21232f297a57a5a743894a0e4a801fc3'
      instance.defaults.headers.common['organizationCode'] = 'G01C01M01'
      instance.defaults.headers.post['Content-Type'] = 'application/json'
      instance
        .get('http://192.168.54.138:8085/web/pipeNetWork/tunnel/getAllRoadCableShaft')
        .then(function(response) {
          const { data } = response.data
          vm.treeData = [data]
        })
        .catch(function(error) {
          console.log(error)
        })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.tree {
  height: 440px;
  width: 300px;
  border: 1px solid #ddd;
  margin: 250px auto;
  text-align: left;
  font-size: 12px;
}

ul {
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

li {
  list-style: none;
  cursor: pointer;
}
</style>
