import { type RouteRecordRaw } from 'vue-router';

const SignIn = () => import('@/views/sign-in/sign-in.vue');
const SignInPasswordReset = () => import('@/views/sign-in/password-reset/password-reset.vue');
const SignInPasswordResetVerify = () => import('@/views/sign-in/password-reset/verify/password-reset-verify.vue');
const SignUp = () => import('@/views/sign-up/sign-up.vue');
const SignUpVerify = () => import('@/views/sign-up/verify/sign-up-verify.vue');

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/sign-in',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/sign-in/password-reset',
    name: 'SignInPasswordReset',
    component: SignInPasswordReset,
  },
  {
    path: '/sign-in/password-reset/verify',
    name: 'SignInPasswordResetVerify',
    component: SignInPasswordResetVerify,
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/sign-up/verify',
    name: 'SignUpVerify',
    component: SignUpVerify
  },
]

export default authRoutes
