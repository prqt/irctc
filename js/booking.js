/**
 * IRCTC Ticket Booking Engine
 * Manages Indian Stations, Auth Protection, Auto-Fill, Realistic Buffering,
 * Mouse/Touch Swipe-To-Tear Human Verification, Payment & Complete Form Clearing
 */

import { populateStationDatalist } from './stations.js';
import { openModal } from './app.js';

// Available Mock Trains
export const TRAINS_DATA = [
  {
    number: '22436',
    name: 'VANDE BHARAT EXP',
    type: 'Superfast / Vande Bharat',
    depTime: '06:00',
    depStation: 'NDLS',
    arrTime: '14:00',
    arrStation: 'BSB',
    duration: '08h 00m',
    runsOn: ['M', 'T', 'W', 'F', 'S', 'S'],
    classes: [
      { code: 'EC', name: 'Exec Chair Car', fare: 2420, status: 'AVL 42', statusType: 'avl' },
      { code: 'CC', name: 'AC Chair Car', fare: 1750, status: 'AVL 86', statusType: 'avl' }
    ]
  },
  {
    number: '12952',
    name: 'MUMBAI RAJDHANI EXP',
    type: 'Rajdhani Express',
    depTime: '16:55',
    depStation: 'NDLS',
    arrTime: '08:35',
    arrStation: 'MMCT',
    duration: '15h 40m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    classes: [
      { code: '1A', name: 'AC 1st Class', fare: 4150, status: 'AVL 12', statusType: 'avl' },
      { code: '2A', name: 'AC 2 Tier', fare: 2850, status: 'AVL 28', statusType: 'avl' },
      { code: '3A', name: 'AC 3 Tier', fare: 1980, status: 'AVL 64', statusType: 'avl' }
    ]
  },
  {
    number: '12002',
    name: 'SHATABDI EXPRESS',
    type: 'Shatabdi Express',
    depTime: '06:15',
    depStation: 'NDLS',
    arrTime: '14:40',
    arrStation: 'BPL',
    duration: '08h 25m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    classes: [
      { code: 'EC', name: 'Exec Chair Car', fare: 2180, status: 'AVL 24', statusType: 'avl' },
      { code: 'CC', name: 'AC Chair Car', fare: 1290, status: 'AVL 112', statusType: 'avl' }
    ]
  },
  {
    number: '12260',
    name: 'DURONTO EXPRESS',
    type: 'Duronto Express',
    depTime: '19:40',
    depStation: 'NDLS',
    arrTime: '12:45',
    arrStation: 'HWH',
    duration: '17h 05m',
    runsOn: ['M', 'T', 'T', 'S'],
    classes: [
      { code: '1A', name: 'AC 1st Class', fare: 3890, status: 'AVL 08', statusType: 'avl' },
      { code: '2A', name: 'AC 2 Tier', fare: 2640, status: 'AVL 35', statusType: 'avl' },
      { code: '3A', name: 'AC 3 Tier', fare: 1820, status: 'AVL 90', statusType: 'avl' },
      { code: 'SL', name: 'Sleeper Class', fare: 720, status: 'AVL 140', statusType: 'avl' }
    ]
  }
];

// Current Booking Session State
export const bookingState = {
  search: {
    from: 'NDLS - New Delhi (Delhi)',
    to: 'MMCT - Mumbai Central (Maharashtra)',
    date: new Date().toISOString().split('T')[0],
    class: 'ALL',
    quota: 'GENERAL'
  },
  selectedTrain: null,
  selectedClass: null,
  passengers: [],
  contact: {
    email: '',
    mobile: ''
  },
  pricing: {
    baseFare: 0,
    irctcFee: 17.70,
    gst: 0,
    total: 0
  },
  isHumanVerified: false,
  ticket: null
};

