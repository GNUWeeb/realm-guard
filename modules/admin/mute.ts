import { Command } from "../../types/type";
import { validateRequest } from "../validation";
import { extract_kick_query } from "./kick";

async function do_restrict(ctx: any, user: any, seconds: number, can: boolean)
{
        let until_date;

        if (seconds == -1) {
                /*
                 * Forever!
                 */
                until_date = 0;
        } else {
                until_date = Math.floor(Date.now() / 1000) + seconds;
        }

        const opt = {
                permissions: {
                        can_send_messages: can,
                        can_send_media_messages: can,
                        can_send_polls: can,
                        can_send_other_messages: can,
                },
                until_date: until_date
        };
        await ctx.restrictChatMember(user.id, opt);
}

async function do_mute(ctx: any, user: any, seconds: number = -1)
{
        await do_restrict(ctx, user, seconds, false);
        console.log(`[MUTE] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) has been muted!`);
}

async function do_unmute(ctx: any, user: any, seconds: number = -1)
{
        await do_restrict(ctx, user, seconds, true);
        console.log(`[UNMUTE] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) has been unmuted!`);
}

async function mute_with_reply(ctx: any)
{
        await do_mute(ctx, ctx.message.reply_to_message.from);
}

async function unmute_with_reply(ctx: any)
{
        await do_unmute(ctx, ctx.message.reply_to_message.from);
}

async function mute_with_query(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_mute(ctx, user);
        return true;
}

async function unmute_with_query(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_unmute(ctx, user);
        return true;
}

/*
 * TODO(irvanmalik48):
 * This timeToSecond() function is flawed. For example,
 * if you have "zxc1234aaah", the result is still valid.
 * We should return invalid in that case.
 */
function timeToSecond(time: string)
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

async function tmute_query_with_reply(ctx: any)
{
        const args = ctx.message.text.split(" ");

        if (args.length != 2) {
                ctx.reply("Invalid tmute query!");
                return;
        }

        const time = timeToSecond(args[1]);
        await do_mute(ctx, ctx.message?.reply_to_message?.from, time);
}

async function tmute_query_with_user_id(ctx: any)
{
        const args = ctx.message.text.split(" ");

        if (args.length != 3) {
                ctx.reply("Invalid tmute query!");
                return;
        }

        const user = extract_kick_query(ctx, `/tmute {args[1]}`);

        if (!user) {
                ctx.reply(`Cannot resolve user_id ${args[1]}`);
                return;
        }

        const time = timeToSecond(args[2]);
        await do_mute(ctx, user, time);
}

async function mute_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin",
                "noreply_admin",
        ];

        if (!(await validateRequest(ctx, rules)))
                return;

        if (ctx.message?.text) {
                if (await mute_with_query(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await mute_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to mute a user!");
}

async function unmute_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin",
                "noreply_admin",
        ];

        if (!(await validateRequest(ctx, rules)))
                return;

        if (ctx.message?.text) {
                if (await unmute_with_query(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await unmute_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to unmute a user!");
}

async function tmute_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin",
                "noreply_admin",
        ];

        if (!(await validateRequest(ctx, rules)))
                return;

        if (ctx.message?.reply_to_message?.from) {
                await tmute_query_with_reply(ctx);
                return;
        }

        await tmute_query_with_user_id(ctx);
}

export const muteCommand: Command = {
        command: "mute",
        function: mute_cmd
};

export const unmuteCommand: Command = {
        command: "unmute",
        function: unmute_cmd
};

export const timedMuteCommand: Command = {
        command: "tmute",
        function: tmute_cmd
};
