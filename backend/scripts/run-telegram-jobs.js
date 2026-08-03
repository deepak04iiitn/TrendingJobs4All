/**
 * Manual one-shot Telegram jobs post (same logic as the daily cron).
 * Usage (from repo root):
 *   node backend/scripts/run-telegram-jobs.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { runTelegramJobsBatch } from '../utils/telegramJobsPoster.js';

dotenv.config();

async function main() {
  if (!process.env.MONGO) {
    throw new Error('MONGO is not set');
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  await mongoose.connect(process.env.MONGO);
  console.log('MongoDB connected. Running Telegram jobs batch…');

  const results = await runTelegramJobsBatch();
  console.log(JSON.stringify(results, null, 2));

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.connection.close();
  } catch {
    // ignore
  }
  process.exit(1);
});
