import { prefillSavedPortalLogin } from './portal-login-prefill';

if (window.top === window.self) {
  void prefillSavedPortalLogin();
}
