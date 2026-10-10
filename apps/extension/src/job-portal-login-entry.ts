import { prefillSavedPortalLogin } from './job-portal/portal-login-prefill';

if (window.top === window.self) {
  void prefillSavedPortalLogin();
}
