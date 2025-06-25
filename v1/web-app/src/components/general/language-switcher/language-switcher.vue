<template>
  <n-select v-if="languageService.languages.length > 1" v-model="languageService.language" label="Language" class="mb-0">
    <option v-for="language in languageService.languages" :value="language">{{language.name}}</option>
  </n-select>
</template>

<script src="language-switcher.js"></script>