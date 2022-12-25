import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

export const bot = new Telegraf(process.env.BOT_TOKEN || "").catch((err) => {
  console.error(err);
});
