import cron from 'node-cron';
import { runTelegramJobsBatch } from '../utils/telegramJobsPoster.js';

/**
 * Daily Telegram job digest — mirrors the legacy Python telegram automation.
 * Default: 10:00 AM Asia/Kolkata every day.
 */
export function registerTelegramJobsCron() {
  const schedule = process.env.TELEGRAM_JOBS_CRON_SCHEDULE || '0 10 * * *';

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn(
      '[Telegram Jobs] TELEGRAM_BOT_TOKEN missing — cron registered but sends will fail until set.'
    );
  }

  cron.schedule(
    schedule,
    () => {
      console.log('[Telegram Jobs] Starting scheduled batch…');
      runTelegramJobsBatch().catch((err) => {
        console.error('[Telegram Jobs] Cron batch failed:', err);
      });
    },
    { timezone: 'Asia/Kolkata' }
  );

  console.log(`[Telegram Jobs] Cron registered: "${schedule}" (Asia/Kolkata)`);
}
