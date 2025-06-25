import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService, { AUTH_CHANGED } from 'nandos-middleware-api/src/service/auth-service.ts'
import CustomerService, {
  CUSTOMER_UPDATED,
} from 'nandos-middleware-api/src/service/customer/me-service.ts'
import { ICustomer } from 'nandos-types'
import router from '@/router'
import { genRecaptchaToken } from '@/utils/google-recapture'
import ApiError from 'nandos-middleware-api/src/model/api-error'
import { useBasketStoreV2 } from '@/stores/useBasketStoreV2.ts'

export const useAuthStore = defineStore('auth', () => {
  const basket = useBasketStoreV2()
  const initialUser = (() => {
    const credentials = AuthService.getCredentials()
    if (credentials && credentials.id) {
      return { id: credentials.id, anonymous: false } as ICustomer
    }
    return null
  })()

  const user = ref<ICustomer | null>(initialUser)
  const isLoading = ref<boolean>(false)
  const error = ref<ApiError | any | null>(null)

  const isAuthenticated = computed<boolean>(() => !!user.value && !user.value.anonymous)
  const isVerified = computed<boolean>(() => !!user.value && user.value.verified)
  const errorCode = computed(() => (error.value instanceof ApiError ? error.value.error.code : ''))

  const fetchUser = async (): Promise<ICustomer | null> => {
    isLoading.value = true
    error.value = null

    try {
      const fetched = await CustomerService.getMe()
      user.value = fetched

      // Load basket after user is successfully fetched
      try {
        await basket.loadBasket(true) // Force refresh
      } catch (basketErr) {
        console.warn('Failed to load basket after user fetch:', basketErr)
        // Don't fail the entire auth flow if basket fails
      }

      return fetched
    } catch (err) {
      error.value = err
      user.value = null

      // Clear basket on auth failure
      basket.clearBasket()

      return null
    } finally {
      isLoading.value = false
    }
  }

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      AuthService.emailLogin(email, password)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loginWithMobile = async (mobilePhoneNumber: string, password: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const recaptchaToken = await genRecaptchaToken('sign_in')
      await AuthService.mobileLogin(mobilePhoneNumber, password, recaptchaToken)
      await fetchUser()
      router.push('/')
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData: Record<string, any>): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const recaptchaToken = await genRecaptchaToken('sign_up')
      await AuthService.passwordRegister(userData, recaptchaToken)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resendVerification = async (mobilePhoneNumber: string) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.resendVerification(mobilePhoneNumber)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const verifyRegistration = async (otp: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.verifyRegistration(otp)
      await fetchUser()
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<boolean> => {
    isLoading.value = true

    try {
      await AuthService.logOut()
      user.value = null
      basket.clearBasket()
      router.push('/')
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.changePassword(currentPassword, newPassword)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPasswordViaMobile = async (mobilePhoneNumber: string, newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const recaptchaToken = await genRecaptchaToken('password_reset')
      await AuthService.resetPassword(mobilePhoneNumber, newPassword, recaptchaToken)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPasswordViaEmail = async (
    email: string,
    newPassword: string,
    recaptchaToken: string,
  ) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.resetPasswordViaEmail(email, newPassword, recaptchaToken)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const verifyResetPassword = async (mobilePhoneNumber: string, otp: string) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.verifyResetPassword(mobilePhoneNumber, otp)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const changeMobilePhone = async (newMobileNumber: string) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.changeMobilePhone(newMobileNumber)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  const verifyChangeMobilePhone = async (newMobileNumber: string, otp: string) => {
    isLoading.value = true
    error.value = null

    try {
      await AuthService.verifyChangeMobilePhone(newMobileNumber, otp)
      return true
    } catch (err) {
      error.value = err
      return false
    } finally {
      isLoading.value = false
    }
  }

  //Initialize store
  fetchUser()

  let fetchUserDebounceTimer: NodeJS.Timeout | null = null

  const observer = {
    update: () => {
      if (fetchUserDebounceTimer) {
        clearTimeout(fetchUserDebounceTimer)
      }

      fetchUserDebounceTimer = setTimeout(() => {
        fetchUser()
        fetchUserDebounceTimer = null
      }, 100) // Wait 100ms for multiple events to settle
    },
  }

  //Listen to auth changes from service
  AuthService.addObserver(observer, AUTH_CHANGED, observer.update)
  // Update store user when user is updated
  CustomerService.addObserver(observer, CUSTOMER_UPDATED, observer.update)

  return {
    //state
    user,
    isLoading,
    error,

    //getters
    isAuthenticated,
    isVerified,
    errorCode,

    //actions
    fetchUser,
    loginWithEmail,
    loginWithMobile,
    register,
    verifyRegistration,
    resendVerification,
    logout,
    changePassword,
    resetPasswordViaMobile,
    resetPasswordViaEmail,
    verifyResetPassword,
    changeMobilePhone,
    verifyChangeMobilePhone,
  }
})
