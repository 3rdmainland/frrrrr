<template>
	<n-page class="help-detail" pattern-bg :padding="false" :docked-footer="showFooter" :show-footer="showFooter">

		<portal to="app-header-portal">
		  <n-app-header :title="$t('help.titleShort')"></n-app-header>
		</portal>

		<n-page-hero>
      <img slot="background" class="new-layer img--center img--fill" src="@/assets/img/help-header.svg" >
      <h1>{{ $t('help.title') }}</h1>
    </n-page-hero>
		
	  <n-container v-if="ready" narrow>
	    <h4>{{helpItem.title}}</h4>
	    <n-template-string :content="helpItem.content" :data="templateData" />

	    <n-form v-if="helpItem.contactFormEnabled" ref="helpForm" @submit='onSubmit' @validity="onFormValid" class="mt-4">
	      <n-text-area v-model="userComment" :label="$t('help.queryForm.issue')" rows="5" required />
	      <div class="form-group flexbox justify-end">
	      	<n-button v-if="!showFooter" primary type="submit" :disabled="!canSubmit" :loading="loading" v-track="{'help-detail-feedback-form': 'submit'}">{{ $t('help.queryForm.submit') }}</n-button>
	      </div>
	    </n-form>
	  </n-container>

	  <n-page-footer v-if="showFooter" slot="footer">
	    <n-container v-if="ready">
	    	<n-button @click.native="$refs.helpForm.submit" type="submit" :disabled="!canSubmit" :loading="loading" :skew="$breakpoints.smDown" :block="$breakpoints.smDown" primary with-triangle v-track="{'help-detail-feedback-form': 'submit'}">
	    	  {{ $t('help.queryForm.submit') }}
	    	</n-button>
	    </n-container>
	  </n-page-footer>

	</n-page>
</template>

<script src="help-detail.js"></script>

<style lang="scss">
	.help-detail {
		.form-control__wrapper { background-color: white; }
	}
</style>