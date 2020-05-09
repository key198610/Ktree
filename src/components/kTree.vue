<template>
  <div class='scrollbar' ref='scrollbarDOM' @scroll="scrollEvent">
    <div class='scrollBox' :style='{height:computedHeight}'>
      <ul :style="{transform:viewScrollY}">
        <k-tree-node v-for="val in treeData" :key='val[nodeKey]' v-show="val.visibleSate" :class='{"active":activeCode.includes(val[nodeKey])}' :title='val.label' :childrenKey='childrenKey'
          :labelKey='labelKey' :nodeData='val' :treeOption='treeOption' :indent='indent' :render-content='renderContent' @click.native='treeNodeClick(val)'></k-tree-node>
      </ul>
    </div>
  </div>
</template>

<script>
/**
 * 01: 树节点显示 => 可见数据
 * 02: tree点击收缩,滚动,过滤 => 操作的是可见数据
 * 03: 可见数据 => filterVisibelData可见数据 所有操作依赖该数据
 * 04: treeTempData => 作为treeAllData数据中转 => filterVisibelData
 */
import kTreeNode from './kTreeNode.vue'
export default {
  data() {
    return {
      treeAllData: [], // 所有数据,只作为根据(过滤),不去操作
      treeTempData: [], // 临时数据
      treeData: [],
      childrenKey: null, // 渲染childrenKey
      labelKey: null, // 渲染labelKey
      activeCode: [], // 选中项
      treeItemHeight: 0, // 节点高度
      treeSzieViewArea: null, // 可视区:节点个数
      treeViewHeight: null, // 可视区: 高度
      viewScrollY: 0 // 可滚动总高度
    }
  },
  props: {
    // tree :数据
    data: {
      type: Array,
      required: true
    },
    // tree: 渲染字段
    defaultProps: {
      type: Object,
      required: true
    },
    // tree: 水平缩进
    indent: {
      type: Number,
      default: 10
    },
    // tree: 是否默认展开所有
    defaultExpandAll: {
      type: Boolean,
      required: false
    },
    // tree: 每个节点唯一标识属性(高亮,选中,必须传入nodeKey)
    nodeKey: {
      type: String
    },
    // tree: 选中的节点code
    checkCode: {
      type: Array,
      default: () => {
        return []
      }
    },
    // tree: 属性
    treeOption: {
      type: Object,
      default: () => {
        return { height: 30 }
      }
    },
    // tree: 自定义渲染
    renderContent: {
      type: Function
    }
  },
  watch: {
    data: function(newVal, oldVal) {
      const vm = this
      let datas = JSON.parse(JSON.stringify(newVal))

      // 数据变化,清除之前数据
      vm.treeAllData = []

      // 是否全部展开
      vm.defaultExpandAll ? vm.expandAllEvent(datas) : vm.unExpandAllEvent(datas)
      vm.treeTempData = [...vm.treeAllData]

      // 选中节点(可能多个)
      vm.checkCode&&vm.checkCode.length > 0 ? vm.checkCodeIntoView() : vm.scrollEvent()
    },

    checkCode:function(newVal, oldVal){
      this.activeCode = newVal
    }
  },
  computed: {
    // 筛选可见元素 => 所欲
    filterVisibelData() {
      return this.treeTempData.filter(item => item.visibleSate === true)
    },
    // 滚动高度(可见元素总高度)
    computedHeight() {
      return this.filterVisibelData.length * this.treeItemHeight + 'px'
    }
  },
  components: {
    kTreeNode
  },
  mounted() {
    const vm = this
    vm.initTreeAttr()
  },
  methods: {
    // tree属性: 初始化
    initTreeAttr() {
      const vm = this
      const scrollbarDOM = vm.$refs.scrollbarDOM
      vm.childrenKey = vm.defaultProps.children
      vm.labelKey = vm.defaultProps.label
      // vm.activeCode = vm.checkCode
      vm.treeItemHeight = vm.treeOption.height
      vm.treeViewHeight = scrollbarDOM.offsetHeight
      vm.treeSzieViewArea = Math.ceil(vm.treeViewHeight / vm.treeItemHeight)
    },
    // 递归数据
    recursion(data = [], level, expandFlag) {
      const vm = this
      data.forEach(item => {
        vm.$set(item, 'level', level)
        vm.$set(item, 'expandState', expandFlag)
        vm.$set(item, 'visibleSate', expandFlag)
        vm.treeAllData.push(item)
        if (item[vm.childrenKey]) {
          vm.recursion(item[vm.childrenKey], item.level + 1, expandFlag)
        }
      })
    },
    // 选中节点(回填): 在可视区(默认选中的第一个)
    checkCodeIntoView() {
      const vm = this
      let targetIndex = vm.treeAllData.findIndex(val => val[vm.nodeKey] === vm.checkCode[0])
      vm.$nextTick(() => {
        vm.$refs.scrollbarDOM.scrollTop = targetIndex * vm.treeItemHeight // 设置滚动距离
        const scrooTop = vm.$refs.scrollbarDOM.scrollTop - vm.treeViewHeight // 滚动高度 > 可视区 => 开始触发加载数据
        vm.setViewData(scrooTop > 0 ? scrooTop : 0)
      })
    },
    // 可视区: 滚动事件
    scrollEvent() {
      const vm = this
      const scrooTop = vm.$refs.scrollbarDOM.scrollTop - vm.treeViewHeight // 滚动高度 > 可视区 => 开始触发加载数据
      vm.setViewData(scrooTop > 0 ? scrooTop : 0)
    },
    // 可视区: 数据
    setViewData(scrooTop) {
      const vm = this
      const start = Math.floor(scrooTop / vm.treeItemHeight) // start索引
      const end = start + vm.treeSzieViewArea * 3 // end索引: start索引 + 可视区个数*3  => 保证数据可视区3倍
      vm.treeData = vm.filterVisibelData.slice(start, end)
      vm.viewScrollY = `translateY(${start * vm.treeItemHeight}px)`
    },
    // tree节点: 全部展开 + 不展开
    expandAllEvent(data) {
      const vm = this
      vm.recursion(data, 1, vm.defaultExpandAll)
    },
    unExpandAllEvent(newVal) {
      const vm = this
      newVal.forEach(item => {
        vm.$set(item, 'level', 1)
        vm.$set(item, 'expandState', false)
        vm.$set(item, 'visibleSate', true)
        vm.treeAllData.push(item)
        vm.recursion(item[vm.childrenKey], 2, vm.defaultExpandAll)
      })
    },
    // tree节点点击收缩:  open => 子栏目展开  close => 子孙栏目都隐藏
    treeNodeClick(item) {
      const vm = this
      vm.slideToogleEvent(item)
      // 传入node-key, 选中
      if (vm.nodeKey) {
        vm.activeCode = [item[vm.nodeKey]]
      }
      vm.$emit('node-click', item)
    },
    slideToogleEvent(item) {
      const vm = this
      const isExpand = item.expandState
      const childData = item[vm.childrenKey]
      if (childData) {
        isExpand ? vm.slideUp(childData) : vm.slideDown(childData)
        item.expandState = !isExpand
        vm.scrollEvent()
      }
    },
    slideDown(data) {
      data.forEach(item => {
        item.visibleSate = true
        item.expandState = false
      })
    },
    slideUp(data) {
      const vm = this
      data.forEach(item => {
        item.visibleSate = false
        item.expandState = false
        if (item[vm.childrenKey]) {
          vm.slideUp(item[vm.childrenKey], false)
        }
      })
    },
    // 过滤
    filter(val) {
      const vm = this
      vm.treeTempData = vm.treeAllData.filter(item => item[vm.labelKey].includes(val))
      vm.scrollEvent()
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  li {
    cursor: pointer;
  }
  .emit {
    cursor: pointer;
    padding: 0 5px;
  }
}
</style>