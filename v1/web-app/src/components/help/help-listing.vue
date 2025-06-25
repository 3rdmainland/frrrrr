<template>
  <n-page pattern-bg :padding="false">

    <portal to="app-header-portal">
      <n-app-header :title="$t('help.titleShort')"></n-app-header>
    </portal>

    <n-page-hero>
      <img slot="background" class="new-layer img--center img--fill" src="@/assets/img/help-header.svg" >
      <h1>{{ $t('help.title') }}</h1>
    </n-page-hero>

    <n-container v-if="ready" narrow>
      <!-- If No help items, display the generic "contact us" page  -->
      <n-contact v-if="helpItems.length == 0" :display-order-listing="false"/>
      <!-- If there is only 1 help item, show it's detail view instead of the item listing -->
      <n-help-detail v-if="helpItems.length == 1" :context="context" :related-entity="relatedEntity" :help-item-id="helpItems[0].id" />
      <!-- List help items -->
      <n-list v-else>
        <n-list-item v-for="helpItem in helpItems" :key="helpItem.id">
          <n-list-tile append :to="helpItem.id" v-track="{'help-item-clicked': helpItem.id}">
            <n-list-tile-content>
              <n-list-tile-title>{{helpItem.title}}</n-list-tile-title>
            </n-list-tile-content>
            <n-list-tile-action>
              <n-icon>forward</n-icon>
            </n-list-tile-action>
          </n-list-tile>
          <n-list-divider/>
        </n-list-item>
      </n-list>
    </n-container>

  </n-page>
</template>

<script src="help-listing.js"></script>