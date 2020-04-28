<template>
  <li>
    <div :style="styleFn(nodeData)" class="content">
      <span class="icon el-icon-caret-right" v-if='nodeData[childrenKey]' :class="{'open':nodeData.expandState}"></span>
      <div class='lable'>
        <node-render :datas='nodeData' :render-content='renderContent'></node-render>
      </div>
    </div>
  </li>

</template>

<script>
export default {
  data() {
    return {}
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
        renderContent: {
          type: Function
        }
      },
      render: function(h) {
        const vm = this
        if (vm.renderContent) {
          return vm.renderContent(h, vm.datas)
        }
        return <span>{vm.datas.label + '_norendere'}</span>
      }
    }
  },

  methods: {
    styleFn(val) {
      const vm = this
      const paddingLeft = val.level * vm.indent
      const height = vm.treeOption.height
      const sty1 = `padding-left:${paddingLeft}px; height:${height}px; line-height:${height}px;`
      const sty2 = `padding-left:${paddingLeft + 12}px; height:${height}px; line-height:${height}px;`
      return val[vm.childrenKey] ? sty1 : sty2
    }
  }
}
</script>

<style lang="scss" scoped>
li {
  list-style: none;
  &.active {
    background: red;
    color: #fff;
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