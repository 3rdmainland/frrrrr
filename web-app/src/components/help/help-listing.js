import HelpService from 'nandos-middleware-api/service/help-service'

export default {

  props: ['relatedEntity', 'context'],

  data() {
    return {
      helpItems: null,
    }
  },

  computed: {
    ready() {
      return this.helpItems != null
    }
  },
  
  created() {
    HelpService.getHelpItems(this.context)
      .then(items => this.helpItems = items)
  },
}