// DOM Initializer
export function initBookingEngine() {
  // Populate all Indian Stations in datalist
  populateStationDatalist('stations-list');

  // Set default date to tomorrow
  const dateInput = document.getElementById('search-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    dateInput.value = dateStr;
    dateInput.min = new Date().toISOString().split('T')[0];
    bookingState.search.date = dateStr;
  }

  // Bind Search events
  document.getElementById('btn-swap')?.addEventListener('click', swapStations);
  document.getElementById('train-search-form')?.addEventListener('submit', handleSearchSubmit);

  // Navigation Links
  document.getElementById('back-to-search')?.addEventListener('click', () => switchView('search'));
  document.getElementById('back-to-trains')?.addEventListener('click', () => switchView('trains'));
  document.getElementById('back-to-passengers')?.addEventListener('click', () => switchView('passengers'));
  document.getElementById('btn-passengers-back')?.addEventListener('click', () => switchView('trains'));
  document.getElementById('back-to-review')?.addEventListener('click', () => switchView('review'));
  document.getElementById('nav-home-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('search');
  });

  // Passenger Events
  document.getElementById('add-passenger-btn')?.addEventListener('click', () => addPassengerRow());
  document.getElementById('passenger-form')?.addEventListener('submit', handlePassengersSubmit);

  // Review & Swipe-To-Tear Human Verification
  initSwipeToTear();
  document.getElementById('btn-proceed-to-payment')?.addEventListener('click', () => {
    if (!bookingState.isHumanVerified) {
      showToast('Please swipe down to tear the pass and verify.');
      return;
    }
    switchView('payment');
  });

  // Payment Events
  initPaymentTabs();
  document.getElementById('payment-form')?.addEventListener('submit', handlePaymentSubmit);

  // Ticket Post Actions
  document.getElementById('btn-copy-pnr')?.addEventListener('click', copyPnr);
  document.getElementById('btn-download-pdf')?.addEventListener('click', () => window.print());
  document.getElementById('btn-book-another')?.addEventListener('click', () => {
    clearAllForms();
    switchView('search');
  });
}

/* ==========================================================================
   FAKE REALISTIC BUFFERING SIMULATION
   ========================================================================== */
export function triggerFakeBuffering(title, subtitle, durationMs, onComplete) {
  const overlay = document.getElementById('loading-overlay');
  const titleEl = document.getElementById('loading-title');
  const subEl = document.getElementById('loading-sub');
  const fillEl = document.getElementById('progress-fill');

  if (!overlay) {
    if (onComplete) onComplete();
    return;
  }

  titleEl.textContent = title;
  subEl.textContent = subtitle;
  fillEl.style.width = '0%';
  overlay.style.display = 'flex';

  // Smooth fake progress animation
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, Math.floor((elapsed / durationMs) * 100));
    fillEl.style.width = `${progress}%`;

    if (elapsed >= durationMs) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.style.display = 'none';
        if (onComplete) onComplete();
      }, 150);
    }
  }, 40);
}

/* ==========================================================================
   VIEW SWITCHER & STEPPER
   ========================================================================== */
