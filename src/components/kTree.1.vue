<template>

  <div class='scrollbar' ref='scrollbarDOM'>
    <div class='scrollBox' :style='{height:scrollBoxHeight}'>
      <ul :style="{transform:translateYNum}">
        <li v-for="(val,index) in treeData" :key='index' @click="nodeClick(val)" v-show="val.expandState" :class='{"active":activeCode===val[nodeKey]}' :title='val.label'
          :data-index='val.num'>
          <div :style="styleFn(val)">
            <span class="icon el-icon-caret-right" v-if='val[children]' :class="{'open':val.iconState}"></span>
            <span class='lable'>{{val.label}}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
/*
  虚拟加载:
    01: 先算出可视区数据个数,同时算出ul总高度,并赋值
    02: 初始加载1-3页数据 (分页加载数据原理,一页一页加载)
    03: 监测pageStartNum数据变化,当第一页数据从可视区划过,则可加载第4页的数据
    04: 第2页数据划过,开始加载第5页的数据
    05: 点击隐藏时,算出该节点下隐藏的子孙节点个数,添加关闭同等数量数据
*/
export default {
  data() {
    return {
      treeAllData: [],
      treeData: [],
      children: null,
      activeCode: null,

      scrollbarHeight: null,
      scrollBoxHeight: null,
      scrollBoxScrollTop: 0,
      scrollBoxLastScrollTop: 0, //上次滚动的数值
      timer: null,

      treeItemHeight: 0, // 单个tree节点高度

      closeTreeNum: 0, //点击收缩,tree节点个数
      openTreeNum: 0, // 点击展开,tree节点个数

      pageTreeSize: null, // 可视区: 数据个数

      pageStartNum: 0, // 开始屏幕索引 (显示1-3屏幕的数据)
      pageEndNum: 3 // 结束屏幕索引
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
        vm.digui(newVal, 1, true)
        vm.updateView()
        vm.treeAllData.forEach((item, index) => (item.num = index))
        vm.initData()
      }
    }
  },

  computed: {
    translateYNum: function() {
      const vm = this
      return `translateY(${vm.scrollBoxScrollTop}px)`
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
    vm.scrollbarHeight = scrollbarDOM.offsetHeight

    vm.pageTreeSize = Math.ceil(vm.scrollbarHeight / vm.treeItemHeight)
    vm.pageEndNum = Math.ceil(vm.pageTreeSize * 2)

    scrollbarDOM.addEventListener('scroll', function() {
       vm.scrollEvent(this)
    })
  },

  methods: {
    // 初始化数据
    updateView() {
      const vm = this
      vm.getScrollBoxHeight()
      vm.scrollEvent()
    },

    // 获取滚动高度
    getScrollBoxHeight() {
      const vm = this
      vm.scrollBoxHeight = vm.treeItemHeight * vm.treeAllData.length + 'px'
    },

    // 滚动事件
    scrollEvent1() {
      const vm = this
      const scrollTop = vm.$refs.scrollbarDOM.scrollTop - vm.treeItemHeight
      vm.updateVisibleData(scrollTop > 0 ? scrollTop : 0)
    },

    updateVisibleData(scrollTop = 0) {
      const vm = this
      const start = Math.floor(scrollTop / vm.treeItemHeight)
      const end = start + vm.pageEndNum
      const allVisibleData = (vm.treeAllData || []).filter(item => item.expandState)
      vm.treeData = allVisibleData.slice(start, end)
      vm.scrollBoxScrollTop = start * vm.treeItemHeight
    },

    // 滚动事件
    scrollEvent(arg) {
      const vm = this
      let scrollheight = 0
      vm.scrollBoxLastScrollTop = vm.scrollBoxScrollTop // 记录上次位置
      vm.scrollBoxScrollTop = arg.scrollTop // 赋值当前位置
      scrollheight = vm.scrollBoxScrollTop - vm.scrollBoxLastScrollTop
      vm.scrollDown(scrollheight)
    },

    // 向下滚动: (先移除)离开可视区个数 => 再尾部补充同等个数
    scrollDown(scrollTop) {
      const vm = this
      const pastNum = vm.heightToTreenum(scrollTop)

      vm.pageStartNum += pastNum
      vm.pageEndNum += pastNum

      if (vm.pageStartNum > vm.treeAllData.length - vm.pageTreeSize) {
        vm.pageStartNum = vm.treeAllData.length - vm.pageTreeSize
      }

      if (vm.pageEndNum > vm.treeAllData.length) {
        vm.pageEndNum = vm.treeAllData.length
      }

      vm.ranDerAddTree(vm.pageStartNum, vm.pageEndNum)

      console.log(vm.pageStartNum, vm.pageEndNum)
      console.log('.................')
    },

    // 根据高,算出个数
    heightToTreenum(height) {
      const vm = this
      return Math.ceil(height / vm.treeItemHeight)
    },

    // 初始化数据
    initData() {
      const vm = this
      vm.ranDerAddTree(vm.pageStartNum, vm.pageEndNum)
    },

    // 向下: 增加tree数据
    ranDerAddTree(pageStartNum, pageEndNum) {
      const vm = this
      vm.treeData = vm.treeAllData.slice(pageStartNum, pageEndNum)
    },

    // 向上: 减少tree数据(必须减少,下次增加才不会重复数据)
    ranDerMinusTree() {
      const vm = this
      if (vm.treeData.length > vm.pageEndNum * vm.pageTreeSize) {
        // vm.treeData = vm.treeData.slice(0, vm.treeData.length - 8)
      } else {
        console.log('最初')
      }
    },

    // 左边距样式
    styleFn(val) {
      const vm = this
      const paddingLeft = val.level * vm.indent
      const height = vm.treeItemHeight
      const sty1 = `padding-left:${paddingLeft}px; height:${height}px; line-height:${height}px;`
      const sty2 = `padding-left:${paddingLeft + 20}px; height:${height}px; line-height:${height}px;`
      return val[vm.children] ? sty1 : sty2
    },

    // 递归数据
    digui(data, level, expandFlag) {
      const vm = this
      data.forEach(item => {
        vm.$set(item, 'level', level)
        vm.$set(item, 'expandState', expandFlag)
        vm.$set(item, 'iconState', vm.defaultExpandAll)
        vm.treeAllData.push(item)
        if (item[vm.children]) {
          vm.digui(item[vm.children], item.level + 1, vm.defaultExpandAll)
        }
      })
    },

    // 点击节点
    nodeClick(data) {
      const vm = this

      if (data[vm.children]) {
        // 有子节点
        vm.slideToggle(data)
      }

      vm.$emit('node-click', data)

      // 传入node-key
      if (vm.nodeKey) {
        vm.activeCode = data[vm.nodeKey]
      }
    },

    // 打开+关闭
    slideToggle(data) {
      const vm = this
      const children = data[vm.children] || []
      if (data.iconState) {
        // 关闭 => 子孙等级关闭close
        data.iconState = false
        vm.slideUp(children)
        // 添加数据
        // vm.treeClosePageData()
      } else {
        // 展开 => 子等级open
        data.iconState = true
        vm.slideDown(children)
        // 减少数据
        // vm.treeOpenPageData()
      }
    },

    // open
    slideDown(data) {
      const vm = this
      vm.openTreeNum = data.length
      data.forEach(item => {
        item.expandState = true
      })
    },

    // close
    slideUp(data) {
      const vm = this
      vm.closeTreeNum += data.length
      data.forEach(item => {
        item.expandState = false
        item.iconState = false
        if (item[vm.children]) {
          vm.slideUp(item[vm.children])
        }
      })
    },

    // 关闭: 添加同等数量数据
    treeClosePageData() {
      const vm = this
      vm.treeData.push(...vm.treeAllData.slice(vm.treeData.length, vm.treeData.length + vm.closeTreeNum))
      vm.closeTreeNum = 0 // 重置
    },

    // 打开: 减少同等数量数据
    treeOpenPageData() {
      const vm = this
      vm.treeData = vm.treeData.slice(0, vm.treeData.length - vm.openTreeNum)
      vm.openTreeNum = 0 // 重置
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