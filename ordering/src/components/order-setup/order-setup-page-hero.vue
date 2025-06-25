<template>
  <n-ordering-contextual-page-hero :order-type="orderType" order-imagery>
    <h3 v-if="twoColumnLayout" ref="title" class="page-hero__title">{{title}}</h3>
    <h2 v-else ref="title" class="page-hero__title">{{title}}</h2>
  </n-ordering-contextual-page-hero>
</template>

<script>
  import { ScrollSpy } from 'nandos-core-ui'

  export default {

    props: {
      title: { type: String, required: true},
      orderType: { type: String, required: true},
      twoColumnLayout: Boolean,
    },

    data() {
      return {
        scrollSpy: null,
      }
    },

    mounted() {
      let parentScrollContainer = this.$el.closest('.page__content')
      let fadeOutBy = this.$refs.title.getBoundingClientRect().y - 10
      this.scrollSpy = new ScrollSpy(parentScrollContainer, scrollY => {
        let delta = Math.max(Math.min(scrollY/fadeOutBy, 1), 0)
        this.$refs.title.style.opacity = 1 - delta
        this.$refs.title.style.transform = `scale(${1-delta})`
      })
    },

    beforeDestroy() {
      this.scrollSpy && this.scrollSpy.destroy()
    }
  }
</script>