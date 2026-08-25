/**
 * IRCTC Ticket Booking Engine & PNR Enquiry System
 * Features:
 * - 250+ Station Custom Dropdown Chooser
 * - Custom Calendar Date Picker
 * - Browser-Style Top Progress Bar (Grey/Charcoal)
 * - Persistent PNR Generation & Comprehensive PNR Status Enquiry
 * - Interactive Train Class Selection & Availability Check Button
 * - Auto-Fill, Robust Swipe-to-Tear Verification & Printable Confirmed E-Ticket
 */

import { searchStations, populateStationDatalist } from './stations.js';
import { openModal } from './app.js';
import { getStoredBookings, saveBooking, findBookingByPnr } from './supabase.js';

// Available Mock Trains Database
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
  },
  {
    number: '12626',
    name: 'KERALA EXPRESS',
    type: 'Superfast Express',
    depTime: '20:10',
    depStation: 'NDLS',
    arrTime: '14:20',
    arrStation: 'TVC',
    duration: '42h 10m',
    runsOn: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    classes: [
      { code: '2A', name: 'AC 2 Tier', fare: 3450, status: 'AVL 18', statusType: 'avl' },
      { code: '3A', name: 'AC 3 Tier', fare: 2390, status: 'AVL 52', statusType: 'avl' },
      { code: 'SL', name: 'Sleeper Class', fare: 910, status: 'AVL 110', statusType: 'avl' }
    ]
  }
];

