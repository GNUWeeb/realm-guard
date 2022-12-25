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
  /setfarewell - Set the farewell message for the group
  /pin - Pin a message in the group
  /unpin - Unpin a message in the group

<b>Realm Guard User Commands</b>
  /warns - Show your warns in the group
  /report - Report a user in the group
  /donate - Donate to help support development`

const versionString = `<b>Realm Guard</b> v0.0.1-alpha
Node Version: ${process.version}
Telegraf Version: 4.11.2`;

export const startCommand = {
  command: "start",
  function: async (ctx: any) => {
    await ctx.replyWithHTML(startString);
  },
};

export const pingCommand = {
  command: "ping",
  function: async (ctx: any) => {
    await ctx.replyWithHTML(`<b>Pong!</b> ${Date.now() - ctx.message.date * 1000}ms`);
  },
};

export const versionCommand = {
  command: "version",
  function: async (ctx: any) => {
    await ctx.replyWithHTML(versionString);
  },
};

export const helpCommand = {
  command: "help",
  function: async (ctx: any) => {
    await ctx.replyWithHTML(helpString);
  },
}