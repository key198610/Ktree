# 目前提供的参数

## 01: data(tree数据)
```
  格式: 数组
```

## 02: treeOption(tree 选项 => 目前只指定height,treeitem的高度)
```
  格式: 对象
  treeOption: {
    height: 30
  }
```

## 03: checkCode(选中的treeItem =>主要用于数据回填,选中的项)
```
  格式: 数组
  checkCode:[ 1,2,3 ]
```

## 04:  node-key(每个节点唯一标识 => 高亮,选中,必须传入)
```
  格式: 字符串
```

## 05:   node-click 节点点击事件,回调函数参数为点击节点的数据(nodedata)
```
  格式: 函数
  node-click ="nodelCickFn"
```

## 06:    defaultProps : tree渲染的数据和子节点对应的字段
```
  格式: 对象
  defaultProps: {
    children: 'children',
    label: 'label'
  }
```

## 07:    default-expand-all 是否全部展开节点(默认不展开)
```
  格式: 布尔值
  :default-expand-all=' true | false '
```

## 08:  render-content 自定义渲染函数,支持render函数和jsx
```
  格式: 函数
  :render-content='renderContent'
```
####  注意点: 回调函数参数(h,nodedata,labelKey)
```
  h:render函数
  nodedata: 每个节点数据
  labelKey : 节点显示的名称,此值为defaultProps中的lable值
```

####  两种方式: jsx + render

```
  renderContent(h, nodedata, labelKey){
    return ()
  }

  or

  renderContent(h, nodedata, labelKey){
    return h('元素标签',{属性对象},[内部元素])
  }
```

## 09: 过滤筛选,直接调用tree组件内部的filter方法(必须绑定ref)
```
  watch: {
    filterText(val) {
       this.$refs.treeDOM.filter(val)
    }
  }
```

# 使用方式:
```
      <k-tree :data='treeData' :treeOption='treeOption' :checkCode='checkCode' node-key="code" @node-click='nodeClickEvent' :defaultProps="defaultProps" default-expand-all
        :render-content='renderContent' ref='treeDOM'></k-tree>

```

#### 注意 => ktree组件内部使用了.scrollbar来定义滚动区域的高度,便于滚动计算加载数据,所以.scrollbar必须设置高度,可为指定具体值,也可以是百分比值,也可以flex布局使用
```
.scrollbar {
    height: 360px;
    overflow: auto;
    background: #f5f5f5;
}
```

```html
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
     ....获取数据
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
 ...
}

.tree {
 ...
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

```
