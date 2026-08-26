/**
 * IRCTC Application Core Logic
 * Handles Authentication, Strict Registration Validation, Simulated Secure OTP, and Dynamic Notch
 */

import { FICTIONAL_ACCOUNT, getStoredUsers, saveUser } from './supabase.js';
import { initBookingEngine, showToast } from './booking.js';

// State
let loginCaptchaCode = '';
let regCaptchaCode = '';
let currentGeneratedOtp = null;
let currentUser = null;

// Initialize App Core
function initApp() {
  // Ensure default fictional account is seeded
  getStoredUsers();

  // Restore existing session if any
  const savedSession = localStorage.getItem('irctc_active_session');
  if (savedSession) {
    try {
      currentUser = JSON.parse(savedSession);
      updateNotchAuthState();
    } catch (e) {
      console.error(e);
    }
  }

  // Bind Events
  initModalEvents();
  initCaptcha();
  initLoginForm();
  initRegisterForm();

  // Initialize Ticket Booking System & Station Autocomplete
  initBookingEngine();
}

// Safely initialize whether DOM is already parsed or still loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ==========================================================================
   CAPTCHA GENERATOR (Canvas Based)
   ========================================================================== */
function generateCaptchaText(length = 5) {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

function renderCaptcha(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Noise Lines
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.15})`;
    ctx.lineWidth = 1 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();
  }

  // Draw Characters
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textBaseline = 'middle';

  const charSpacing = canvas.width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#a1a1aa';
    const x = (i + 1) * charSpacing - 4;
    const y = canvas.height / 2 + (Math.random() * 6 - 3);
    const angle = (Math.random() - 0.5) * 0.3;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

function refreshLoginCaptcha() {
  loginCaptchaCode = generateCaptchaText(5);
  renderCaptcha('login-captcha-canvas', loginCaptchaCode);
}

function refreshRegCaptcha() {
  regCaptchaCode = generateCaptchaText(5);
  renderCaptcha('reg-captcha-canvas', regCaptchaCode);
}

function initCaptcha() {
  refreshLoginCaptcha();
  refreshRegCaptcha();

  document.getElementById('refresh-login-captcha')?.addEventListener('click', refreshLoginCaptcha);
  document.getElementById('login-captcha-display')?.addEventListener('click', refreshLoginCaptcha);
  document.getElementById('refresh-reg-captcha')?.addEventListener('click', refreshRegCaptcha);
  document.getElementById('reg-captcha-display')?.addEventListener('click', refreshRegCaptcha);
}

/* ==========================================================================
   MODAL & TAB NAVIGATION
   ========================================================================== */
function initModalEvents() {
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('open-auth-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const switchLink = document.getElementById('switch-to-register');

  openBtn?.addEventListener('click', () => {
    openModal('login');
  });

  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  tabLogin?.addEventListener('click', () => switchTab('login'));
  tabRegister?.addEventListener('click', () => switchTab('register'));
  switchLink?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('register');
  });
}

export function openModal(mode = 'login') {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('active');
  hideAlert();
  switchTab(mode);
}

export function closeModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('active');
  hideAlert();
}

function switchTab(mode) {
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  hideAlert();

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    refreshLoginCaptcha();
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    goToRegStep(1);
    refreshRegCaptcha();
  }
}

function showAlert(message, type = 'error') {
  const alert = document.getElementById('auth-alert');
  alert.textContent = message;
  alert.className = `auth-alert ${type}`;
  alert.style.display = 'block';
}

function hideAlert() {
  const alert = document.getElementById('auth-alert');
  alert.style.display = 'none';
  alert.textContent = '';
}

/* ==========================================================================
   LOGIN FORM LOGIC
   ========================================================================== */
function initLoginForm() {
  const form = document.getElementById('login-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const captcha = document.getElementById('login-captcha-input').value.trim();

    // Captcha validation
    if (captcha.toLowerCase() !== loginCaptchaCode.toLowerCase()) {
      showAlert('Invalid Captcha code. Please try again.');
      refreshLoginCaptcha();
      return;
    }

    // Verify against stored users
    const users = getStoredUsers();
    const matched = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (!matched) {
      showAlert('Invalid User ID or Password.');
      refreshLoginCaptcha();
      return;
    }

    // Login successful
    currentUser = matched;
    localStorage.setItem('irctc_active_session', JSON.stringify(currentUser));
    showAlert(`Welcome back, ${currentUser.firstName || currentUser.username}!`, 'success');
    showToast(`Logged in as ${currentUser.username}`);
    
    setTimeout(() => {
      closeModal();
      updateNotchAuthState();
    }, 800);
  });
}

/* ==========================================================================
   REGISTRATION FORM & STRICT VALIDATION
   ========================================================================== */
function goToRegStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.register-step-pane').forEach(pane => pane.style.display = 'none');
  document.querySelectorAll('.step-indicator').forEach(ind => ind.classList.remove('active'));

  // Show target step
  const targetPane = document.getElementById(`reg-step-${stepNumber}`);
  const targetIndicator = document.querySelector(`.step-indicator[data-step="${stepNumber}"]`);

  if (targetPane) targetPane.style.display = 'block';
  if (targetIndicator) targetIndicator.classList.add('active');
}

// Strong Password Check (Min 8, 1 uppercase, 1 lowercase, 1 number, 1 special char)
function isStrongPassword(pass) {
  const minLength = pass.length >= 8 && pass.length <= 25;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

function validateStep(stepNumber) {
  hideAlert();

  // Step 1: Account Details
  if (stepNumber === 1) {
    const username = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    const lang = document.getElementById('reg-language').value;

    if (!username || username.length < 3) {
      showAlert('User ID is required (minimum 3 characters).');
      return false;
    }
    const users = getStoredUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      showAlert('This User ID is already registered. Please choose another.');
      return false;
    }
    if (!isStrongPassword(pass)) {
      showAlert('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return false;
    }
    if (pass !== confirm) {
      showAlert('Passwords do not match.');
      return false;
    }
    if (!lang) {
      showAlert('Please select your preferred language.');
      return false;
    }
    return true;
  }

  // Step 2: Personal Details
  if (stepNumber === 2) {
    const fname = document.getElementById('reg-fname').value.trim();
    const lname = document.getElementById('reg-lname').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const dob = document.getElementById('reg-dob').value;
    const occ = document.getElementById('reg-occupation').value;
    const marital = document.getElementById('reg-marital').value;

    if (!fname) {
      showAlert('First Name is required.');
      return false;
    }
    if (!lname) {
      showAlert('Last Name is required.');
      return false;
    }
    if (!gender) {
      showAlert('Gender is required.');
      return false;
    }
    if (!dob) {
      showAlert('Date of Birth is required.');
      return false;
    }
    if (!occ) {
      showAlert('Occupation is required.');
      return false;
    }
    if (!marital) {
      showAlert('Marital Status is required.');
      return false;
    }
    return true;
  }

  // Step 3: Contact & Address Details
  if (stepNumber === 3) {
    const email = document.getElementById('reg-email').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const door = document.getElementById('reg-door').value.trim();
    const street = document.getElementById('reg-street').value.trim();
    const city = document.getElementById('reg-city').value.trim();
    const state = document.getElementById('reg-state').value.trim();
    const pincode = document.getElementById('reg-pincode').value.trim();
    const country = document.getElementById('reg-country').value.trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      showAlert('Please enter a valid email address.');
      return false;
    }
    if (!mobile || mobile.length !== 10 || isNaN(mobile)) {
      showAlert('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!door) {
      showAlert('Flat / Door / House No. is required.');
      return false;
    }
    if (!street) {
      showAlert('Street / Area Name is required.');
      return false;
    }
    if (!city) {
      showAlert('City / Town is required.');
      return false;
    }
    if (!state) {
      showAlert('State is required.');
      return false;
    }
    if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
      showAlert('Please enter a valid 6-digit PIN code.');
      return false;
    }
    if (!country) {
      showAlert('Country is required.');
      return false;
    }
    return true;
  }

  return true;
}

function initRegisterForm() {
  // Step Navigation Buttons (Strict validation check before advancing)
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.getAttribute('data-next'), 10);
      const currentStep = nextStep - 1;
      if (validateStep(currentStep)) {
        goToRegStep(nextStep);
      }
    });
  });

  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
      goToRegStep(prevStep);
    });
  });

  // Step Indicators Click (Strict check: cannot jump forward without validation)
  document.querySelectorAll('.step-indicator').forEach(ind => {
    ind.addEventListener('click', () => {
      const target = parseInt(ind.getAttribute('data-step'), 10);
      let canNavigate = true;
      for (let s = 1; s < target; s++) {
        if (!validateStep(s)) {
          canNavigate = false;
          break;
        }
      }
      if (canNavigate) {
        goToRegStep(target);
      }
    });
  });

  // Send OTP Simulator (Dispatches realistic OTP without displaying code in UI text)
  const sendOtpBtn = document.getElementById('send-otp-btn');
  sendOtpBtn?.addEventListener('click', () => {
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim();

    if (!mobile || mobile.length !== 10) {
      showAlert('Please enter a valid mobile number in Step 3 first.');
      goToRegStep(3);
      return;
    }

    currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Realistic timer & notification
    sendOtpBtn.disabled = true;
    let countdown = 30;
    sendOtpBtn.textContent = `Resend (${countdown}s)`;
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = 'Resend OTP';
      } else {
        sendOtpBtn.textContent = `Resend (${countdown}s)`;
      }
    }, 1000);

    const helpText = document.getElementById('otp-help-text');
    helpText.innerHTML = `OTP sent to <strong>******${mobile.slice(-4)}</strong> &amp; <strong>${email.split('@')[0].slice(0, 2)}***@${email.split('@')[1]}</strong>`;

    // Realistic toast notification simulating incoming SMS/Email
    showToast(`📱 SMS received: Your IRCTC Verification OTP is ${currentGeneratedOtp}`);
  });

  // Complete Registration Submit
  const regForm = document.getElementById('register-form');
  regForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAlert();

    // Verify all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const captcha = document.getElementById('reg-captcha-input').value.trim();
    if (captcha.toLowerCase() !== regCaptchaCode.toLowerCase()) {
      showAlert('Invalid Security Captcha code.');
      refreshRegCaptcha();
      return;
    }

    const enteredOtp = document.getElementById('reg-otp-input').value.trim();
    if (!currentGeneratedOtp) {
      showAlert('Please click "Send OTP" to request your verification code.');
      return;
    }
    if (enteredOtp !== currentGeneratedOtp) {
      showAlert('Incorrect OTP entered. Please verify the code and try again.');
      return;
    }

    // Assemble User Object
    const newUser = {
      username: document.getElementById('reg-username').value.trim(),
      password: document.getElementById('reg-password').value,
      preferredLanguage: document.getElementById('reg-language').value,
      firstName: document.getElementById('reg-fname').value.trim(),
      middleName: document.getElementById('reg-mname').value.trim(),
      lastName: document.getElementById('reg-lname').value.trim(),
      gender: document.getElementById('reg-gender').value,
      dob: document.getElementById('reg-dob').value,
      occupation: document.getElementById('reg-occupation').value,
      maritalStatus: document.getElementById('reg-marital').value,
      email: document.getElementById('reg-email').value.trim(),
      mobile: document.getElementById('reg-mobile').value.trim(),
      address: {
        door: document.getElementById('reg-door').value.trim(),
        street: document.getElementById('reg-street').value.trim(),
        city: document.getElementById('reg-city').value.trim(),
        state: document.getElementById('reg-state').value.trim(),
        pincode: document.getElementById('reg-pincode').value.trim(),
        country: 'India'
      }
    };

    saveUser(newUser);
    currentUser = newUser;
    localStorage.setItem('irctc_active_session', JSON.stringify(currentUser));

    showAlert('Account created successfully! Logging you in...', 'success');
    showToast(`Welcome to IRCTC, ${newUser.firstName}!`);

    setTimeout(() => {
      closeModal();
      updateNotchAuthState();
    }, 1200);
  });
}

/* ==========================================================================
   NOTCH AUTH STATE UPDATE
   ========================================================================== */
function updateNotchAuthState() {
  const container = document.getElementById('notch-auth-container');
  if (!container) return;

  if (currentUser) {
    const displayName = currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser.username;
    container.innerHTML = `
      <div class="user-profile-badge">
        <span class="user-name-display">${displayName}</span>
        <button class="btn-logout" id="logout-btn">LOGOUT</button>
      </div>
    `;

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('irctc_active_session');
      window.location.reload();
    });
  } else {
    container.innerHTML = `
      <button class="btn-login" id="open-auth-btn">LOGIN</button>
    `;
    document.getElementById('open-auth-btn')?.addEventListener('click', () => {
      openModal('login');
    });
  }
}
