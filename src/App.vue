<template>
  <div id="app">
    <div class='tree'>
      <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
      <k-tree :data='treeData' :treeOption='treeOption' :checkCode='checkCode' node-key="code" @node-click='nodeClickEvent' :defaultProps="defaultProps" default-expand-all
        :render-content='renderContent' ref='treeDOM'></k-tree>
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
      checkCode: '',
      filterText: '',
      treeOption: {
        height: 30
      },
      defaultProps: {
        children: 'children',
        label: 'label'
      }
    }
  },

  watch: {
    filterText(val) {
      this.$refs.treeDOM.filter(val)
    }
  },

  created() {
    const vm = this
    vm.getTreeData()
  },

  methods: {
    // 获取数据
    getTreeData() {
      const vm = this
      const instance = axios.create()
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
    },

    // 点击事件
    nodeClickEvent(nodeData) {
      console.log(nodeData)
    },

    // 自定义渲染函数
    renderContent(h, nodeData) {
      return (
        <div>
          <span on-click={() => this.labelClickEvent(nodeData)}>{nodeData.label}</span>
          <i class="emit">+</i>
        </div>
      )
    },

    // 点击名称
    labelClickEvent(data) {
      console.log(data)
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
  height: 400px;
  width: 300px;
  border: 1px solid #ddd;
  margin: 250px auto;
  text-align: left;
  font-size: 12px;
}

.scrollbar {
  height: 360px;
  overflow: auto;
  background: #f5f5f5;
}

.scrollbar .emit {
  cursor: pointer;
  padding: 0 5px;
}
</style>
