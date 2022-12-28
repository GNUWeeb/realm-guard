import { Command, ContextDefault, UserInfo } from "../types/type";
import * as fs from "fs";

const startString = `<b>${process.env.BOT_NAME}'s here at your service!</b>

<i>Please note that this bot is still in development, and may not work as expected.</i>
Use /help to see a list of commands.

If you have any questions, please contact @lappretard.
`;

const helpString = `<b>${process.env.BOT_NAME} Help</b>
  /start - Start ${process.env.BOT_NAME}
  /help - Show this help message
  /ping - Check if ${process.env.BOT_NAME} is online
  /version - Show ${process.env.BOT_NAME}'s version

<b>${process.env.BOT_NAME} Admin Commands</b>
  /ban [id|reply] - Ban a user from the group
  /sban [id|reply] - Ban a user from the group silently
  /tban [id|reply] [time] - Temporarily ban a user from the group
  /unban - Unban a user from the group
  /kick - Kick a user from the group
  /mute [id|reply] - Mute a user in the group
  /tmute [id|reply] [time] - Temporarily mute a user in the group
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

<b>${process.env.BOT_NAME} User Commands</b>
  /warns - Show your warns in the group
  /report - Report a user in the group
  /donate - Donate to help support development`;

const versionString = `<b>Realm Guard</b> v0.0.2-alpha
Node Version: ${process.version}
Telegraf Version: 4.11.2`;

const userString = `<b>User Info</b>
<b>First Name:</b> {{first_name}} {{last_name}}
<b>Username:</b> {{username}}
<b>ID:</b> {{id}}
<b>Is Bot:</b> {{is_bot}}
<b>Is Admin:</b> {{is_admin}}`;

export const startCommand: Command = {
    command: "start",
    function: async (ctx) => {
        await ctx.replyWithHTML(startString);
    },
};

export const pingCommand: Command = {
        command: "ping",
        function: async (ctx) => {
                /*
                 * TODO(Viro_SSFS):
                 * This is not accurate, @ctx.message.date precision
                 * is second, not ms. We have to calculate a round
                 * trip send + edit message to get more accurate
                 * result.
                 */
                const ms = Date.now() - ctx.message.date * 1000;
                await ctx.replyWithHTML(`<b>Pong!</b> ${ms}ms`);
        }
};

export const versionCommand: Command = {
        command: "version",
        function: async (ctx) => {
                await ctx.replyWithHTML(versionString);
        }
};

export const helpCommand: Command = {
        command: "help",
        function: async (ctx) => {
                await ctx.replyWithHTML(helpString);
        }
};

async function printChatString(ctx: ContextDefault, vars: UserInfo)
{
        if (vars.lastName)
                vars.lastName = `\n<b>Last Name:</b> ${vars.lastName}`;

        if (vars.isAdmin === "administrator" || vars.isAdmin === "creator") {
                vars.isAdmin = "Yes";
        } else {
                vars.isAdmin = "No";
        }

        const text = userString
                .replace("{{first_name}}", vars.firstName)
                .replace("{{last_name}}", vars.lastName)
                .replace("{{username}}", vars.username)
                .replace("{{id}}", String(vars.id))
                .replace("{{is_bot}}", vars.isBot ? "Yes" : "No")
                .replace("{{is_admin}}", vars.isAdmin);

        await ctx.replyWithHTML(text);
}

async function print_user_info_func(ctx: any)
{
        let user_id;

        if (ctx.message.reply_to_message) {
                user_id = ctx.message.reply_to_message.from.id;
        } else if (ctx.message.from) {
                user_id = ctx.message.from.id;       
        } else if (!isNaN(Number(ctx.message.text?.split(" ")[1]))) {
                user_id = Number(ctx.message.text?.split(" ")[1]);
        } else {
                /* WTF is this! */
                return;
        }

        const user = await ctx.getChatMember(user_id);
        await printChatString(ctx, {
                firstName: user.user?.first_name!,
                lastName: user.user?.last_name!,
                username: user.user?.username!,
                id: String(user.user?.id!),
                isBot: user.user?.is_bot!,
                isAdmin: user.status,
        });
}

export const printUserInfoCommand: Command = {
        command: "user",
        function: print_user_info_func,
};

/*
 * TODO(irvanmalik48):
 * This timeToSecond() function is flawed. For example,
 * if you have "zxc1234aaah", the result is still valid.
 * We should return invalid in that case.
 */
export function timeToSecond(time: string)
{
        if (time.endsWith("s"))
                return Number(time.slice(0, -1));

        if (time.endsWith("m"))
                return Number(time.slice(0, -1)) * 60;

        if (time.endsWith("h"))
                return Number(time.slice(0, -1)) * 60 * 60;

        if (time.endsWith("d"))
                return Number(time.slice(0, -1)) * 60 * 60 * 24;

        if (time.endsWith("w"))
                return Number(time.slice(0, -1)) * 60 * 60 * 24 * 7;

        if (time.endsWith("mo"))
                return Number(time.slice(0, -2)) * 60 * 60 * 24 * 30;

        if (time.endsWith("y"))
                return Number(time.slice(0, -1)) * 60 * 60 * 24 * 365;

        return Number(time);
}

export async function replyToMsgId(ctx: any, text: string, msg_id: number)
{
        await ctx.reply({text: text, reply_to_message_id: msg_id});
}

export function getStorageDir()
{
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

export function construct_name(from: any) {
        let name = `${from?.first_name}`;

        if ("last_name" in from)
                name += ` ${from.last_name}`;

        if ("username" in from)
                name += ` (@${from.username})`;

        return name;
}