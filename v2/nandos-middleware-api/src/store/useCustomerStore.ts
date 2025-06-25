import { defineStore } from 'pinia'
import { ref, computed, ComputedRef } from 'vue'
import type User from '../model/user.js'

export const useCustomerStore = defineStore('counter', () => {
  const user: User | null = ref(null)

  const isLoggedIn: ComputedRef<boolean> = computed(() => {
    // logic to handle checking if the user is logged in.
    return false
  })

  async function login(): Promise<User | null> {
    // logic to handle login
    return null
  }

  async function logout(): Promise<void> {
    // logic to handle login out
    return null;
  }

  return { user, isLoggedIn, login, logout }
})