
const API_URL = 'http://localhost:4000/api';
const EMAIL = 'admin@comftay.com';
const PASSWORD = 'Admin@1234';

async function runTest() {
  try {
    // 1. Login
    console.log('Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    
    if (!loginRes.ok) {
      console.error('Login failed:', await loginRes.text());
      return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login successful.');

    const headers = { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. Test GET /api/reservations
    console.log('\nTesting GET /api/reservations...');
    try {
      const getRes = await fetch(`${API_URL}/reservations`, { headers });
      const getData = await getRes.json();
      console.log('GET /reservations status:', getRes.status);
      if (getRes.status !== 200) console.log('GET /reservations error:', getData);
      else console.log('GET /reservations returned', getData.length, 'items');
    } catch (err) {
      console.error('GET /reservations request failed:', err.message);
    }

    // 3. Test POST /api/reservations (Valid)
    console.log('\nTesting POST /api/reservations (Valid)...');
    try {
      const roomTypesRes = await fetch(`${API_URL}/rooms/types`);
      const roomTypesData = await roomTypesRes.json();
      const roomTypeId = roomTypesData.roomTypes[0]._id;
      
      console.log('Using roomTypeId:', roomTypeId);

      const postRes = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          roomType: roomTypeId,
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          guests: 2
        })
      });
      const postData = await postRes.json();
      console.log('POST /reservations status:', postRes.status);
      if (postRes.status !== 201) {
        console.log('POST /reservations error:', JSON.stringify(postData, null, 2));
      } else {
        console.log('POST /reservations successful. Code:', postData.reservationCode);
      }
    } catch (err) {
      console.error('POST /reservations request failed:', err.message);
    }

    // 4. Test POST /api/reservations (Same day - Expect 400)
    console.log('\nTesting POST /api/reservations (Same day - Expect 400)...');
    try {
      const roomTypesRes = await fetch(`${API_URL}/rooms/types`);
      const roomTypesData = await roomTypesRes.json();
      const roomTypeId = roomTypesData.roomTypes[0]._id;

      const postRes = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          roomType: roomTypeId,
          checkInDate: '2026-03-10',
          checkOutDate: '2026-03-10',
          guests: 2
        })
      });
      const postData = await postRes.json();
      console.log('POST /reservations status:', postRes.status);
      console.log('Response:', postData.message || postData);
    } catch (err) {
      console.error('POST /reservations request failed:', err.message);
    }

  } catch (err) {
    console.error('Test script failed:', err.message);
  }
}

runTest();
