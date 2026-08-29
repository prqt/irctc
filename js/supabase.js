/**
 * Supabase Client Initialization, User Account Storage & PNR Booking Database
 * Real Cloud Database Synchronization with Local Storage Fallback & Caching
 */

// Supabase Project Configuration
export const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://whxqwxbxpugskfufshdb.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoeHF3eGJ4cHVnc2tmdWZzaGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDU0OTIsImV4cCI6MjEwMzIyMTQ5Mn0.H6apks0TjafJI9Z2S2jbYUciAXUO-jjk-1_jNceiGLk';

// Initialize Supabase Client
export let supabase = null;

if (window.supabase) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase Cloud DB] Client connected successfully');
  } catch (err) {
    console.warn('[Supabase Cloud DB] Initialization notice:', err.message);
  }
} else {
  console.warn('[Supabase Cloud DB] CDN client not loaded.');
}

/**
 * Supabase Auth is the single source of truth for accounts. Unlike localStorage,
 * sessions and password verification work across browsers and devices.
 */
export async function registerWithEmail(user) {
  if (!supabase) throw new Error('Authentication service is unavailable. Please try again later.');
  const options = {
    data: {
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      mobile: user.mobile,
      preferred_language: user.preferredLanguage
    }
  };
  if (window.location.protocol !== 'file:') {
    options.emailRedirectTo = window.location.origin + window.location.pathname;
  }
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Authentication service is unavailable. Please try again later.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function getAuthenticatedUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const metadata = data.user.user_metadata || {};
  return {
    id: data.user.id,
    username: metadata.username || data.user.email,
    firstName: metadata.first_name || '',
    lastName: metadata.last_name || '',
    email: data.user.email,
    mobile: metadata.mobile || ''
  };
}

export async function signOutAuthenticatedUser() {
  if (supabase) await supabase.auth.signOut();
}

/**
 * Retrieve Locally Cached PNR Bookings
 */
export function getStoredBookings() {
  const data = localStorage.getItem('raildemo_all_bookings');
  if (!data) {
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save / Cache a Booking Locally
 */
export function cacheBookingLocally(booking) {
  if (!booking || !booking.pnr) return;
  const list = getStoredBookings();
  const cleanPnr = booking.pnr.replace(/[^0-9]/g, '');
  const existingIdx = list.findIndex(b => b.pnr.replace(/[^0-9]/g, '') === cleanPnr);
  if (existingIdx >= 0) {
    list[existingIdx] = booking;
  } else {
    list.unshift(booking);
  }
  localStorage.setItem('raildemo_all_bookings', JSON.stringify(list));
}

/**
 * Save New Booking to Cloud Database & Local Cache
 */
export async function saveBooking(booking) {
  // 1. Cache locally immediately for instant response
  cacheBookingLocally(booking);

  // 2. Persist to Supabase Cloud DB so any device can access it
  if (supabase) {
    try {
      const payload = {
        pnr: booking.pnr,
        txn_id: booking.txnId || booking.txn_id,
        booking_date: booking.bookingDate || booking.booking_date,
        journey_date: booking.journeyDate || booking.journey_date,
        train_number: booking.trainNumber || booking.train_number,
        train_name: booking.trainName || booking.train_name,
        train_type: booking.trainType || booking.train_type,
        from_station: booking.fromStation || booking.from_station,
        to_station: booking.toStation || booking.to_station,
        dep_time: booking.depTime || booking.dep_time,
        arr_time: booking.arrTime || booking.arr_time,
        duration: booking.duration,
        class_code: booking.classCode || booking.class_code,
        class_name: booking.className || booking.class_name,
        quota: booking.quota,
        chart_status: booking.chartStatus || booking.chart_status || 'CHART NOT PREPARED',
        total_fare: booking.totalFare || booking.total_fare,
        contact: booking.contact,
        passengers: booking.passengers
      };

      const { data, error } = await supabase.from('bookings').upsert([payload], { onConflict: 'pnr' });
      if (error) {
        console.warn('[Supabase Cloud PNR Save Notice]', error.message);
      } else {
        console.log('[Supabase Cloud PNR Save] Saved successfully to cloud:', booking.pnr);
      }
    } catch (e) {
      console.warn('[Supabase Cloud PNR Save Notice]', e.message || e);
    }
  }
}

/**
 * Find Booking by PNR (Live Cloud Query across devices + Local Cache fallback)
 */
export async function findBookingByPnr(pnrQuery) {
  if (!pnrQuery) return null;
  const clean = pnrQuery.toString().replace(/[^0-9]/g, '').trim();
  if (!clean) return null;

  // 1. First, perform live Cloud DB query via Supabase
  if (supabase) {
    try {
      // Reconstruct the dashed format (XXX-XXXXXXX) used by generatePnr()
      const formatted = clean.length === 10 ? `${clean.slice(0, 3)}-${clean.slice(3)}` : clean;
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`pnr.eq.${clean},pnr.eq.${formatted}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const cloudBooking = {
          pnr: row.pnr,
          txnId: row.txn_id || row.txnId,
          bookingDate: row.booking_date || row.bookingDate,
          journeyDate: row.journey_date || row.journeyDate,
          trainNumber: row.train_number || row.trainNumber,
          trainName: row.train_name || row.trainName,
          trainType: row.train_type || row.trainType,
          fromStation: row.from_station || row.fromStation,
          toStation: row.to_station || row.toStation,
          depTime: row.dep_time || row.depTime,
          arrTime: row.arr_time || row.arrTime,
          duration: row.duration,
          classCode: row.class_code || row.classCode,
          className: row.class_name || row.className,
          quota: row.quota,
          chartStatus: row.chart_status || row.chartStatus || 'CHART NOT PREPARED',
          totalFare: Number(row.total_fare || row.totalFare || 0),
          contact: row.contact,
          passengers: row.passengers || []
        };

        // Cache locally for offline and fast re-access
        cacheBookingLocally(cloudBooking);
        return cloudBooking;
      }
    } catch (err) {
      console.warn('[Supabase Cloud PNR Query Notice]', err.message || err);
    }
  }

  // 2. Fallback to Local Cache if offline or cloud unavailable
  const list = getStoredBookings();
  const localMatch = list.find(b => {
    const bPnrClean = (b.pnr || '').replace(/[^0-9]/g, '').trim();
    return bPnrClean === clean;
  });

  return localMatch || null;
}
