<template>
  <n-page overlap-app-header>

    <n-container>

      <p class="animate-children--on-hover">
        <span class="triangle-decorator lumo-pink mb-2 heartbeat-bounce"></span>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>

      <n-tile row class="mb-6" to="/">
        <n-tile-content>
          <n-computed-image :image-collection="imageCollection" />
        </n-tile-content>
        <n-tile-content>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </n-tile-content>
      </n-tile>

      <n-tile column to="/">
        <n-tile-content style="min-height: 10em;">
          <n-computed-image :image-collection="imageCollection" />
        </n-tile-content>
        <n-tile-content>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </n-tile-content>
      </n-tile>

    </n-container>

  </n-page>
</template>

<script>
  import ImageCollection from 'nandos-middleware-api/model/image-collection'

  export default {

    data() {
      return {
        imageCollection: new ImageCollection([
          {
              "id": "753cc6e5-b98d-415a-b47b-a67d071b7079",
              "path": "https://images.nandos.co.za/MW_IMAGES/396aa896-ab73-4c87-8b37-f6864d27dff8",
              "name": "portrait",
              "width": 844,
              "height": 1501,
              "contentType": "image/png"
          },
          {
              "id": "cee379cb-3120-4738-a060-db33bfa95414",
              "path": "https://images.nandos.co.za/MW_IMAGES/d9b94bb5-6b59-4c78-9ac6-5ce780184f90",
              "name": "landscape",
              "width": 1500,
              "height": 844,
              "contentType": "image/png"
          },
        ])
      }
    },
  }
</script>