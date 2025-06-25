import { ref, computed, onMounted } from "vue";
import type UserProduct from "../../../model/user-product";
import MenuService from "../../../service/menu/my-menu-service";

/**
 * Composable hook for working with products
 * @param productId Product ID or definition ID
 * @param isDefinitionId Whether the provided ID is a definition ID
 * @returns Object containing product data, loading state, error state, and methods to interact with the product
 */
export function useProduct(productId?: string, isDefinitionId = false) {
  const product = ref<UserProduct | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Load a product by definition ID
   * @param definitionId Product definition ID
   * @param bypassCache Whether to bypass the cache
   */
  const loadProduct = async (id: string, bypassCache = false) => {
    if (!id) return;

    isLoading.value = true;
    error.value = null;

    try {
      product.value = await MenuService.retrieveUserProductFromDefinitionId(
        productId ?? 0,
        bypassCache
      );
      console.log("Product:", product.value);
      return product.value;
    } catch (err) {
      error.value = err as Error;
      console.error("Error loading product:", err);
    } finally {
      isLoading.value = false;
    }
  };


  // /**
  //  * Register the current product
  //  */
  // const registerProduct = () => {
  //   if (product.value) {
  //     productService.registerUserProduct(product.value);
  //   }
  // };
  //
  // // Computed properties
  // const isConfigured = computed(() => {
  //   return product.value?.getConfigurationDescription() !== "";
  // });
  //
  // const price = computed(() => {
  //   return product.value?.price || 0;
  // });
  //
  // const configUI = computed(() =>
  //   product.value ? product.value.getConfigUI() : [],
  // );

  // Load product on mount if ID is provided
  onMounted(() => {
    if (productId) {
        loadProduct(productId);
    }
  });

  return {
    product,
    isLoading,
    error,
    loadProduct,
  };
}
