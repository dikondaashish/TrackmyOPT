import { API_BASE_URL, WEBSITE_URL } from './config';

// DOM Elements
const loadingEl = document.getElementById('loading')!;
const errorEl = document.getElementById('error')!;
const notSignedInEl = document.getElementById('not-signed-in')!;
const signedInEl = document.getElementById('signed-in')!;
const signInBtn = document.getElementById('sign-in-btn') as HTMLButtonElement;
const dashboardBtn = document.getElementById('dashboard-btn')!;
const signOutBtn = document.getElementById('sign-out-btn')!;
const optDataEl = document.getElementById('opt-data')!;
const countdownValueEl = document.getElementById('countdown-value')!;

// State
let idToken: string | null = null;
let signedIn = false;

// Show error message
function showError(message: string) {
  errorEl.textContent = message;
  errorEl.classList.add('active');
  setTimeout(() => {
    errorEl.classList.remove('active');
  }, 5000);
}

// Show loading state
function showLoading(show: boolean) {
  if (show) {
    loadingEl.classList.add('active');
    notSignedInEl.classList.remove('active');
    signedInEl.classList.remove('active');
  } else {
    loadingEl.classList.remove('active');
  }
}

// Calculate days remaining
function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format date for display
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Fetch user data from API
async function fetchUserData() {
  if (!idToken) {
    throw new Error('No token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, sign out
      await signOut();
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// Display user data
function displayUserData(data: any) {
  const { profile, status } = data;

  if (!status) {
    optDataEl.innerHTML = `
      <div class="info-row">
        <span class="info-label">No OPT data yet</span>
      </div>
      <div class="info-row">
        <span class="info-label" style="font-size: 12px; opacity: 0.7;">
          Complete your profile on the dashboard
        </span>
      </div>
    `;
    countdownValueEl.textContent = '--';
    return;
  }

  // Calculate days remaining
  const daysRemaining = calculateDaysRemaining(status.opt_ead_end_date);
  countdownValueEl.textContent = daysRemaining.toString();

  // Display OPT information
  optDataEl.innerHTML = `
    <div class="info-row">
      <span class="info-label">OPT Start</span>
      <span class="info-value">${formatDate(status.opt_start_date)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">OPT End</span>
      <span class="info-value">${formatDate(status.opt_ead_end_date)}</span>
    </div>
    ${
      status.stem_start_date
        ? `
    <div class="info-row">
      <span class="info-label">STEM Start</span>
      <span class="info-value">${formatDate(status.stem_start_date)}</span>
    </div>
    `
        : ''
    }
    <div class="info-row">
      <span class="info-label">STEM Eligible</span>
      <span class="info-value">${profile.is_stem_eligible ? 'Yes' : 'No'}</span>
    </div>
  `;
}

// Load user data and display it
async function loadUserData() {
  showLoading(true);
  try {
    const data = await fetchUserData();
    displayUserData(data);
    showLoading(false);
    signedInEl.classList.add('active');
  } catch (error: any) {
    showLoading(false);
    showError(error.message || 'Failed to load data');
    // If error, show not signed in view
    notSignedInEl.classList.add('active');
  }
}

// Sign in
async function signIn() {
  signInBtn.disabled = true;
  signInBtn.textContent = 'Signing in...';
  showLoading(true);

  try {
    const response = await chrome.runtime.sendMessage({ type: 'BEGIN_AUTH' });

    if (!response.ok) {
      throw new Error(response.err || 'Authentication failed');
    }

    // Auth successful, reload popup state
    await checkAuthState();
  } catch (error: any) {
    showLoading(false);
    showError(error.message || 'Sign in failed');
    signInBtn.disabled = false;
    signInBtn.textContent = 'Sign In or Create Account';
    notSignedInEl.classList.add('active');
  }
}

// Sign out
async function signOut() {
  const response = await chrome.runtime.sendMessage({ type: 'SIGN_OUT' });
  if (response.ok) {
    signedIn = false;
    idToken = null;
    notSignedInEl.classList.add('active');
    signedInEl.classList.remove('active');
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ url: WEBSITE_URL });
}

// Check authentication state
async function checkAuthState() {
  showLoading(true);

  try {
    const result = await chrome.storage.sync.get(['signedIn', 'idToken']);
    signedIn = result.signedIn || false;
    idToken = result.idToken || null;

    if (signedIn && idToken) {
      // User is signed in, load their data
      await loadUserData();
    } else {
      // User is not signed in
      showLoading(false);
      notSignedInEl.classList.add('active');
    }
  } catch (error: any) {
    showLoading(false);
    showError(error.message || 'Failed to check auth state');
    notSignedInEl.classList.add('active');
  }
}

// Event listeners
signInBtn.addEventListener('click', signIn);
dashboardBtn.addEventListener('click', openDashboard);
signOutBtn.addEventListener('click', signOut);

// Initialize popup
checkAuthState();
