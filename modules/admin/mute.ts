import { Command, ValidateOptions } from "../../types/type";
import { timeToSecond } from "../generic";
import { validateRequest } from "../validation";
import { extract_kick_query } from "./kick";
import { parse_tban_cmd, parse_ban_cmd } from "./ban";


const MUTE_MODULE_RULES = [
        "in_supergroup",
        "user_is_admin",
        "bot_is_admin",
        "noreply_admin",
] satisfies ValidateOptions[];

const SIDE_NOTE = `<b>Side note:</b>
Currently, the <code>[reason]</code> doesn't mean anything, but accepted.`;

const MUTE_ARG_SPEC = `
<code>/mute</code> command arguments spec:

  <code>/mute</code>   (must reply)
  <code>/mute [reason]</code>   (must reply, *)
  <code>/mute [user_id]</code>
  <code>/mute [user_id] [reason]</code>

*: The first word of the <code>[reason]</code> sentence must be NaN. If it is a number, it will fallback to <code>[user_id]</code> variants.

${SIDE_NOTE}`;

const TMUTE_ARG_SPEC = `
<code>/tmute</code> command arguments spec:

  <code>/tmute [time]</code>   (must reply)
  <code>/tmute [time] [reason]</code>   (must reply, *)
  <code>/tmute [user_id] [time]</code>
  <code>/tmute [user_id] [time] [reason]</code>

*: The first word of the <code>[reason]</code> sentence must be NaN. If it is a number, it will fallback to <code>[user_id] [time]</code> variants.

${SIDE_NOTE}`;



async function do_restrict(ctx: any, user: any, seconds: number, can: boolean)
{
        let until_date;

        if (seconds === 0) {
                /* Forever. */
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

async function do_mute(ctx: any, user: any, seconds: number = 0)
{
        await do_restrict(ctx, user, seconds, false);
        console.log(`[MUTE] ${user.first_name} (${user.id})`);

        let r = `User ${user.first_name} (${user.id}) `;
        if (ctx?.time_arg)
                r += `is temporarily muted for ${ctx?.time_arg}!`
        else
                r += `has been muted!`;

        await ctx.reply(r);
}

async function do_unmute(ctx: any, user: any, seconds: number = -1)
{
        await do_restrict(ctx, user, seconds, true);
        console.log(`[UNMUTE] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) has been unmuted!`);
}

async function unmute_with_query(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_unmute(ctx, user);
        return true;
}

async function unmute_with_reply(ctx: any)
{
        await do_unmute(ctx, ctx.message.reply_to_message.from);
}

async function unmute_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin",
                "noreply_admin",
        ] satisfies ValidateOptions[];

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

async function mute_cmd(ctx: any)
{
        if (!(await validateRequest(ctx, MUTE_MODULE_RULES)))
                return;

        /*
         * `/mute` has the same command arguments spec with `/ban`.
         */
        const ret = await parse_ban_cmd(ctx);
        if (ret.err) {
                await ctx.replyWithHTML(ret.err + `\n${MUTE_ARG_SPEC}`);
                return;
        }

        /*
         * TODO(???): What should we do with @ret.reason?
         */
        await do_mute(ctx, ret.user);
}

async function tmute_cmd(ctx: any)
{
        if (!(await validateRequest(ctx, MUTE_MODULE_RULES)))
                return;

        /*
         * `/tmute` has the same command arguments spec with `/tban`.
         */
        const ret = await parse_tban_cmd(ctx);
        if (ret.err) {
                await ctx.replyWithHTML(ret.err + `\n${TMUTE_ARG_SPEC}`);
                return;
        }

        /*
         * TODO(???): What should we do with @ret.reason?
         */
        await do_mute(ctx, ret.user, ret.seconds);
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
