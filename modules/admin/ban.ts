import { Command, ValidateOptions } from "../../types/type";
import { validateRequest } from "../validation";
import { extract_kick_query } from "./kick";
import { timeToSecond, getStorageDir } from "../generic";
import { writeFile, rm, mkdir } from "fs/promises";
import { existsSync } from "fs";

/*
 * TODO(Viro_SSFS,ammarfaizi2):
 *
 *   Refactor this file again, it is confusing to follow.
 *   Sorry for the mess.
 *
 */

const storage_dir = getStorageDir();

async function do_ban(ctx: any, user: any, seconds: number = -1,
                      revoke_msg: boolean = false, silent: boolean = false)
{
        let until_date;

        if (seconds === -1) {
                /*
                 * Forever!
                 */
                until_date = 0;
        } else {
                until_date = Math.floor(Date.now() / 1000) + seconds;
        }

        if (silent) {
                // create a directory if it doesn't exist
                if (!existsSync(`${storage_dir}ban_silent`))
                        await mkdir(`${storage_dir}ban_silent`);
                // create a file with 0 bytes in it
                await writeFile(
                        `${storage_dir}ban_silent/${ctx.chat.id}.temp`,
                        "",
                );
        }

        await ctx.telegram.banChatMember(ctx.chat.id, user.id, until_date, {
                revoke_messages: revoke_msg,
        });

        const c = (until_date === 0) ? "" : "T";
        const s = (silent) ? "S" : "";
        console.log(`[${c}${s}BAN] ${user.first_name} (${user.id})`);

        if (silent) {
                const time = setTimeout(async () => {
                        await rm(`${storage_dir}ban_silent/${ctx.chat.id}.temp`);
                        clearTimeout(time);
                }, 4 * 1000);
                return;
        }

        let r;
        if ("time_tban_arg" in ctx)
                r = `User ${user.first_name} (${user.id}) is temporarily banned for ${ctx.time_tban_arg}!`;
        else
                r = `User ${user.first_name} (${user.id}) has been banned!`;

        await ctx.reply(r);
}

async function do_unban(ctx: any, user: any, silent: boolean = false)
{
        await ctx.unbanChatMember(user.id, {only_if_banned: true});
        console.log(`[UNBAN] ${user.first_name} (${user.id})`);

        if (silent)
                return;

        await ctx.reply(`User ${user.first_name} (${user.id}) has been unbanned!`);
}

async function ban_with_reply(ctx: any, seconds: number = -1,
                              revoke_msg: boolean = false,
                              silent: boolean = false)
{
        await do_ban(ctx, ctx.message.reply_to_message.from, seconds,
                     revoke_msg, silent);
}

async function unban_with_reply(ctx: any)
{
        await do_unban(ctx, ctx.message.reply_to_message.from);
}

async function ban_with_user_id(ctx: any, seconds: number = -1,
                                revoke_msg: boolean = false,
                                silent: boolean = false)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user) {
                if (!ctx.show_resolve_fail_msg)
                        return false;

                let x = ctx.message.text.split(" ");
                await ctx.reply(`Cannot resolve user_id ${x[1]}`);
                return false;
        }

        await do_ban(ctx, user, seconds, revoke_msg, silent);
        return true;
}

async function unban_with_user_id(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_unban(ctx, user);
        return true;
}

async function tban_with_reply(ctx: any, args: string[])
{
        ctx.time_tban_arg = args[1];
        await ban_with_reply(ctx, timeToSecond(args[1]));
        return true;
}

async function tban_with_user_id(ctx: any, args: string[])
{
        ctx.message.text = `/tban ${args[1]}`;
        ctx.time_tban_arg = args[2];
        ctx.show_resolve_fail_msg = true;
        await ban_with_user_id(ctx, timeToSecond(args[2]));
        return true;  
}

async function __ban_cmd(ctx: any, revoke_msg: boolean = false,
                         silent: boolean = false)
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
                if (await ban_with_user_id(ctx, -1, revoke_msg, silent))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await ban_with_reply(ctx, -1, revoke_msg, silent);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to ban a user!");
}

async function ban_cmd(ctx: any)
{
        await __ban_cmd(ctx, false, false);
}

async function unban_cmd(ctx: any)
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
                if (await unban_with_user_id(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await unban_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to unban a user!");
}

async function send_invalid_tban_notice(ctx: any)
{
        const r =
                `Invalid tban query!\n\n` +
                `Usage:\n` +
                `<code>/tban &lt;time&gt;</code>\n` +
                `<code>/tban &lt;user_id&gt; &lt;time&gt;</code>`

        await ctx.replyWithHTML(r);
}

async function tban_cmd(ctx: any)
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
         *   args[0] = /tban
         *   args[1] = user_id
         *   args[2] = time
         *
         * or
         *
         *   args[0] = /tban
         *   args[1] = time
         *
         */
        const args = ctx.message.text.split(" ");
        switch (args.length) {
        case 2:
                /*
                 * `/tban time` needs a replied message.
                 */
                if (!(await validateRequest(ctx, ["reply"])))
                        return;

                await tban_with_reply(ctx, args)
                break;
        case 3:
                await tban_with_user_id(ctx, args);
                break;
        default:
                await send_invalid_tban_notice(ctx);
                break;
        }
}

async function sban_cmd(ctx: any)
{
        /*
         * Pretty much the same thing as `/ban` but:
         * `silent: true`.
         */
        await __ban_cmd(ctx, false, true);
}

export const banCommand: Command = {
        command: "ban",
        function: ban_cmd
};

export const unbanCommand: Command = {
        command: "unban",
        function: unban_cmd
};

// `/tban <time>` command (temporarily ban user)
export const tbanCommand: Command = {
        command: "tban",
        function: tban_cmd
};

// `/sban` command (silently ban user)
export const sbanCommand: Command = {
        command: "sban",
        function: sban_cmd
};
