import OrderSetupPlaceholder from '@/views/order-setup/order-setup-placeholder.vue'
import DeliveryAddressSelection from '@/views/order-setup/delivery/delivery-address-selection.vue'
import StoreSelection from '@/views/order-setup/delivery/store-selection.vue'
import CollectionLocationSelection from '@/views/order-setup/collection/collection-location-selection.vue'
import OrderSetupLayout from '@/components/ui/OrderSetupLayout.vue'

const miscRoutes = [
  {
    path: '/setup',
    component: OrderSetupLayout,
    children: [
      {
        path: '',
        name: 'order-setup',
        component: OrderSetupPlaceholder,
        meta: {
          title: 'Choose your order type',
          hideType: true,
          fullWidth: true,
          showCancel: true,
        },
      },
      {
        path: 'delivery-address',
        name: 'delivery-address',
        component: DeliveryAddressSelection,
        meta: { title: 'Select Delivery Address', sidebar: true, showCancel: true, hideHeader: true },
      },
      {
        path: 'collection-location',
        name: 'collection-location',
        component: CollectionLocationSelection,
        meta: { title: ' Where would you like to collect from?', hideHeader: true },
      },
      {
        path: 'store-selection',
        name: 'store-selection',
        component: StoreSelection,
        meta: { title: 'Select Store', hideHeader: true },
      },
    ],
  },
]

export default miscRoutes
