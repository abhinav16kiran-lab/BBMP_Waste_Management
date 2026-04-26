import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/* ──────────────────────────────────────────────────────────────────
   Axios Instance
────────────────────────────────────────────────────────────────── */
export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/* ──────────────────────────────────────────────────────────────────
   MOCK DATA — Phase 1 (uncomment real API in Phase 2)
   14 Bangalore wards · 12 schedules · 6 complaints · 8 vehicles · 7 crew
────────────────────────────────────────────────────────────────── */

export const MOCK_SCHEDULES = [
  {
    schedule_id: 1,
    ward_detail: { ward_name: 'Koramangala', zone: 'South' },
    crew_detail:    { supervisor_name: 'Suresh B', contact: '9845012345' },
    vehicle_detail: { vehicle_number: 'KA01AB1234', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-10T08:00:00',
    status: 'COMPLETED',
    delay_reason: '',
  },
  {
    schedule_id: 2,
    ward_detail: { ward_name: 'Indiranagar', zone: 'East' },
    crew_detail:    { supervisor_name: 'Meena R', contact: '9845067890' },
    vehicle_detail: { vehicle_number: 'KA01CD5678', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-11T09:00:00',
    status: 'MISSED',
    delay_reason: 'Vehicle breakdown on MG Road',
  },
  {
    schedule_id: 3,
    ward_detail: { ward_name: 'Jayanagar', zone: 'South' },
    crew_detail:    { supervisor_name: 'Ravi K', contact: '9876541234' },
    vehicle_detail: { vehicle_number: 'KA01EF9012', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-12T07:30:00',
    status: 'PENDING',
    delay_reason: '',
  },
  {
    schedule_id: 4,
    ward_detail: { ward_name: 'Whitefield', zone: 'East' },
    crew_detail:    { supervisor_name: 'Anita P', contact: '9900112233' },
    vehicle_detail: { vehicle_number: 'KA01GH3456', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-12T10:00:00',
    status: 'DELAYED',
    delay_reason: 'Traffic congestion near Marathahalli Bridge',
  },
  {
    schedule_id: 5,
    ward_detail: { ward_name: 'Rajajinagar', zone: 'West' },
    crew_detail:    { supervisor_name: 'Dinesh S', contact: '9731122334' },
    vehicle_detail: { vehicle_number: 'KA01IJ7890', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-12T06:45:00',
    status: 'COMPLETED',
    delay_reason: '',
  },
  {
    schedule_id: 6,
    ward_detail: { ward_name: 'Malleshwaram', zone: 'North' },
    crew_detail:    { supervisor_name: 'Priya V', contact: '9845099876' },
    vehicle_detail: { vehicle_number: 'KA01KL2345', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-12T08:15:00',
    status: 'COMPLETED',
    delay_reason: '',
  },
  {
    schedule_id: 7,
    ward_detail: { ward_name: 'Electronic City', zone: 'South' },
    crew_detail:    { supervisor_name: 'Ramesh T', contact: '9980011223' },
    vehicle_detail: { vehicle_number: 'KA01MN6789', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-12T09:00:00',
    status: 'PENDING',
    delay_reason: '',
  },
  {
    schedule_id: 8,
    ward_detail: { ward_name: 'Yelahanka', zone: 'North' },
    crew_detail:    { supervisor_name: 'Kavitha L', contact: '9611223344' },
    vehicle_detail: { vehicle_number: 'KA01OP3456', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-12T07:00:00',
    status: 'MISSED',
    delay_reason: 'Driver absent — replacement arranged',
  },
  {
    schedule_id: 9,
    ward_detail: { ward_name: 'Hebbal', zone: 'North' },
    crew_detail:    { supervisor_name: 'Suresh B', contact: '9845012345' },
    vehicle_detail: { vehicle_number: 'KA01QR7890', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-12T10:30:00',
    status: 'DELAYED',
    delay_reason: 'Hebbal flyover under maintenance, alternate route added 45 min',
  },
  {
    schedule_id: 10,
    ward_detail: { ward_name: 'BTM Layout', zone: 'South' },
    crew_detail:    { supervisor_name: 'Anita P', contact: '9900112233' },
    vehicle_detail: { vehicle_number: 'KA01GH3456', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-12T11:00:00',
    status: 'PENDING',
    delay_reason: '',
  },
  {
    schedule_id: 11,
    ward_detail: { ward_name: 'HSR Layout', zone: 'South' },
    crew_detail:    { supervisor_name: 'Meena R', contact: '9845067890' },
    vehicle_detail: { vehicle_number: 'KA01CD5678', vehicle_type: 'Tipper' },
    scheduled_time: '2025-04-12T08:30:00',
    status: 'COMPLETED',
    delay_reason: '',
  },
  {
    schedule_id: 12,
    ward_detail: { ward_name: 'Majestic', zone: 'Central' },
    crew_detail:    { supervisor_name: 'Dinesh S', contact: '9731122334' },
    vehicle_detail: { vehicle_number: 'KA01ST1234', vehicle_type: 'Compactor' },
    scheduled_time: '2025-04-12T05:30:00',
    status: 'COMPLETED',
    delay_reason: '',
  },
];

export const MOCK_STATS = [
  { status: 'COMPLETED', count: 47 },
  { status: 'MISSED',    count: 8  },
  { status: 'PENDING',   count: 14 },
];

export const MOCK_COMPLAINTS = [
  {
    complaint_id: 101,
    latitude: 12.9716,
    longitude: 77.5946,
    status: 'OPEN',
    reported_at: '2025-04-12T06:15:00',
    assigned_vehicle: null,
    ward: 'Koramangala',
  },
  {
    complaint_id: 102,
    latitude: 12.9352,
    longitude: 77.6245,
    status: 'OPEN',
    reported_at: '2025-04-12T07:40:00',
    assigned_vehicle: 'KA01AB1234',
    ward: 'Whitefield',
  },
  {
    complaint_id: 103,
    latitude: 12.9784,
    longitude: 77.6408,
    status: 'OPEN',
    reported_at: '2025-04-12T08:55:00',
    assigned_vehicle: null,
    ward: 'Indiranagar',
  },
  {
    complaint_id: 104,
    latitude: 13.0358,
    longitude: 77.5970,
    status: 'OPEN',
    reported_at: '2025-04-12T09:20:00',
    assigned_vehicle: 'KA01KL2345',
    ward: 'Hebbal',
  },
  {
    complaint_id: 105,
    latitude: 12.8456,
    longitude: 77.6603,
    status: 'OPEN',
    reported_at: '2025-04-12T10:05:00',
    assigned_vehicle: null,
    ward: 'Electronic City',
  },
  {
    complaint_id: 106,
    latitude: 12.9121,
    longitude: 77.6446,
    status: 'OPEN',
    reported_at: '2025-04-12T11:30:00',
    assigned_vehicle: 'KA01MN6789',
    ward: 'HSR Layout',
  },
];

export const MOCK_VEHICLES = [
  { vehicle_id: 1, vehicle_number: 'KA01AB1234', vehicle_type: 'Compactor', status: 'Active',      current_latitude: 12.9352, current_longitude: 77.6245 },
  { vehicle_id: 2, vehicle_number: 'KA01CD5678', vehicle_type: 'Tipper',    status: 'Active',      current_latitude: 12.9716, current_longitude: 77.6412 },
  { vehicle_id: 3, vehicle_number: 'KA01EF9012', vehicle_type: 'Compactor', status: 'Maintenance', current_latitude: null,    current_longitude: null   },
  { vehicle_id: 4, vehicle_number: 'KA01GH3456', vehicle_type: 'Tipper',    status: 'Active',      current_latitude: 12.9500, current_longitude: 77.5900 },
  { vehicle_id: 5, vehicle_number: 'KA01IJ7890', vehicle_type: 'Compactor', status: 'Active',      current_latitude: 13.0035, current_longitude: 77.5560 },
  { vehicle_id: 6, vehicle_number: 'KA01KL2345', vehicle_type: 'Tipper',    status: 'Active',      current_latitude: 13.0358, current_longitude: 77.5970 },
  { vehicle_id: 7, vehicle_number: 'KA01MN6789', vehicle_type: 'Compactor', status: 'Active',      current_latitude: 12.8456, current_longitude: 77.6603 },
  { vehicle_id: 8, vehicle_number: 'KA01OP3456', vehicle_type: 'Tipper',    status: 'Maintenance', current_latitude: null,    current_longitude: null   },
];

export const MOCK_CREWS = [
  { crew_id: 1, supervisor_name: 'Suresh B',   ward_name: 'Koramangala',   contact: '9845012345', total_pickups: 48 },
  { crew_id: 2, supervisor_name: 'Meena R',    ward_name: 'Indiranagar',   contact: '9845067890', total_pickups: 37 },
  { crew_id: 3, supervisor_name: 'Ravi K',     ward_name: 'Jayanagar',     contact: '9876541234', total_pickups: 52 },
  { crew_id: 4, supervisor_name: 'Anita P',    ward_name: 'Whitefield',    contact: '9900112233', total_pickups: 29 },
  { crew_id: 5, supervisor_name: 'Dinesh S',   ward_name: 'Rajajinagar',   contact: '9731122334', total_pickups: 41 },
  { crew_id: 6, supervisor_name: 'Priya V',    ward_name: 'Malleshwaram',  contact: '9845099876', total_pickups: 33 },
  { crew_id: 7, supervisor_name: 'Ramesh T',   ward_name: 'Electronic City', contact: '9980011223', total_pickups: 22 },
  { crew_id: 8, supervisor_name: 'Kavitha L',  ward_name: 'Yelahanka',     contact: '9611223344', total_pickups: 18 },
];

export const MOCK_WARDS = [
  { ward_id: 1,  ward_name: 'Koramangala',    zone: 'South'   },
  { ward_id: 2,  ward_name: 'Indiranagar',    zone: 'East'    },
  { ward_id: 3,  ward_name: 'Jayanagar',      zone: 'South'   },
  { ward_id: 4,  ward_name: 'Whitefield',     zone: 'East'    },
  { ward_id: 5,  ward_name: 'Rajajinagar',    zone: 'West'    },
  { ward_id: 6,  ward_name: 'Malleshwaram',   zone: 'North'   },
  { ward_id: 7,  ward_name: 'Electronic City',zone: 'South'   },
  { ward_id: 8,  ward_name: 'Yelahanka',      zone: 'North'   },
  { ward_id: 9,  ward_name: 'Hebbal',         zone: 'North'   },
  { ward_id: 10, ward_name: 'BTM Layout',     zone: 'South'   },
  { ward_id: 11, ward_name: 'HSR Layout',     zone: 'South'   },
  { ward_id: 12, ward_name: 'Majestic',       zone: 'Central' },
  { ward_id: 13, ward_name: 'Marathahalli',   zone: 'East'    },
  { ward_id: 14, ward_name: 'JP Nagar',       zone: 'South'   },
];

/* ──────────────────────────────────────────────────────────────────
   SESSION DATA GENERATOR
   Produces randomised data per login; clears on logout.
   Pages use getSessionData() in Phase 1 instead of raw MOCK_*.
────────────────────────────────────────────────────────────────── */

const DELAY_REASONS = [
  'Vehicle breakdown on Outer Ring Road',
  'Traffic congestion near Silk Board junction',
  'Driver absent — replacement arranged',
  'Fuel shortage at depot',
  'Road waterlogging after overnight rain',
  'Marshahalli flyover under maintenance',
  'Hebbal flyover closed — alternate route +45 min',
  'Festival procession blocking main road',
  'Compactor hydraulic failure',
  'Late crew reporting at 6 AM shift',
];

const WARD_COORDS = {
  'Koramangala':    { lat: 12.9352, lng: 77.6245 },
  'Indiranagar':    { lat: 12.9784, lng: 77.6408 },
  'Jayanagar':      { lat: 12.9308, lng: 77.5832 },
  'Whitefield':     { lat: 12.9698, lng: 77.7500 },
  'Rajajinagar':    { lat: 13.0035, lng: 77.5560 },
  'Malleshwaram':   { lat: 13.0033, lng: 77.5700 },
  'Electronic City':{ lat: 12.8456, lng: 77.6603 },
  'Yelahanka':      { lat: 13.1007, lng: 77.5963 },
  'Hebbal':         { lat: 13.0358, lng: 77.5970 },
  'BTM Layout':     { lat: 12.9166, lng: 77.6101 },
  'HSR Layout':     { lat: 12.9121, lng: 77.6446 },
  'Majestic':       { lat: 12.9767, lng: 77.5713 },
  'Marathahalli':   { lat: 12.9591, lng: 77.6972 },
  'JP Nagar':       { lat: 12.9102, lng: 77.5836 },
};

// Weighted random status — more COMPLETED than MISSED
const STATUS_WEIGHTS = [
  'COMPLETED','COMPLETED','COMPLETED','COMPLETED',
  'PENDING','PENDING','PENDING',
  'MISSED','MISSED',
  'DELAYED',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export function clearSessionData() {
  sessionStorage.removeItem('bbmp_session_data');
}

export function getSessionData() {
  const cached = sessionStorage.getItem('bbmp_session_data');
  if (cached) return JSON.parse(cached);

  // Pick 12 unique wards from the 14-ward pool
  const wardSelection = shuffle(MOCK_WARDS).slice(0, 12);

  const schedules = wardSelection.map((ward, i) => {
    const status  = pick(STATUS_WEIGHTS);
    const vehicle = pick(MOCK_VEHICLES);
    const crew    = pick(MOCK_CREWS);
    const hour    = 5 + Math.floor(Math.random() * 7);          // 05:00–11:00
    const min     = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
    return {
      schedule_id:    i + 1,
      ward_detail:    { ward_name: ward.ward_name, zone: ward.zone },
      crew_detail:    { supervisor_name: crew.supervisor_name, contact: crew.contact },
      vehicle_detail: { vehicle_number: vehicle.vehicle_number, vehicle_type: vehicle.vehicle_type },
      scheduled_time: `2025-04-12T${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`,
      status,
      delay_reason: (status === 'MISSED' || status === 'DELAYED') ? pick(DELAY_REASONS) : '',
    };
  });

  // Derive stats from generated schedules
  const stats = ['COMPLETED','MISSED','PENDING','DELAYED'].map(s => ({
    status: s,
    count:  schedules.filter(sc => sc.status === s).length,
  }));

  // 4–6 random complaints with GPS near their ward
  const numC = 4 + Math.floor(Math.random() * 3);
  const complaints = shuffle(MOCK_WARDS).slice(0, numC).map((ward, i) => {
    const base = WARD_COORDS[ward.ward_name] || { lat: 12.97, lng: 77.59 };
    return {
      complaint_id:     100 + i + 1,
      ward:             ward.ward_name,
      latitude:         (base.lat + (Math.random() - 0.5) * 0.02).toFixed(4),
      longitude:        (base.lng + (Math.random() - 0.5) * 0.02).toFixed(4),
      status:           'OPEN',
      reported_at:      new Date(Date.now() - Math.random() * 8 * 3600000).toISOString(),
      assigned_vehicle: Math.random() > 0.5 ? pick(MOCK_VEHICLES).vehicle_number : null,
    };
  });

  // Shuffle vehicle active/maintenance randomly
  const vehicles = shuffle(MOCK_VEHICLES).map((v, i) => ({
    ...v,
    status: i < 5 ? 'Active' : 'Maintenance',
    current_latitude:  i < 5 ? (12.9 + Math.random() * 0.2).toFixed(4) : null,
    current_longitude: i < 5 ? (77.55 + Math.random() * 0.2).toFixed(4) : null,
  }));

  const data = { schedules, stats, complaints, vehicles, crews: MOCK_CREWS, wards: MOCK_WARDS };
  sessionStorage.setItem('bbmp_session_data', JSON.stringify(data));
  return data;
}

/* ──────────────────────────────────────────────────────────────────
   Auth API
────────────────────────────────────────────────────────────────── */
export const authRegister = (data) => api.post('/auth/register/', data);
export const authLogin    = (data) => api.post('/auth/login/', data);
export const authMe       = ()     => api.get('/auth/me/');

/* ──────────────────────────────────────────────────────────────────
   Households / Wards API
────────────────────────────────────────────────────────────────── */
export const getWards         = ()     => api.get('/households/wards/');
export const getHouseholds    = ()     => api.get('/households/');
export const createHousehold  = (data) => api.post('/households/', data);

/* ──────────────────────────────────────────────────────────────────
   Schedules API
────────────────────────────────────────────────────────────────── */
export const getSchedules       = (params = {}) => api.get('/schedules/', { params });
export const getScheduleStats   = ()             => api.get('/schedules/stats/');
export const updateSchedule     = (id, data)     => api.patch(`/schedules/${id}/`, data);

/* ──────────────────────────────────────────────────────────────────
   Complaints API
────────────────────────────────────────────────────────────────── */
export const getComplaints   = (params = {}) => api.get('/complaints/', { params });
export const submitComplaint = (formData)    => api.post('/complaints/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

/* ──────────────────────────────────────────────────────────────────
   Vehicles / Crew API
────────────────────────────────────────────────────────────────── */
export const getVehicles = () => api.get('/vehicles/vehicles/');
export const getCrews    = () => api.get('/vehicles/crews/');
