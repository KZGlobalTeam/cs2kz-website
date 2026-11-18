const SIGN_IN_HINT_STORAGE_KEY = 'cs2kz:signin-hint-dismissed-v1'

export function isSignInHintDismissed() {
  return window.localStorage.getItem(SIGN_IN_HINT_STORAGE_KEY) === 'true'
}

export function dismissSignInHint() {
  window.localStorage.setItem(SIGN_IN_HINT_STORAGE_KEY, 'true')
}
