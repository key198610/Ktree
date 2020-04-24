<template>

  <div class='scrollbar' ref='scrollbarDOM' @scroll="scrollEvent">
    <div class='scrollBox' :style='{height:scrollBoxOffSetHeight}'>
      <ul :style="{transform:viewScrollY}">
        <li v-for="(val,index) in treeData" :key='index' @click="nodeClick(val)" v-show="val.visibleSate" :class='{"active":activeCode===val[nodeKey]}' :title='val.label'
          :data-index='val.num'>
          <div :style="styleFn(val)">
            <span class="icon el-icon-caret-right" v-if='val[children]' :class="{'open':val.expandState}"></span>
            <span class='lable'>{{val.label}}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
export default {
  data() {
    return {
      treeAllData: [],
      treeData: [],
      children: null, // 渲染tree子节点,key值
      activeCode: null, // 选中项

      scrollBoxOffSetHeight: null,
      treeItemHeight: 0, // tree节点高度
      viewAreaSize: null, // 可视区:tree节点个数
      viewHeight: null, // 可视区高度
      viewScrollY: 0 // 可滚动总高度
    }
  },

  props: {
    // tree数据
    data: {
      type: Array,
      required: true
    },

    // 渲染tree的字段
    defaultProps: {
      type: Object,
      required: true
    },

    // 相邻级节点间的水平缩进，单位为像素
    indent: {
      type: Number,
      default: 10
    },

    // 是否默认展开所有节点
    defaultExpandAll: {
      type: Boolean,
      required: false
    },

    // 每个树节点用来作为唯一标识的属性(节点高亮,选中,必须传入nodeKey)
    nodeKey: {
      type: String
    },

    // 选中的节点code
    checkCode: {
      type: String
    },

    // tree属性
    treeOption: {
      type: Object,
      default: () => {
        return { height: 30 }
      }
    }
  },

  watch: {
    data: function(newVal, oldVal) {
      const vm = this
      if (newVal && oldVal.length === 0) {
        if (!vm.defaultExpandAll) {
          // 不展开
          vm.noExpand(newVal)
        } else {
          // 全部展开
          vm.digui(newVal, 1, true)
        }
        vm.initData()
      }
    }
  },

  created() {
    const vm = this
    vm.children = vm.defaultProps.children
    vm.activeCode = vm.checkCode
    vm.treeItemHeight = vm.treeOption.height
  },

  mounted() {
    const vm = this
    const scrollbarDOM = vm.$refs.scrollbarDOM
    vm.viewHeight = scrollbarDOM.offsetHeight
    vm.viewAreaSize = Math.ceil(vm.viewHeight / vm.treeItemHeight)
  },

  methods: {
    // tree: 左边距样式
    styleFn(val) {
      const vm = this
      const paddingLeft = val.level * vm.indent
      const height = vm.treeItemHeight
      const sty1 = `padding-left:${paddingLeft}px; height:${height}px; line-height:${height}px;`
      const sty2 = `padding-left:${paddingLeft + 20}px; height:${height}px; line-height:${height}px;`
      return val[vm.children] ? sty1 : sty2
    },

    setscrollBoxOffSetHeight() {
      const vm = this
      vm.scrollBoxOffSetHeight = vm.treeAllData.filter(item => item.visibleSate === true).length * vm.treeItemHeight + 'px'
    },

    // 初始化数据
    initData() {
      const vm = this
      vm.setscrollBoxOffSetHeight()
      vm.scrollEvent()
    },

    // 滚动事件
    scrollEvent() {
      const vm = this
      const scrooTop = vm.$refs.scrollbarDOM.scrollTop - vm.viewHeight // 滚动高度 - 可视区高度 => 第一屏数据隐藏后,开始触发加载数据
      vm.setViewData(scrooTop > 0 ? scrooTop : 0)
    },

    // 设置可视区数据
    setViewData(scrooTop) {
      const vm = this
      const visibalTreedata = vm.treeAllData.filter(item => item.visibleSate === true) //找到可见数据
      const start = Math.floor(scrooTop / vm.treeItemHeight) // 开始位置
      const end = start + vm.viewAreaSize * 3 // 结束位置(start索引, 可视区个数*3) => 保证数据是可视区的3倍数
      vm.treeData = visibalTreedata.slice(start, end)
      vm.viewScrollY = `translateY(${start * vm.treeItemHeight}px)`
    },

    // 不展开节点
    noExpand(newVal) {
      const vm = this
      newVal.forEach(item => {
        vm.$set(item, 'level', 1)
        vm.$set(item, 'expandState', false)
        vm.$set(item, 'visibleSate', true)
        vm.treeAllData.push(item)
        vm.digui(item[vm.children], 2, false)
      })
    },

    // 递归数据
    digui(data, level, expandFlag) {
      const vm = this
      data.forEach(item => {
        vm.$set(item, 'level', level)
        vm.$set(item, 'expandState', expandFlag)
        vm.$set(item, 'visibleSate', vm.defaultExpandAll)
        vm.treeAllData.push(item)
        if (item[vm.children]) {
          vm.digui(item[vm.children], item.level + 1, vm.defaultExpandAll)
        }
      })
    },

    // 点击节点
    nodeClick(item) {
      const vm = this
      const isExpand = item.expandState
      if (isExpand) {
        item[vm.children] && vm.slideUp(item[vm.children]) // 折叠 => 子孙栏目隐藏
        item.expandState = false
      } else {
        item[vm.children] && vm.slideDown(item[vm.children], true) // 展开 => 子栏目展开
        item.expandState = true
      }

      // 传入node-key, 选中
      if (vm.nodeKey) {
        vm.activeCode = item[vm.nodeKey]
      }
      vm.$emit('node-click', item)
      vm.initData()
    },

    // open
    slideDown(data) {
      data.forEach(item => {
        item.visibleSate = true
        item.expandState = false
      })
    },

    // close
    slideUp(data) {
      const vm = this
      data.forEach(item => {
        item.visibleSate = false
        if (item[vm.children]) {
          vm.slideUp(item[vm.children], false)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.scrollbar {
  height: 100%;
  overflow: auto;
  .scrollBox {
    position: relative;
    overflow: hidden;
  }
}

.icon {
  padding: 5px;
  transition: 0.3s;
}

li {
  transition: 0.2s;
}

.active {
  background: red;
  color: #fff;
}

.open.icon {
  transform: rotate(90deg);
}
</style>