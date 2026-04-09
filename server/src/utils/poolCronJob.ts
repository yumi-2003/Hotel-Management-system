import cron from 'node-cron';
import Pool, { PoolStatus } from '../models/Pool';

export const schedulePoolJobs = () => {
  // Check every minute if the pool should be closed
  cron.schedule('* * * * *', async () => {
    try {
      const pool = await Pool.findOne();
      if (!pool) return;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // User requested the pool to close at 9:00 PM
      if (currentHour === 21 && currentMinute === 0 && pool.status === PoolStatus.OPEN) {
        pool.status = PoolStatus.CLOSED;
        pool.currentOccupancy = 0;
        await pool.save();
        console.log('[CRON] Pool implicitly closed at 9:00 PM');
      }
    } catch (error) {
      console.error('[CRON] Error auto-closing pool:', error);
    }
  });
};
