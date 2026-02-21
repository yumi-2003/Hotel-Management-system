import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:4000/api';
const EMAIL = 'admin@comftay.com';
const PASSWORD = 'Admin@1234';

async function verify() {
  try {
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

    const { token } = await loginRes.json() as any;
    console.log('Login successful.');

    console.log('Fetching housekeeping logs...');
    const logsRes = await fetch(`${API_URL}/housekeeping`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!logsRes.ok) {
      console.error('Fetch logs failed:', await logsRes.text());
      return;
    }

    const logs = await logsRes.json() as any[];
    console.log(`Fetched ${logs.length} logs.`);

    if (logs.length > 0) {
      const firstLog = logs[0];
      console.log('First log data sample:');
      console.log(' - ID:', firstLog._id);
      console.log(' - Task:', firstLog.task);
      console.log(' - Status:', firstLog.status);
      console.log(' - Room Info:', firstLog.room ? `Room ${firstLog.room.roomNumber}, Floor ${firstLog.room.floor}` : 'MISSING');
      
      if (firstLog.room && firstLog.room.roomNumber && firstLog.room.floor !== undefined) {
        console.log('SUCCESS: Room and Floor info present!');
      } else {
        console.error('FAILURE: Room or Floor info missing in mapped "room" object.');
        console.log('Full log object keys:', Object.keys(firstLog));
        if (firstLog.room) console.log('Room object keys:', Object.keys(firstLog.room));
        process.exit(1);
      }
    } else {
      console.log('No logs found to verify. Please ensure there is at least one housekeeping task.');
    }
  } catch (error: any) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  }
}

verify();