export function switchView(viewName) {
  const views = ['search', 'trains', 'passengers', 'review', 'payment', 'ticket'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = (v === viewName) ? 'block' : 'none';
  });

  // Update Stepper
  const steps = document.querySelectorAll('.stepper-step');
  let currentPassed = true;
  steps.forEach(step => {
    const sName = step.getAttribute('data-step');
    step.classList.remove('active', 'completed');
    if (sName === viewName) {
      step.classList.add('active');
      currentPassed = false;
    } else if (currentPassed) {
      step.classList.add('completed');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function swapStations() {
  const fromEl = document.getElementById('search-from');
  const toEl = document.getElementById('search-to');
  const temp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = temp;
}

/* ==========================================================================
   STEP 1: SEARCH TRAINS (AUTH CHECK & AUTO-FILL)
   ========================================================================== */
function handleSearchSubmit(e) {
  e.preventDefault();

  // Check Login Requirement
  const activeSession = localStorage.getItem('irctc_active_session');
  if (!activeSession) {
    showToast('🔒 IRCTC Login Required to search and reserve train tickets.');
    openModal('login');
    return;
  }

  bookingState.search.from = document.getElementById('search-from').value.trim();
  bookingState.search.to = document.getElementById('search-to').value.trim();
  bookingState.search.date = document.getElementById('search-date').value;
  bookingState.search.class = document.getElementById('search-class').value;
  bookingState.search.quota = document.getElementById('search-quota').value;

  // Realistic CRIS Server Buffering
  triggerFakeBuffering(
    'Connecting to CRIS Central Railway System...',
    'Querying live seat matrix, tatkal quotas & dynamic fare algorithm',
    1100,
    () => {
      renderTrainsList();
      switchView('trains');
    }
  );
}

/* ==========================================================================
   STEP 2: TRAIN LIST RENDERING
   ========================================================================== */
function renderTrainsList() {
  const summaryEl = document.getElementById('search-summary-text');
  const fromCode = bookingState.search.from.split(' - ')[0] || bookingState.search.from;
  const toCode = bookingState.search.to.split(' - ')[0] || bookingState.search.to;
  summaryEl.textContent = `${fromCode} → ${toCode} | ${formatDate(bookingState.search.date)} | ${bookingState.search.quota} Quota`;

  const container = document.getElementById('trains-list-container');
  container.innerHTML = '';

  TRAINS_DATA.forEach(train => {
    const card = document.createElement('div');
    card.className = 'train-card';

    let classPillsHtml = '';
    train.classes.forEach(cls => {
      classPillsHtml += `
        <div class="class-fare-box" data-train="${train.number}" data-class="${cls.code}" data-fare="${cls.fare}">
          <div class="class-header">
            <span class="class-code">${cls.code}</span>
            <span class="class-fare">₹${cls.fare}</span>
          </div>
          <div class="class-status ${cls.statusType}">${cls.status}</div>
          <button type="button" class="btn-book-class">SELECT</button>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="train-card-header">
        <div>
          <div class="train-title">${train.number} ${train.name}</div>
          <div class="train-type-tag">${train.type}</div>
        </div>
        <div class="train-run-days">
          Runs: ${train.runsOn.map(d => `<span class="day-chip">${d}</span>`).join('')}
        </div>
      </div>

      <div class="train-schedule-grid">
        <div class="schedule-point dep">
          <div class="time-big">${train.depTime}</div>
          <div class="station-code">${fromCode}</div>
          <div class="day-indicator">${formatDate(bookingState.search.date)}</div>
        </div>

        <div class="schedule-duration">
          <span class="duration-text">${train.duration}</span>
          <div class="duration-track">
            <span class="track-line"></span>
            <span class="train-icon">&#x1f686;</span>
          </div>
        </div>

        <div class="schedule-point arr">
          <div class="time-big">${train.arrTime}</div>
          <div class="station-code">${toCode}</div>
          <div class="day-indicator">Same / Next Day</div>
        </div>
      </div>

      <div class="train-classes-scroll">
        ${classPillsHtml}
      </div>
    `;

    // Bind Class selection
    card.querySelectorAll('.class-fare-box').forEach(box => {
      box.addEventListener('click', () => {
        const trainNum = box.getAttribute('data-train');
        const classCode = box.getAttribute('data-class');
        selectTrainAndClass(trainNum, classCode);
      });
    });

    container.appendChild(card);
  });
}

function selectTrainAndClass(trainNumber, classCode) {
  const train = TRAINS_DATA.find(t => t.number === trainNumber);
  const cls = train.classes.find(c => c.code === classCode);
  bookingState.selectedTrain = train;
  bookingState.selectedClass = cls;

  // Auto-fill logged in user's profile info into passenger 1 and contact info
  const activeSession = localStorage.getItem('irctc_active_session');
  let defaultPassenger = { name: '', age: 28, gender: 'Male', berth: 'No Preference', food: 'Veg', concession: 'None' };

  if (activeSession) {
    try {
      const u = JSON.parse(activeSession);
      const fullName = `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.replace(/\s+/g, ' ').trim() || u.username;
      
      // Calculate age from DOB if present
      let userAge = 28;
      if (u.dob) {
        const birthYear = new Date(u.dob).getFullYear();
        if (!isNaN(birthYear)) userAge = Math.max(18, new Date().getFullYear() - birthYear);
      }

      defaultPassenger.name = fullName;
      defaultPassenger.age = userAge;
      defaultPassenger.gender = u.gender || 'Male';

      if (u.email) document.getElementById('booking-contact-email').value = u.email;
      if (u.mobile) document.getElementById('booking-contact-mobile').value = u.mobile;
    } catch (e) {
      console.error(e);
    }
  }

  bookingState.passengers = [defaultPassenger];
  renderPassengerInputs();
  switchView('passengers');
}

/* ==========================================================================
   STEP 3: PASSENGER INPUTS & VALIDATION
   ========================================================================== */
function renderPassengerInputs() {
  const pill = document.getElementById('passenger-train-pill');
  pill.textContent = `${bookingState.selectedTrain.number} ${bookingState.selectedTrain.name} | Class: ${bookingState.selectedClass.code} (₹${bookingState.selectedClass.fare}/seat)`;

  const container = document.getElementById('passengers-inputs-container');
  container.innerHTML = '';

  bookingState.passengers.forEach((p, index) => {
    const card = document.createElement('div');
    card.className = 'passenger-input-card';
    card.setAttribute('data-index', index);

    card.innerHTML = `
      <div class="passenger-card-header">
        <div class="pax-title">Passenger #${index + 1} ${index === 0 ? '<span class="primary-pax-tag">(Primary / Account Holder)</span>' : ''}</div>
        ${index > 0 ? `<button type="button" class="btn-remove-pax" data-remove="${index}">&times; Remove</button>` : ''}
      </div>

      <div class="form-row three-col">
        <div class="input-block">
          <label>Full Name *</label>
          <input type="text" class="pax-name" value="${p.name || ''}" placeholder="Full Name as on Govt ID" required>
        </div>
        <div class="input-block">
          <label>Age (Years) *</label>
          <input type="number" class="pax-age" value="${p.age || ''}" placeholder="Age" min="1" max="120" required>
        </div>
        <div class="input-block">
          <label>Gender *</label>
          <select class="pax-gender" required>
            <option value="Male" ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Transgender" ${p.gender === 'Transgender' ? 'selected' : ''}>Transgender</option>
          </select>
        </div>
      </div>

      <div class="form-row three-col">
        <div class="input-block">
          <label>Berth / Seat Preference</label>
          <select class="pax-berth">
            <option value="No Preference" ${p.berth === 'No Preference' ? 'selected' : ''}>No Preference</option>
            <option value="Lower Berth" ${p.berth === 'Lower Berth' ? 'selected' : ''}>Lower Berth (LB)</option>
            <option value="Middle Berth" ${p.berth === 'Middle Berth' ? 'selected' : ''}>Middle Berth (MB)</option>
            <option value="Upper Berth" ${p.berth === 'Upper Berth' ? 'selected' : ''}>Upper Berth (UB)</option>
            <option value="Side Lower" ${p.berth === 'Side Lower' ? 'selected' : ''}>Side Lower (SL)</option>
            <option value="Side Upper" ${p.berth === 'Side Upper' ? 'selected' : ''}>Side Upper (SU)</option>
            <option value="Window Side" ${p.berth === 'Window Side' ? 'selected' : ''}>Window Side (WS)</option>
          </select>
        </div>
        <div class="input-block">
          <label>Food Preference</label>
          <select class="pax-food">
            <option value="Veg" ${p.food === 'Veg' ? 'selected' : ''}>Veg Meal</option>
            <option value="Non-Veg" ${p.food === 'Non-Veg' ? 'selected' : ''}>Non-Veg Meal</option>
            <option value="No Food" ${p.food === 'No Food' ? 'selected' : ''}>No Food</option>
          </select>
        </div>
        <div class="input-block">
          <label>Concession / Sr. Citizen</label>
          <select class="pax-concession">
            <option value="None" ${p.concession === 'None' ? 'selected' : ''}>None (Standard)</option>
            <option value="Senior Citizen" ${p.concession === 'Senior Citizen' ? 'selected' : ''}>Senior Citizen (40% off)</option>
            <option value="Divyangjan" ${p.concession === 'Divyangjan' ? 'selected' : ''}>Divyangjan</option>
          </select>
        </div>
      </div>
    `;

    card.querySelector('.btn-remove-pax')?.addEventListener('click', () => {
      bookingState.passengers.splice(index, 1);
      renderPassengerInputs();
    });

    container.appendChild(card);
  });
}

function addPassengerRow() {
  if (bookingState.passengers.length >= 6) {
    showToast('Maximum 6 passengers allowed per booking.');
    return;
  }
  collectPassengerFormValues();
  bookingState.passengers.push({ name: '', age: '', gender: 'Male', berth: 'No Preference', food: 'Veg', concession: 'None' });
  renderPassengerInputs();
}

function collectPassengerFormValues() {
  const cards = document.querySelectorAll('.passenger-input-card');
  const list = [];
  cards.forEach(card => {
    list.push({
      name: card.querySelector('.pax-name').value.trim(),
      age: parseInt(card.querySelector('.pax-age').value, 10) || '',
      gender: card.querySelector('.pax-gender').value,
      berth: card.querySelector('.pax-berth').value,
      food: card.querySelector('.pax-food').value,
      concession: card.querySelector('.pax-concession').value
    });
  });
  bookingState.passengers = list;
}

function handlePassengersSubmit(e) {
  e.preventDefault();
  collectPassengerFormValues();

  for (let i = 0; i < bookingState.passengers.length; i++) {
    const p = bookingState.passengers[i];
    if (!p.name) {
      showToast(`Please enter full name for Passenger #${i + 1}`);
      return;
    }
    if (!p.age || p.age < 1 || p.age > 120) {
      showToast(`Please enter valid age for Passenger #${i + 1}`);
      return;
    }
  }

  const email = document.getElementById('booking-contact-email').value.trim();
  const mobile = document.getElementById('booking-contact-mobile').value.trim();

  if (!email || !mobile || mobile.length !== 10) {
    showToast('Please enter valid contact email and 10-digit mobile number.');
    return;
  }

  bookingState.contact.email = email;
  bookingState.contact.mobile = mobile;

  calculateBill();
  renderPaperBill();
  resetSwipeToTear();
  switchView('review');
}

/* ==========================================================================
   STEP 4: PAPER BILL CALCULATION & RENDERING
   ========================================================================== */
function calculateBill() {
  const perTicket = bookingState.selectedClass.fare;
  let totalBase = 0;

  bookingState.passengers.forEach(p => {
    let fare = perTicket;
    if (p.concession === 'Senior Citizen' && p.age >= 60) {
      fare = Math.round(fare * 0.6);
    }
    p.calculatedFare = fare;
    totalBase += fare;
  });

  const irctcFee = 17.70;
  const gst = Math.round(totalBase * 0.05 * 100) / 100;
  const grandTotal = totalBase + irctcFee + gst;

  bookingState.pricing = {
    baseFare: totalBase,
    irctcFee: irctcFee,
    gst: gst,
    total: grandTotal
  };
}

function renderPaperBill() {
  const dateStr = formatDate(bookingState.search.date);
  document.getElementById('bill-date-time').textContent = `INVOICE DATE: ${new Date().toLocaleDateString('en-GB')} | IRCTC ONLINE`;

  const journeyInfo = document.getElementById('bill-journey-info');
  journeyInfo.innerHTML = `
    <div class="bill-row">
      <span class="bill-label">TRAIN:</span>
      <span class="bill-val bold">${bookingState.selectedTrain.number} ${bookingState.selectedTrain.name}</span>
    </div>
    <div class="bill-row">
      <span class="bill-label">ROUTE:</span>
      <span class="bill-val">${bookingState.search.from.split(' - ')[0]} &rarr; ${bookingState.search.to.split(' - ')[0]}</span>
    </div>
    <div class="bill-row">
      <span class="bill-label">JOURNEY DATE:</span>
      <span class="bill-val">${dateStr} (${bookingState.selectedTrain.depTime} HRS)</span>
    </div>
    <div class="bill-row">
      <span class="bill-label">CLASS / QUOTA:</span>
      <span class="bill-val bold">${bookingState.selectedClass.code} (${bookingState.selectedClass.name}) / ${bookingState.search.quota}</span>
    </div>
  `;

  const paxList = document.getElementById('bill-passengers-list');
  paxList.innerHTML = '';
  bookingState.passengers.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'bill-pax-item';
    row.innerHTML = `
      <div class="pax-meta">
        <span class="pax-num">${i + 1}.</span>
        <span class="pax-name-txt">${p.name.toUpperCase()} (${p.age}, ${p.gender.charAt(0)})</span>
      </div>
      <div class="pax-sub-meta">
        <span>Berth: ${p.berth} | Meal: ${p.food} ${p.concession !== 'None' ? `| ${p.concession}` : ''}</span>
        <span class="pax-fare-txt">₹${p.calculatedFare.toFixed(2)}</span>
      </div>
    `;
    paxList.appendChild(row);
  });

  const fareBox = document.getElementById('bill-fare-breakdown');
  fareBox.innerHTML = `
    <div class="bill-row">
      <span class="bill-label">Base Ticket Fare (${bookingState.passengers.length} Pax):</span>
      <span class="bill-val">₹${bookingState.pricing.baseFare.toFixed(2)}</span>
    </div>
    <div class="bill-row">
      <span class="bill-label">IRCTC Convenience Fee (Incl. GST):</span>
      <span class="bill-val">₹${bookingState.pricing.irctcFee.toFixed(2)}</span>
    </div>
    <div class="bill-row">
      <span class="bill-label">GST / Railway Cess (5%):</span>
      <span class="bill-val">₹${bookingState.pricing.gst.toFixed(2)}</span>
    </div>
  `;

  const totalRow = document.getElementById('bill-total-row');
  totalRow.innerHTML = `
    <span class="bill-total-label">TOTAL AMOUNT PAYABLE:</span>
    <span class="bill-total-amount">₹${bookingState.pricing.total.toFixed(2)}</span>
  `;

  document.getElementById('payment-amount-display').textContent = `Amount to Pay: ₹${bookingState.pricing.total.toFixed(2)}`;

  // Pass preview data
  const passPnr = document.getElementById('pass-temp-pnr');
  if (passPnr) passPnr.textContent = `${bookingState.selectedTrain.number} / ${bookingState.selectedClass.code}`;
  const passRoute = document.getElementById('pass-route-text');
  if (passRoute) passRoute.textContent = `${bookingState.search.from.split(' - ')[0]} → ${bookingState.search.to.split(' - ')[0]}`;
}

/* ==========================================================================
   INTERACTIVE MOUSE/TOUCH SWIPE-TO-TEAR HUMAN VERIFICATION
   ========================================================================== */
function initSwipeToTear() {
  const track = document.getElementById('pass-tear-track');
  const thumb = document.getElementById('tear-slider-thumb');
  const stub = document.getElementById('pass-stub-side');
  const stamp = document.getElementById('tear-success-stamp');
  const proceedBtn = document.getElementById('btn-proceed-to-payment');

  if (!track || !thumb) return;

  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let maxDistance = 0;

  const onStart = (clientY) => {
    if (bookingState.isHumanVerified) return;
    isDragging = true;
    startY = clientY;
    maxDistance = track.clientHeight - thumb.clientHeight;
    thumb.classList.add('dragging');
  };

  const onMove = (clientY) => {
    if (!isDragging || bookingState.isHumanVerified) return;
    const deltaY = clientY - startY;
    currentY = Math.max(0, Math.min(deltaY, maxDistance));
    thumb.style.transform = `translateY(${currentY}px)`;

    // Check if torn (>= 75% down)
    if (currentY >= maxDistance * 0.75) {
      completeTear();
    }
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    thumb.classList.remove('dragging');

    if (!bookingState.isHumanVerified) {
      // Snap back
      thumb.style.transition = 'transform 0.3s ease';
      thumb.style.transform = 'translateY(0px)';
      setTimeout(() => {
        thumb.style.transition = '';
      }, 300);
    }
  };

  function completeTear() {
    isDragging = false;
    bookingState.isHumanVerified = true;

    // Trigger Falling Physics on Stub
    stub.classList.add('falling');

    setTimeout(() => {
      stub.classList.add('torn');
      stub.classList.remove('falling');
      thumb.style.display = 'none';
      stamp.classList.add('active');

      // Unlock payment button
      proceedBtn.disabled = false;
      proceedBtn.innerHTML = `PROCEED TO PAYMENT (₹${bookingState.pricing.total.toFixed(2)}) &rarr;`;
      proceedBtn.classList.add('unlocked');

      showToast('✔ Human verification complete! Security gate unlocked.');
    }, 600);
  }

  // Mouse Listeners
  thumb.addEventListener('mousedown', (e) => {
    e.preventDefault();
    onStart(e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) onMove(e.clientY);
  });

  window.addEventListener('mouseup', onEnd);

  // Touch Listeners (Mobile & Tablet)
  thumb.addEventListener('touchstart', (e) => {
    onStart(e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isDragging) onMove(e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchend', onEnd);
}

function resetSwipeToTear() {
  bookingState.isHumanVerified = false;
  const thumb = document.getElementById('tear-slider-thumb');
  const stub = document.getElementById('pass-stub-side');
  const stamp = document.getElementById('tear-success-stamp');
  const proceedBtn = document.getElementById('btn-proceed-to-payment');

  if (thumb) {
    thumb.style.display = 'flex';
    thumb.style.transform = 'translateY(0px)';
  }
  if (stub) stub.classList.remove('falling', 'torn');
  if (stamp) stamp.classList.remove('active');
  if (proceedBtn) {
    proceedBtn.disabled = true;
    proceedBtn.innerHTML = `LOCKED &mdash; SWIPE TO UNLOCK`;
    proceedBtn.classList.remove('unlocked');
  }
}

/* ==========================================================================
   STEP 5: PAYMENT LOGIC & FORM CLEARING
   ========================================================================== */
function initPaymentTabs() {
  document.querySelectorAll('.pay-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.pay-method-panel').forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const method = tab.getAttribute('data-paymethod');
      const panel = document.getElementById(`panel-${method}`);
      if (panel) panel.style.display = 'block';
    });
  });

  document.getElementById('btn-verify-upi')?.addEventListener('click', () => {
    const val = document.getElementById('upi-id-input').value.trim();
    if (val.includes('@')) {
      showToast(`UPI ID ${val} verified!`);
    } else {
      showToast('Please enter a valid UPI ID (e.g. name@bank)');
    }
  });
}

function handlePaymentSubmit(e) {
  e.preventDefault();

  // Trigger Realistic Payment Buffering
  triggerFakeBuffering(
    'Connecting to Secure IRCTC Payment Gateway...',
    'Performing 256-bit SSL handshake & reserving coach berth matrix',
    1400,
    () => {
      generateConfirmedTicket();
      clearPaymentForms(); // Form fields wiped
      switchView('ticket');
      showToast('Payment successful! Your confirmed e-ticket has been issued.');
    }
  );
}

/* ==========================================================================
   STEP 6: TICKET GENERATION & FINAL VIEW
   ========================================================================== */
function generateConfirmedTicket() {
  const pnr = generatePnr();
  const txnId = `IRCTC${Math.floor(10000000 + Math.random() * 90000000)}`;
  const coachPrefix = bookingState.selectedClass.code === '1A' ? 'H1' : (bookingState.selectedClass.code === '2A' ? 'A1' : (bookingState.selectedClass.code === 'EC' ? 'E1' : 'B3'));

  bookingState.ticket = {
    pnr: pnr,
    txnId: txnId,
    coachPrefix: coachPrefix
  };

  // Populate UI
  document.getElementById('ticket-pnr-display').textContent = pnr;
  document.getElementById('ticket-txn-id').textContent = txnId;
  document.getElementById('ticket-quota-display').textContent = bookingState.search.quota;
  document.getElementById('ticket-class-display').textContent = `${bookingState.selectedClass.code} (${bookingState.selectedClass.name})`;
  document.getElementById('ticket-fare-display').textContent = `₹${bookingState.pricing.total.toFixed(2)}`;

  // Route grid
  const routeEl = document.getElementById('ticket-route-info');
  routeEl.innerHTML = `
    <div class="ticket-route-col">
      <div class="ticket-station-name">${bookingState.search.from}</div>
      <div class="ticket-time-bold">${bookingState.selectedTrain.depTime} HRS</div>
      <div class="ticket-sub-date">${formatDate(bookingState.search.date)}</div>
    </div>
    <div class="ticket-train-center">
      <div class="ticket-train-num">${bookingState.selectedTrain.number}</div>
      <div class="ticket-train-name">${bookingState.selectedTrain.name}</div>
      <div class="ticket-arrow-route">&bull;&mdash;&mdash;&mdash;&gt;&bull;</div>
    </div>
    <div class="ticket-route-col right-align">
      <div class="ticket-station-name">${bookingState.search.to}</div>
      <div class="ticket-time-bold">${bookingState.selectedTrain.arrTime} HRS</div>
      <div class="ticket-sub-date">Arrival</div>
    </div>
  `;

  // Passengers Table
  const tbody = document.getElementById('ticket-passengers-tbody');
  tbody.innerHTML = '';
  bookingState.passengers.forEach((p, idx) => {
    const seatNum = 18 + idx * 3;
    const berthShort = p.berth === 'Lower Berth' ? 'LB' : (p.berth === 'Upper Berth' ? 'UB' : (p.berth === 'Middle Berth' ? 'MB' : 'WS'));
    const seatStr = `${coachPrefix}-${seatNum} (${berthShort})`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td class="bold">${p.name.toUpperCase()}</td>
      <td>${p.age} / ${p.gender.charAt(0)}</td>
      <td class="bold seat-badge">${seatStr}</td>
      <td class="status-cnf"><span class="cnf-pill">CNF / CONFIRMED</span></td>
    `;
    tbody.appendChild(tr);
  });

  renderQrCanvas();
}

function renderQrCanvas() {
  const container = document.getElementById('ticket-qr-canvas');
  if (!container) return;
  container.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 80, 80);

  ctx.fillStyle = '#ffffff';
  const size = 5;
  for (let r = 0; r < 16; r++) {
    for (let c = 0; c < 16; c++) {
      const isCorner = (r < 4 && c < 4) || (r < 4 && c > 11) || (r > 11 && c < 4);
      if (isCorner || Math.random() > 0.45) {
        ctx.fillRect(c * size, r * size, size - 1, size - 1);
      }
    }
  }
  container.appendChild(canvas);
}

function copyPnr() {
  const pnr = document.getElementById('ticket-pnr-display').textContent.trim();
  navigator.clipboard?.writeText(pnr).then(() => {
    const btn = document.getElementById('btn-copy-pnr');
    btn.textContent = 'COPIED!';
    btn.classList.add('copied');
    showToast(`PNR ${pnr} copied to clipboard!`);
    setTimeout(() => {
      btn.textContent = 'COPY';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    showToast(`PNR: ${pnr}`);
  });
}

/* ==========================================================================
   FORM CLEARING UTILITIES (WIPES SENSITIVE BANK & FORM FIELDS)
   ========================================================================== */
function clearPaymentForms() {
  // Clear payment fields
  const cardNum = document.getElementById('card-num');
  const cardExp = document.getElementById('card-exp');
  const cardCvv = document.getElementById('card-cvv');
  const cardName = document.getElementById('card-name');
  const upiInput = document.getElementById('upi-id-input');

  if (cardNum) cardNum.value = '';
  if (cardExp) cardExp.value = '';
  if (cardCvv) cardCvv.value = '';
  if (cardName) cardName.value = '';
  if (upiInput) upiInput.value = '';
}

function clearAllForms() {
  clearPaymentForms();
  bookingState.selectedTrain = null;
  bookingState.selectedClass = null;
  bookingState.passengers = [];
  bookingState.isHumanVerified = false;
  bookingState.ticket = null;

  const paxContainer = document.getElementById('passengers-inputs-container');
  if (paxContainer) paxContainer.innerHTML = '';
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */
function generatePnr() {
  const part1 = Math.floor(200 + Math.random() * 800);
  const part2 = Math.floor(1000000 + Math.random() * 9000000);
  return `${part1}-${part2}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-pill';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