// Current Booking Session State
export const bookingState = {
  search: {
    from: '',
    to: '',
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

// Date picker internal state
let calCurrentMonth = new Date().getMonth();
let calCurrentYear = new Date().getFullYear();

// DOM Initializer
export function initBookingEngine() {
  populateStationDatalist('stations-list');
  initStationDropdowns();
  initDatePicker();

  document.getElementById('btn-swap')?.addEventListener('click', swapStations);
  document.getElementById('train-search-form')?.addEventListener('submit', handleSearchSubmit);

  initPnrEnquiry();
  bindNavigationTabs();

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
   BROWSER-STYLE TOP PROGRESS BAR (SLENDER GREY/CHARCOAL LINE)
   ========================================================================== */
export function triggerTopProgress(durationMs = 600, onComplete) {
  const fill = document.getElementById('top-progress-fill');
  if (!fill) {
    if (onComplete) onComplete();
    return;
  }

  fill.style.transition = 'none';
  fill.style.width = '0%';
  fill.classList.add('active');

  requestAnimationFrame(() => {
    fill.style.transition = `width ${durationMs * 0.7}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    fill.style.width = '75%';

    setTimeout(() => {
      fill.style.transition = `width ${durationMs * 0.3}ms ease`;
      fill.style.width = '100%';

      setTimeout(() => {
        fill.classList.remove('active');
        setTimeout(() => {
          fill.style.width = '0%';
          if (onComplete) onComplete();
        }, 150);
      }, durationMs * 0.3);
    }, durationMs * 0.7);
  });
}

/* ==========================================================================
   VIEW SWITCHER & STEPPER
   ========================================================================== */
export function switchView(viewName) {
  const views = ['search', 'pnr', 'trains', 'passengers', 'review', 'payment', 'ticket'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.style.display = (v === viewName) ? 'block' : 'none';
  });

  const stepper = document.getElementById('booking-stepper');
  if (viewName === 'pnr') {
    if (stepper) stepper.style.display = 'none';
  } else {
    if (stepper) stepper.style.display = 'flex';
  }

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

function bindNavigationTabs() {
  // Search Card Tabs
  document.getElementById('tab-mode-search')?.addEventListener('click', () => switchView('search'));
  document.getElementById('tab-mode-pnr')?.addEventListener('click', () => switchView('pnr'));

  // PNR Card Tabs
  document.getElementById('pnr-tab-mode-search')?.addEventListener('click', () => switchView('search'));
  document.getElementById('pnr-tab-mode-pnr')?.addEventListener('click', () => switchView('pnr'));
}

/* ==========================================================================
   CUSTOM FLOATING STATION PICKER DROPDOWNS
   ========================================================================== */
function initStationDropdowns() {
  setupStationField('search-from', 'dropdown-from', 'btn-clear-from');
  setupStationField('search-to', 'dropdown-to', 'btn-clear-to');

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.station-picker-box')) {
      document.querySelectorAll('.station-dropdown-menu').forEach(d => d.style.display = 'none');
    }
  });
}

function setupStationField(inputId, dropdownId, clearBtnId) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const clearBtn = document.getElementById(clearBtnId);

  if (!input || !dropdown) return;

  function renderList(query = '') {
    const results = searchStations(query, 16);
    dropdown.innerHTML = '';

    if (results.length === 0) {
      dropdown.innerHTML = `<div class="stn-no-results">No Indian railway station matched "${query}"</div>`;
      dropdown.style.display = 'block';
      return;
    }

    results.forEach(stn => {
      const item = document.createElement('div');
      item.className = 'station-dropdown-item';
      item.innerHTML = `
        <div class="stn-left">
          <span class="stn-code-badge">${stn.code}</span>
          <span class="stn-name-text">${stn.name}</span>
        </div>
        <span class="stn-state-tag">${stn.state}</span>
      `;

      item.addEventListener('click', () => {
        const fullVal = `${stn.code} - ${stn.name} (${stn.state})`;
        input.value = fullVal;
        dropdown.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'block';

        if (inputId === 'search-from') {
          bookingState.search.from = fullVal;
          document.getElementById('search-to')?.focus();
        } else {
          bookingState.search.to = fullVal;
        }
      });

      dropdown.appendChild(item);
    });

    dropdown.style.display = 'block';
  }

  input.addEventListener('focus', () => {
    document.querySelectorAll('.station-dropdown-menu').forEach(d => {
      if (d !== dropdown) d.style.display = 'none';
    });
    renderList(input.value);
  });

  input.addEventListener('input', () => {
    if (clearBtn) clearBtn.style.display = input.value ? 'block' : 'none';
    renderList(input.value);
  });

  clearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    clearBtn.style.display = 'none';
    input.focus();
    renderList('');
  });
}

function swapStations() {
  const fromEl = document.getElementById('search-from');
  const toEl = document.getElementById('search-to');
  const temp = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value = temp;

  bookingState.search.from = fromEl.value;
  bookingState.search.to = toEl.value;

  const clearFrom = document.getElementById('btn-clear-from');
  const clearTo = document.getElementById('btn-clear-to');
  if (clearFrom) clearFrom.style.display = fromEl.value ? 'block' : 'none';
  if (clearTo) clearTo.style.display = toEl.value ? 'block' : 'none';
}

/* ==========================================================================
   CUSTOM CALENDAR DATE PICKER (OPENS RIGHT BELOW INPUT)
   ========================================================================== */
function initDatePicker() {
  const displayInput = document.getElementById('search-date-display');
  const hiddenInput = document.getElementById('search-date');
  const popup = document.getElementById('calendar-popup');

  if (!displayInput || !hiddenInput || !popup) return;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  setDateValue(tomorrow);

  displayInput.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = popup.style.display === 'block';
    document.querySelectorAll('.station-dropdown-menu').forEach(d => d.style.display = 'none');
    
    if (isVisible) {
      popup.style.display = 'none';
    } else {
      renderCalendar();
      popup.style.display = 'block';
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.date-picker-box')) {
      popup.style.display = 'none';
    }
  });
}

function setDateValue(dateObj) {
  const hiddenInput = document.getElementById('search-date');
  const displayInput = document.getElementById('search-date-display');
  const isoDate = dateObj.toISOString().split('T')[0];

  hiddenInput.value = isoDate;
  bookingState.search.date = isoDate;

  const formatted = dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  displayInput.value = formatted;
}

function renderCalendar() {
  const popup = document.getElementById('calendar-popup');
  if (!popup) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateStr = bookingState.search.date;
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : null;
  if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

  popup.innerHTML = `
    <div class="cal-header-bar">
      <span class="cal-month-title">${months[calCurrentMonth]} ${calCurrentYear}</span>
      <div class="cal-nav-buttons">
        <button type="button" class="cal-nav-btn" id="cal-prev-btn">&larr;</button>
        <button type="button" class="cal-nav-btn" id="cal-next-btn">&rarr;</button>
      </div>
    </div>

    <div class="cal-quick-chips">
      <button type="button" class="cal-chip" data-offset="0">Today</button>
      <button type="button" class="cal-chip" data-offset="1">Tomorrow</button>
      <button type="button" class="cal-chip" data-offset="2">+2 Days</button>
      <button type="button" class="cal-chip" data-offset="7">+1 Week</button>
    </div>

    <div class="cal-week-row">
      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
    </div>

    <div class="cal-days-grid" id="cal-days-grid"></div>
  `;

  document.getElementById('cal-prev-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    calCurrentMonth--;
    if (calCurrentMonth < 0) {
      calCurrentMonth = 11;
      calCurrentYear--;
    }
    renderCalendar();
  });

  document.getElementById('cal-next-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    calCurrentMonth++;
    if (calCurrentMonth > 11) {
      calCurrentMonth = 0;
      calCurrentYear++;
    }
    renderCalendar();
  });

  popup.querySelectorAll('.cal-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const offset = parseInt(chip.getAttribute('data-offset'), 10);
      const target = new Date();
      target.setDate(target.getDate() + offset);
      setDateValue(target);
      popup.style.display = 'none';
    });
  });

  const daysGrid = document.getElementById('cal-days-grid');
  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
  const totalDays = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day-cell disabled';
    daysGrid.appendChild(emptyCell);
  }

  for (let d = 1; d <= totalDays; d++) {
    const cellDate = new Date(calCurrentYear, calCurrentMonth, d);
    cellDate.setHours(0, 0, 0, 0);

    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    cell.textContent = d;

    const isPast = cellDate < today;
    const isToday = cellDate.getTime() === today.getTime();
    const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();

    if (isPast) {
      cell.classList.add('disabled');
    } else {
      if (isToday) cell.classList.add('today');
      if (isSelected) cell.classList.add('selected');

      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        setDateValue(cellDate);
        popup.style.display = 'none';
      });
    }

    daysGrid.appendChild(cell);
  }
}

/* ==========================================================================
   STEP 1: SEARCH TRAINS
   ========================================================================== */
function handleSearchSubmit(e) {
  e.preventDefault();

  const activeSession = localStorage.getItem('irctc_active_session');
  if (!activeSession) {
    showToast('🔒 IRCTC Login Required to search and reserve train tickets.');
    openModal('login');
    return;
  }

  const fromVal = document.getElementById('search-from').value.trim();
  const toVal = document.getElementById('search-to').value.trim();

  if (!fromVal) {
    showToast('Please choose a departure station.');
    document.getElementById('search-from').focus();
    return;
  }
  if (!toVal) {
    showToast('Please choose a destination station.');
    document.getElementById('search-to').focus();
    return;
  }

  bookingState.search.from = fromVal;
  bookingState.search.to = toVal;
  bookingState.search.date = document.getElementById('search-date').value;
  bookingState.search.class = document.getElementById('search-class').value;
  bookingState.search.quota = document.getElementById('search-quota').value;

  triggerTopProgress(500, () => {
    renderTrainsList();
    switchView('trains');
  });
}

/* ==========================================================================
   STEP 2: TRAIN LIST RENDERING & SELECTION WITH "CHECK AVAILABILITY" BUTTON
   ========================================================================== */
function renderTrainsList() {
  const summaryEl = document.getElementById('search-summary-text');
  const fromCode = (bookingState.search.from || 'NDLS').split(' - ')[0] || 'NDLS';
  const toCode = (bookingState.search.to || 'MMCT').split(' - ')[0] || 'MMCT';
  summaryEl.textContent = `${fromCode} → ${toCode} | ${formatDate(bookingState.search.date)} | ${bookingState.search.quota} Quota`;

  const container = document.getElementById('trains-list-container');
  container.innerHTML = '';

  TRAINS_DATA.forEach(train => {
    const card = document.createElement('div');
    card.className = 'train-card';
    card.setAttribute('data-train-num', train.number);

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

      <div class="train-bottom-action" id="action-box-${train.number}" style="display: none;"></div>
    `;

    card.querySelectorAll('.class-fare-box').forEach(box => {
      box.addEventListener('click', () => {
        const trainNum = box.getAttribute('data-train');
        const classCode = box.getAttribute('data-class');
        const fare = box.getAttribute('data-fare');

        document.querySelectorAll('.class-fare-box').forEach(b => b.classList.remove('selected'));
        document.querySelectorAll('.train-bottom-action').forEach(act => {
          act.style.display = 'none';
          act.innerHTML = '';
        });

        box.classList.add('selected');

        const actionBox = document.getElementById(`action-box-${trainNum}`);
        if (actionBox) {
          actionBox.innerHTML = `
            <button type="button" class="btn-check-avail" id="btn-avail-${trainNum}">
              <span>🔍</span> Check Availability &amp; Book ${classCode} (₹${fare}) &rarr;
            </button>
          `;
          actionBox.style.display = 'flex';

          actionBox.querySelector('.btn-check-avail').addEventListener('click', () => {
            triggerTopProgress(450, () => {
              selectTrainAndClass(trainNum, classCode);
            });
          });
        }
      });
    });

    container.appendChild(card);
  });
}

function selectTrainAndClass(trainNumber, classCode) {
  const train = TRAINS_DATA.find(t => t.number === trainNumber) || TRAINS_DATA[0];
  const cls = train.classes.find(c => c.code === classCode) || train.classes[0];
  bookingState.selectedTrain = train;
  bookingState.selectedClass = cls;

  const activeSession = localStorage.getItem('irctc_active_session');
  let defaultPassenger = { name: '', age: 26, gender: 'Male', berth: 'No Preference', food: 'Veg', concession: 'None' };

  if (activeSession) {
    try {
      const u = JSON.parse(activeSession);
      const fullName = `${u.firstName || ''} ${u.middleName || ''} ${u.lastName || ''}`.replace(/\s+/g, ' ').trim() || u.username;
      
      let userAge = 26;
      if (u.dob) {
        const birthYear = new Date(u.dob).getFullYear();
        if (!isNaN(birthYear)) userAge = Math.max(18, new Date().getFullYear() - birthYear);
      }

      defaultPassenger.name = fullName;
      defaultPassenger.age = userAge;
      defaultPassenger.gender = u.gender || 'Male';

      const emailEl = document.getElementById('booking-contact-email');
      const mobileEl = document.getElementById('booking-contact-mobile');
      if (emailEl && u.email) emailEl.value = u.email;
      if (mobileEl && u.mobile) mobileEl.value = u.mobile;
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
  if (pill && bookingState.selectedTrain && bookingState.selectedClass) {
    pill.textContent = `${bookingState.selectedTrain.number} ${bookingState.selectedTrain.name} | Class: ${bookingState.selectedClass.code} (₹${bookingState.selectedClass.fare}/seat)`;
  }

  const container = document.getElementById('passengers-inputs-container');
  if (!container) return;
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

  const emailEl = document.getElementById('booking-contact-email');
  const mobileEl = document.getElementById('booking-contact-mobile');
  const email = emailEl ? emailEl.value.trim() : '';
  const mobile = mobileEl ? mobileEl.value.trim().replace(/[^0-9]/g, '') : '';

  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address for ticket delivery.');
    emailEl?.focus();
    return;
  }
  if (!mobile || mobile.length !== 10) {
    showToast('Please enter a valid 10-digit mobile number for SMS ticket updates.');
    mobileEl?.focus();
    return;
  }

  bookingState.contact.email = email;
  bookingState.contact.mobile = mobile;

  calculateBill();
  renderPaperBill();
  resetSwipeToTear();

  triggerTopProgress(400, () => {
    switchView('review');
  });
}

/* ==========================================================================
   STEP 4: PAPER BILL CALCULATION & SWIPE-TO-TEAR
   ========================================================================== */
function calculateBill() {
  const perTicket = (bookingState.selectedClass && bookingState.selectedClass.fare) ? bookingState.selectedClass.fare : 1850;
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
  const billDateTime = document.getElementById('bill-date-time');
  if (billDateTime) billDateTime.textContent = `INVOICE DATE: ${new Date().toLocaleDateString('en-GB')} | IRCTC ONLINE`;

  const trainNum = bookingState.selectedTrain ? bookingState.selectedTrain.number : '12952';
  const trainName = bookingState.selectedTrain ? bookingState.selectedTrain.name : 'MUMBAI RAJDHANI EXP';
  const depTime = bookingState.selectedTrain ? bookingState.selectedTrain.depTime : '16:55';
  const fromCode = (bookingState.search.from || 'NDLS').split(' - ')[0] || 'NDLS';
  const toCode = (bookingState.search.to || 'MMCT').split(' - ')[0] || 'MMCT';
  const classCode = bookingState.selectedClass ? bookingState.selectedClass.code : '3A';
  const className = bookingState.selectedClass ? bookingState.selectedClass.name : 'AC 3 Tier';

  const journeyInfo = document.getElementById('bill-journey-info');
  if (journeyInfo) {
    journeyInfo.innerHTML = `
      <div class="bill-row">
        <span class="bill-label">TRAIN:</span>
        <span class="bill-val bold">${trainNum} ${trainName}</span>
      </div>
      <div class="bill-row">
        <span class="bill-label">ROUTE:</span>
        <span class="bill-val">${fromCode} &rarr; ${toCode}</span>
      </div>
      <div class="bill-row">
        <span class="bill-label">JOURNEY DATE:</span>
        <span class="bill-val">${dateStr} (${depTime} HRS)</span>
      </div>
      <div class="bill-row">
        <span class="bill-label">CLASS / QUOTA:</span>
        <span class="bill-val bold">${classCode} (${className}) / ${bookingState.search.quota || 'GENERAL'}</span>
      </div>
    `;
  }

  const paxList = document.getElementById('bill-passengers-list');
  if (paxList) {
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
          <span class="pax-fare-txt">₹${(p.calculatedFare || 0).toFixed(2)}</span>
        </div>
      `;
      paxList.appendChild(row);
    });
  }

  const fareBox = document.getElementById('bill-fare-breakdown');
  if (fareBox) {
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
        <span class="bill-label">Travel Insurance &amp; GST (5%):</span>
        <span class="bill-val">₹${bookingState.pricing.gst.toFixed(2)}</span>
      </div>
      <div class="bill-divider"></div>
      <div class="bill-row grand-total">
        <span class="bill-label">TOTAL AMOUNT TO PAY:</span>
        <span class="bill-val">₹${bookingState.pricing.total.toFixed(2)}</span>
      </div>
    `;
  }

  const passTempPnr = document.getElementById('pass-temp-pnr');
  if (passTempPnr) passTempPnr.textContent = `${trainNum} ${trainName}`;
  const passRoute = document.getElementById('pass-route-text');
  if (passRoute) passRoute.textContent = `${fromCode} → ${toCode}`;
}

/* ==========================================================================
   HUMAN VERIFICATION: SWIPE-TO-TEAR PASS
   ========================================================================== */
function initSwipeToTear() {
  const thumb = document.getElementById('tear-slider-thumb');
  const stub = document.getElementById('pass-stub-side');
  if (!thumb && !stub) return;

  let isDragging = false;
  let startY = 0;
  let currentY = 0;

  function onStart(e) {
    if (bookingState.isHumanVerified) return;
    isDragging = true;
    startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    if (thumb) thumb.style.transition = 'none';
    if (stub) stub.style.transition = 'none';
  }

  function onMove(e) {
    if (!isDragging || bookingState.isHumanVerified) return;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    currentY = Math.max(0, clientY - startY);

    if (currentY < 120) {
      if (thumb) thumb.style.transform = `translateY(${currentY}px)`;
      if (stub) stub.style.transform = `translateY(${currentY * 0.6}px) rotate(${currentY * 0.04}deg)`;
    } else {
      completeTear();
    }
  }

  function onEnd() {
    if (!isDragging || bookingState.isHumanVerified) return;
    isDragging = false;
    if (thumb) {
      thumb.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      thumb.style.transform = 'translateY(0px)';
    }
    if (stub) {
      stub.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      stub.style.transform = 'translateY(0px)';
    }
  }

  function completeTear() {
    isDragging = false;
    bookingState.isHumanVerified = true;

    if (thumb) {
      thumb.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      thumb.style.transform = 'translateY(160px)';
      thumb.style.opacity = '0';
    }
    if (stub) {
      stub.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      stub.style.transform = 'translateY(180px) rotate(12deg)';
      stub.style.opacity = '0';
    }

    setTimeout(() => {
      const successStamp = document.getElementById('tear-success-stamp');
      if (successStamp) successStamp.style.display = 'flex';

      const payBtn = document.getElementById('btn-proceed-to-payment');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.classList.remove('disabled');
        payBtn.textContent = `PROCEED TO PAYMENT (₹${bookingState.pricing.total.toFixed(2)}) →`;
      }
      showToast('✔ Human verification complete! Security gate unlocked.');
    }, 250);
  }

  // Bind drag events on slider thumb & stub
  [thumb, stub].forEach(el => {
    if (!el) return;
    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: true });
  });

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', onEnd);
}

function resetSwipeToTear() {
  bookingState.isHumanVerified = false;
  const thumb = document.getElementById('tear-slider-thumb');
  const stub = document.getElementById('pass-stub-side');
  const successStamp = document.getElementById('tear-success-stamp');
  const payBtn = document.getElementById('btn-proceed-to-payment');

  if (thumb) {
    thumb.style.display = 'flex';
    thumb.style.transform = 'translateY(0px)';
    thumb.style.opacity = '1';
    thumb.style.transition = 'none';
  }
  if (stub) {
    stub.style.display = 'block';
    stub.style.transform = 'translateY(0px)';
    stub.style.opacity = '1';
    stub.style.transition = 'none';
  }
  if (successStamp) successStamp.style.display = 'none';
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.classList.add('disabled');
    payBtn.textContent = '🔒 SWIPE TO UNLOCK PAYMENT';
  }
}

