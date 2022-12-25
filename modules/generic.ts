import { Command } from "../types/type";
import * as fs from 'fs';

const startString = `<b>Realm Guard's here at your service!</b>

<i>Please note that this bot is still in development, and may not work as expected.</i>
Use /help to see a list of commands.

If you have any questions, please contact @lappretard.
`;

const helpString = `<b>Realm Guard Help</b>
  /start - Start Realm Guard
  /help - Show this help message
  /ping - Check if Realm Guard is online
  /version - Show Realm Guard's version

<b>Realm Guard Admin Commands</b>
  /ban - Ban a user from the group
  /unban - Unban a user from the group
  /kick - Kick a user from the group
  /mute - Mute a user in the group
  /unmute - Unmute a user in the group
  /warn - Warn a user in the group
  /unwarn - Unwarn a user in the group
  /purge - Purge messages from the group
  /setwelcome - Set the welcome message for the group
  /getwelcome - Get the welcome message for the group
  /resetwelcome - Reset the welcome message for the group
  /setfarewell - Set the farewell message for the group
  /getfarewell - Get the farewell message for the group
  /resetfarewell - Reset the farewell message for the group
  /resetgreets - Reset the welcome and farewell messages for the group
  /pin - Pin a message in the group
  /unpin - Unpin a message in the group

<b>Realm Guard User Commands</b>
  /warns - Show your warns in the group
  /report - Report a user in the group
  /donate - Donate to help support development`

const versionString = `<b>Realm Guard</b> v0.0.1-alpha
Node Version: ${process.version}
Telegraf Version: 4.11.2`;

export const startCommand: Command = {
  command: "start",
  function: async (ctx) => {
    await ctx.replyWithHTML(startString);
  },
};

export const pingCommand: Command = {
  command: "ping",
  function: async (ctx) => {
    await ctx.replyWithHTML(`<b>Pong!</b> ${Date.now() - ctx.message.date * 1000}ms`);
  },
};

export const versionCommand: Command = {
  command: "version",
  function: async (ctx) => {
    await ctx.replyWithHTML(versionString);
  },
};

export const helpCommand: Command = {
  command: "help",
  function: async (ctx) => {
    await ctx.replyWithHTML(helpString);
  },
}

export const replyToMsgId = async function (ctx: any, text: string, msg_id: number) {
  await ctx.reply({
    text: text,
    reply_to_message_id: msg_id
  });
}

export const getStorageDir = function () {
  let ret = process.env?.STORAGE_DIR;

  if (!ret)
    ret = "dist/data/";

  /*
   * Make sure the storage dir exists.
   * If not, create it.
   */
  if (!fs.existsSync(ret))
    fs.mkdirSync(ret);

  return ret;
}
  
