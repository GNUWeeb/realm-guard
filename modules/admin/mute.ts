import { Command, ValidateOptions } from "../../types/type";
import { timeToSecond } from "../generic";
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

        let r;
        if ("time_mute_arg" in ctx)
                r = `User ${user.first_name} (${user.id}) is temporarily muted for ${ctx.time_mute_arg}!`
        else
                r = `User ${user.first_name} (${user.id}) has been muted!`;

        await ctx.reply(r);
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

async function tmute_with_reply(ctx: any, args: string[])
{
        const time = timeToSecond(args[1]);
        await do_mute(ctx, ctx.message?.reply_to_message?.from, time);
}

async function tmute_with_user_id(ctx: any, args: string[])
{
        const user = await extract_kick_query(ctx, `/tmute {args[1]}`);

        if (!user) {
                await ctx.reply(`Cannot resolve user_id ${args[1]}`);
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
        ] satisfies ValidateOptions[];

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

async function send_invalid_tmute_notice(ctx: any)
{
        await ctx.replyWithHTML(
                `Invalid tmute query!\n\n` +
                `Usage:\n` +
                `<code>/tmute &lt;time&gt;</code>\n` +
                `<code>/tmute &lt;user_id&gt; &lt;time&gt;</code>`);
}

async function tmute_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin",
                "noreply_admin",
        ] satisfies ValidateOptions[];

        if (!(await validateRequest(ctx, rules)))
                return;

        /*
         * Expected values:
         *
         *   args[0] = /tmute
         *   args[1] = user_id
         *   args[2] = time
         *
         * or
         *
         *   args[0] = /tmute
         *   args[1] = time
         *
         */
        const args = ctx.message.text.split(" ");
        switch (args.length) {
        case 2:
                /*
                 * `/tmute time` needs a replied message.
                 */
                if (!(await validateRequest(ctx, ["reply"])))
                        return;

                ctx.time_mute_arg = args[1];
                await tmute_with_reply(ctx, args);
                break;
        case 3:
                ctx.time_mute_arg = args[2];
                await tmute_with_user_id(ctx, args);
                break;
        default:
                await send_invalid_tmute_notice(ctx);
                break;
        }
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