/* ==========================================================================
   STEP 5: PAYMENT ENGINE & FINAL CONFIRMATION
   ========================================================================== */
function initPaymentTabs() {
  const tabs = document.querySelectorAll('.pay-tab');
  const panels = document.querySelectorAll('.pay-method-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');

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

  triggerTopProgress(800, () => {
    generateConfirmedTicket();
    clearPaymentForms();
    switchView('ticket');
    showToast('Payment successful! Your confirmed e-ticket has been issued.');
  });
}

/* ==========================================================================
   STEP 6: TICKET GENERATION & DATABASE PERSISTENCE
   ========================================================================== */
function generateConfirmedTicket() {
  const pnr = generatePnr();
  const txnId = `IRCTC${Math.floor(10000000 + Math.random() * 90000000)}`;
  const classCode = bookingState.selectedClass ? bookingState.selectedClass.code : '3A';
  const coachPrefix = classCode === '1A' ? 'H1' : (classCode === '2A' ? 'A1' : (classCode === 'EC' ? 'E1' : 'B3'));

  bookingState.ticket = {
    pnr: pnr,
    txnId: txnId,
    coachPrefix: coachPrefix
  };

  const trainNum = bookingState.selectedTrain ? bookingState.selectedTrain.number : '12952';
  const trainName = bookingState.selectedTrain ? bookingState.selectedTrain.name : 'MUMBAI RAJDHANI EXP';
  const trainType = bookingState.selectedTrain ? bookingState.selectedTrain.type : 'Superfast Express';
  const depTime = bookingState.selectedTrain ? bookingState.selectedTrain.depTime : '16:55';
  const arrTime = bookingState.selectedTrain ? bookingState.selectedTrain.arrTime : '08:35';
  const duration = bookingState.selectedTrain ? bookingState.selectedTrain.duration : '15h 40m';
  const className = bookingState.selectedClass ? bookingState.selectedClass.name : 'AC 3 Tier';

  document.getElementById('ticket-pnr-display').textContent = pnr;
  document.getElementById('ticket-txn-id').textContent = txnId;
  document.getElementById('ticket-quota-display').textContent = bookingState.search.quota;
  document.getElementById('ticket-class-display').textContent = `${classCode} (${className})`;
  document.getElementById('ticket-fare-display').textContent = `₹${bookingState.pricing.total.toFixed(2)}`;

  const routeEl = document.getElementById('ticket-route-info');
  if (routeEl) {
    routeEl.innerHTML = `
      <div class="ticket-route-col">
        <div class="ticket-station-name">${bookingState.search.from}</div>
        <div class="ticket-time-bold">${depTime} HRS</div>
        <div class="ticket-sub-date">${formatDate(bookingState.search.date)}</div>
      </div>
      <div class="ticket-train-center">
        <div class="ticket-train-num">${trainNum}</div>
        <div class="ticket-train-name">${trainName}</div>
        <div class="ticket-arrow-route">&bull;&mdash;&mdash;&mdash;&gt;&bull;</div>
      </div>
      <div class="ticket-route-col right-align">
        <div class="ticket-station-name">${bookingState.search.to}</div>
        <div class="ticket-time-bold">${arrTime} HRS</div>
        <div class="ticket-sub-date">Arrival</div>
      </div>
    `;
  }

  const tbody = document.getElementById('ticket-passengers-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const storedPax = [];

    bookingState.passengers.forEach((p, idx) => {
      const seatNum = 18 + idx * 3;
      const berthShort = p.berth === 'Lower Berth' ? 'LB' : (p.berth === 'Upper Berth' ? 'UB' : (p.berth === 'Middle Berth' ? 'MB' : 'WS'));
      const seatStr = `${coachPrefix}-${seatNum} (${berthShort})`;

      storedPax.push({
        name: p.name.toUpperCase(),
        age: p.age,
        gender: p.gender,
        berthPref: p.berth,
        food: p.food,
        bookingStatus: `CNF / ${coachPrefix} / ${seatNum} / ${berthShort}`,
        currentStatus: 'CNF / CONFIRMED',
        coach: coachPrefix,
        berthNumber: `${seatNum}`,
        berthType: `${p.berth} (${berthShort})`
      });

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

    const bookingRecord = {
      pnr: pnr,
      txnId: txnId,
      bookingDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      journeyDate: formatDate(bookingState.search.date),
      trainNumber: trainNum,
      trainName: trainName,
      trainType: trainType,
      fromStation: bookingState.search.from,
      toStation: bookingState.search.to,
      depTime: depTime,
      arrTime: arrTime,
      duration: duration,
      classCode: classCode,
      className: className,
      quota: bookingState.search.quota,
      chartStatus: 'CHART NOT PREPARED',
      totalFare: bookingState.pricing.total,
      contact: { ...bookingState.contact },
      passengers: storedPax
    };

    saveBooking(bookingRecord);
  }
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
   PNR ENQUIRY FUNCTIONALITY
   ========================================================================== */
function initPnrEnquiry() {
  const form = document.getElementById('pnr-search-form');
  const input = document.getElementById('pnr-query-input');

  form?.addEventListener('submit', handlePnrSubmit);

  document.querySelectorAll('.chip-pnr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pnr = btn.getAttribute('data-pnr');
      if (input) input.value = pnr;
      executePnrLookup(pnr);
    });
  });
}

function handlePnrSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('pnr-query-input');
  const pnr = input.value.trim();

  if (!pnr || pnr.replace(/[^0-9]/g, '').length < 10) {
    showToast('Please enter a valid 10-digit PNR Number.');
    input.focus();
    return;
  }

  executePnrLookup(pnr);
}

function executePnrLookup(pnr) {
  const container = document.getElementById('pnr-result-container');
  if (!container) return;

  triggerTopProgress(500, () => {
    const booking = findBookingByPnr(pnr);
    if (!booking) {
      renderPnrNotFound(pnr);
    } else {
      renderPnrResult(booking);
    }
  });
}

function renderPnrNotFound(pnr) {
  const container = document.getElementById('pnr-result-container');
  container.innerHTML = `
    <div class="pnr-not-found-card">
      <div class="pnr-not-found-icon">⚠️</div>
      <div class="pnr-not-found-title">PNR Record Not Found</div>
      <div class="pnr-not-found-desc">
        No railway reservation found for PNR <strong>${pnr}</strong> in the CRIS database. 
        Please verify the 10-digit number or test with one of the sample PNRs above.
      </div>
    </div>
  `;
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderPnrResult(booking) {
  const container = document.getElementById('pnr-result-container');

  let paxRows = '';
  booking.passengers.forEach((p, idx) => {
    paxRows += `
      <tr>
        <td>#${idx + 1}</td>
        <td><strong>${p.name}</strong> (${p.age}, ${p.gender.charAt(0)})</td>
        <td><span class="seat-badge">${p.bookingStatus}</span></td>
        <td><span class="pnr-status-pill">${p.currentStatus}</span></td>
        <td>${p.coach || 'B3'} / ${p.berthNumber || '18'} (${p.berthType || p.berthPref || 'LB'})</td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="pnr-status-card">
      <div class="pnr-card-banner">
        <div class="pnr-train-hero">
          <span class="pnr-num-tag">${booking.pnr}</span>
          <div>
            <div class="pnr-train-title">${booking.trainNumber} &bull; ${booking.trainName}</div>
            <div class="pnr-train-sub">${booking.trainType || 'Superfast Express'} | Booked on ${booking.bookingDate || 'Recent'}</div>
          </div>
        </div>
        <div class="pnr-chart-badge ${booking.chartStatus === 'CHART PREPARED' ? 'prepared' : ''}">
          📊 ${booking.chartStatus}
        </div>
      </div>

      <div class="pnr-meta-grid">
        <div class="pnr-meta-item">
          <div class="pnr-label">Boarding Station / Time</div>
          <div class="pnr-val">${booking.fromStation} (${booking.depTime} HRS)</div>
        </div>
        <div class="pnr-meta-item">
          <div class="pnr-label">Destination Station / Time</div>
          <div class="pnr-val">${booking.toStation} (${booking.arrTime} HRS)</div>
        </div>
        <div class="pnr-meta-item">
          <div class="pnr-label">Journey Date</div>
          <div class="pnr-val">${booking.journeyDate}</div>
        </div>
        <div class="pnr-meta-item">
          <div class="pnr-label">Class &amp; Quota</div>
          <div class="pnr-val">${booking.classCode} (${booking.className}) &bull; ${booking.quota}</div>
        </div>
      </div>

      <div class="pnr-pax-section">
        <div class="pnr-section-heading">Passenger Current Status &amp; Berth Allocation</div>
        <div class="pnr-table-wrap">
          <table class="pnr-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Passenger Name</th>
                <th>Booking Status</th>
                <th>Current Status</th>
                <th>Coach / Berth Position</th>
              </tr>
            </thead>
            <tbody>
              ${paxRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="pnr-footer-row">
        <div class="pnr-fare-total">
          Total Fare Paid: <strong>₹${typeof booking.totalFare === 'number' ? booking.totalFare.toFixed(2) : booking.totalFare}</strong> &bull; Txn ID: <code style="color:var(--text-muted);">${booking.txnId}</code>
        </div>
        <div class="pnr-actions-group">
          <button type="button" class="btn-pnr-action" id="btn-pnr-print">🖨️ Print Status</button>
          <button type="button" class="btn-pnr-action primary" id="btn-pnr-book-new">🚆 Book New Ticket</button>
        </div>
      </div>
    </div>
  `;

  container.style.display = 'block';

  document.getElementById('btn-pnr-print')?.addEventListener('click', () => window.print());
  document.getElementById('btn-pnr-book-new')?.addEventListener('click', () => {
    clearAllForms();
    switchView('search');
  });

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ==========================================================================
   FORM CLEARING UTILITIES
   ========================================================================== */
function clearPaymentForms() {
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
