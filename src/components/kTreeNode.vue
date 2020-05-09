<template>
  <li>
    <div :style="styleFn(nodeData)" class="content">
      <span class="icon el-icon-caret-right" v-if='showFlag' :class="{'open':nodeData.expandState}"></span>
      <div class='lable'>
        <node-render :datas='nodeData' :render-content='renderContent' :labelKey='labelKey'></node-render>
      </div>
    </div>
  </li>

</template>

<script>
export default {
  data() {
    return {}
  },
  computed: {
    showFlag: function() {
      let childs = this.nodeData[this.childrenKey]
      return childs && childs.length > 0 ? true : false
    }
  },
  props: {
    nodeData: {
      type: Object,
      required: true
    },
    childrenKey: {
      type: String,
      required: true
    },
    labelKey: {
      type: String,
      required: true
    },
    indent: {
      type: Number,
      default: 10
    },
    nodeKey: {
      type: String
    },
    treeOption: {
      type: Object
    },
    renderContent: {
      type: Function
    }
  },
  components: {
    nodeRender: {
      props: {
        datas: {
          type: Object,
          required: true
        },
        labelKey: {
          type: String,
          required: true
        },
        renderContent: {
          type: Function
        }
      },
      render: function(h) {
        const vm = this
        if (vm.renderContent) {
          return vm.renderContent(h, vm.datas, vm.labelKey)
        }
        return <span>{vm.datas[vm.labelKey]}</span>
      }
    }
  },
  methods: {
    styleFn(val) {
      const vm = this
      const paddingLeft = val.level * vm.indent
      const height = vm.treeOption.height
      const childs = vm.nodeData[vm.childrenKey]
      const sty1 = `padding-left:${paddingLeft}px; height:${height}px; line-height:${height}px;`
      const sty2 = `padding-left:${paddingLeft + 12}px; height:${height}px; line-height:${height}px;`
      return childs && childs.length > 0 ? sty1 : sty2
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  list-style: none;
  &.active {
    background: #e8ffff;
    border-right: 4px solid #0077d4;
    font-weight:bold;
    color:#0077d4;
  }
  .content {
    display: flex;
    align-items: center;
    .el-icon-caret-right {
      padding: 5px;
      transition: 0.3s;
      &.open {
        transform: rotate(90deg);
      }
    }
  }
}
</style>