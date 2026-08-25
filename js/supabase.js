/**
 * Supabase Client Initialization, User Account Storage & PNR Booking Database
 * Configured with Supabase API Key and Local Storage Fallback
 */

// Replace SUPABASE_URL with your Supabase Project URL from the Supabase Dashboard
export const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://whxqwxbxpugskfufshdb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_GiMSfFe-T2zy6Ix3T_MGmA_hOsIZUJX';

// Initialize Supabase Client
export let supabase = null;

if (window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Initialized successfully');
  } catch (err) {
    console.warn('[Supabase] Initialization pending Project URL setup:', err.message);
  }
} else {
  console.warn('[Supabase] CDN script not loaded or unavailable offline.');
}

/**
 * Default Seeded Fictional User Account for Testing & Demo
 */
export const FICTIONAL_ACCOUNT = {
  username: 'pratham',
  password: 'Password@123',
  preferredLanguage: 'English',
  firstName: 'Pratham',
  middleName: '',
  lastName: 'User',
  gender: 'Male',
  dob: '2000-01-01',
  occupation: 'Professional',
  maritalStatus: 'Single',
  email: 'pratham@irctc.co.in',
  mobile: '9876543210',
  address: {
    door: 'Flat 402',
    street: 'Railway Colony Road',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    country: 'India'
  }
};

/**
 * Default Pre-Seeded Sample Bookings for Instant PNR Verification
 */
export const SAMPLE_BOOKINGS = [
  {
    pnr: '245-8910432',
    txnId: 'IRCTC98271043',
    bookingDate: '24 Aug 2026',
    journeyDate: '26 Aug 2026',
    trainNumber: '22436',
    trainName: 'VANDE BHARAT EXP',
    trainType: 'Superfast / Vande Bharat',
    fromStation: 'NDLS - New Delhi (Delhi)',
    toStation: 'BSB - Varanasi Junction (Uttar Pradesh)',
    depTime: '06:00',
    arrTime: '14:00',
    duration: '08h 00m',
    classCode: 'EC',
    className: 'Exec Chair Car',
    quota: 'GENERAL',
    chartStatus: 'CHART NOT PREPARED',
    totalFare: 2437.70,
    contact: { email: 'pratham@irctc.co.in', mobile: '9876543210' },
    passengers: [
      {
        name: 'PRATHAM USER',
        age: 26,
        gender: 'Male',
        berthPref: 'Window Side',
        food: 'Veg',
        bookingStatus: 'CNF / E1 / 14 / WS',
        currentStatus: 'CNF / CONFIRMED',
        coach: 'E1',
        berthNumber: '14',
        berthType: 'Window Side (WS)'
      }
    ]
  },
  {
    pnr: '412-9083125',
    txnId: 'IRCTC83920194',
    bookingDate: '23 Aug 2026',
    journeyDate: '27 Aug 2026',
    trainNumber: '12952',
    trainName: 'MUMBAI RAJDHANI EXP',
    trainType: 'Rajdhani Express',
    fromStation: 'NDLS - New Delhi (Delhi)',
    toStation: 'MMCT - Mumbai Central (Maharashtra)',
    depTime: '16:55',
    arrTime: '08:35',
    duration: '15h 40m',
    classCode: '3A',
    className: 'AC 3 Tier',
    quota: 'GENERAL',
    chartStatus: 'CHART NOT PREPARED',
    totalFare: 3977.70,
    contact: { email: 'pratham@irctc.co.in', mobile: '9876543210' },
    passengers: [
      {
        name: 'PRATHAM USER',
        age: 26,
        gender: 'Male',
        berthPref: 'Lower Berth',
        food: 'Veg',
        bookingStatus: 'CNF / B3 / 18 / LB',
        currentStatus: 'CNF / CONFIRMED',
        coach: 'B3',
        berthNumber: '18',
        berthType: 'Lower Berth (LB)'
      },
      {
        name: 'ANANYA SHARMA',
        age: 25,
        gender: 'Female',
        berthPref: 'Middle Berth',
        food: 'Veg',
        bookingStatus: 'CNF / B3 / 19 / MB',
        currentStatus: 'CNF / CONFIRMED',
        coach: 'B3',
        berthNumber: '19',
        berthType: 'Middle Berth (MB)'
      }
    ]
  }
];

/**
 * Retrieve Stored Users from localStorage with seeded default
 */
export function getStoredUsers() {
  const users = localStorage.getItem('irctc_registered_users');
  if (!users) {
    const defaultList = [FICTIONAL_ACCOUNT];
    localStorage.setItem('irctc_registered_users', JSON.stringify(defaultList));
    return defaultList;
  }
  try {
    const parsed = JSON.parse(users);
    if (!Array.isArray(parsed)) {
      const defaultList = [FICTIONAL_ACCOUNT];
      localStorage.setItem('irctc_registered_users', JSON.stringify(defaultList));
      return defaultList;
    }
    if (!parsed.some(u => u.username && u.username.toLowerCase() === FICTIONAL_ACCOUNT.username.toLowerCase())) {
      parsed.push(FICTIONAL_ACCOUNT);
      localStorage.setItem('irctc_registered_users', JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Error parsing stored users:', e);
    return [FICTIONAL_ACCOUNT];
  }
}

/**
 * Save New User to LocalStorage and optionally sync to Supabase
 */
export function saveUser(user) {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem('irctc_registered_users', JSON.stringify(users));

  // Asynchronously attempt to sync to Supabase if available
  if (supabase) {
    try {
      supabase.from('users').insert([user]).then(({ error }) => {
        if (error) console.log('[Supabase Sync Info]', error.message);
      }).catch((e) => console.log('[Supabase Sync Info]', e));
    } catch (e) {
      // Non-blocking
    }
  }
}

/**
 * Retrieve Stored PNR Bookings
 */
export function getStoredBookings() {
  const data = localStorage.getItem('irctc_all_bookings');
  if (!data) {
    localStorage.setItem('irctc_all_bookings', JSON.stringify(SAMPLE_BOOKINGS));
    return SAMPLE_BOOKINGS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      localStorage.setItem('irctc_all_bookings', JSON.stringify(SAMPLE_BOOKINGS));
      return SAMPLE_BOOKINGS;
    }
    // Ensure sample bookings exist
    SAMPLE_BOOKINGS.forEach(sb => {
      if (!parsed.some(b => b.pnr === sb.pnr)) {
        parsed.push(sb);
      }
    });
    return parsed;
  } catch (e) {
    return SAMPLE_BOOKINGS;
  }
}

/**
 * Save New Booking with PNR
 */
export function saveBooking(booking) {
  const list = getStoredBookings();
  list.unshift(booking); // newest first
  localStorage.setItem('irctc_all_bookings', JSON.stringify(list));

  // Asynchronously attempt to sync to Supabase if available
  if (supabase) {
    try {
      supabase.from('bookings').insert([booking]).then(({ error }) => {
        if (error) console.log('[Supabase Booking Sync]', error.message);
      }).catch((e) => console.log('[Supabase Booking Sync]', e));
    } catch (e) {
      // Non-blocking
    }
  }
}

/**
 * Find Booking by PNR (supports format with or without hyphens)
 */
export function findBookingByPnr(pnrQuery) {
  if (!pnrQuery) return null;
  const clean = pnrQuery.toString().replace(/[^0-9]/g, '').trim();
  const list = getStoredBookings();
  
  return list.find(b => {
    const bPnrClean = b.pnr.replace(/[^0-9]/g, '').trim();
    return bPnrClean === clean;
  }) || null;
}
