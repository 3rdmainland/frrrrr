<template>
  <n-page>
    <portal to="app-header-portal">
      <n-app-header :title="pageTitle" />
    </portal>

    <n-container narrow class="text-xs-center" v-if="ready" v-once>
      <n-template-string :content="snippet" :data="templateData" />
    </n-container>
  </n-page>
</template>

<script>
  import CustomerService from 'nandos-middleware-api/service/customer/me-service'
  import SnippetService from 'nandos-middleware-api/service/snippet-service'

  export default {

    props: {
      snippetId: { type: String, required: true },
      pageTitle: { type: String },
    },

    data() {
      return {
        user: null,
        snippet: null,
      }
    },

    computed: {
      ready() {
        return this.user != null && this.snippet != null
      },

      templateData() {
        return {user: this.user}
      },
    },

    created() {
      Promise.all([CustomerService.getMe(), SnippetService.getSnippet(this.snippetId)])
        .then(([user, snippet]) => {
          this.user = user
          this.snippet = snippet
        })
        .catch(e => {
          this.$toaster.show(this.$t('genericContentPage.contentMissing'), {parent: this, error: true})
        })
    }
  }
</script>