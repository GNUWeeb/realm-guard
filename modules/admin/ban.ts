import { Command } from "../../types/type";
import { validateRequest } from "../validation";
import { extract_kick_query } from "./kick";

async function do_ban(ctx: any, user: any)
{
        await ctx.banChatMember(user.id);
        console.log(`[BAN] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) has been banned!`);
}

async function do_unban(ctx: any, user: any)
{
        await ctx.unbanChatMember(user.id, {only_if_banned: true});
        console.log(`[UNBAN] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) has been unbanned!`);
}

async function ban_with_reply(ctx: any)
{
        await do_ban(ctx, ctx.message.reply_to_message.from);
}

async function unban_with_reply(ctx: any)
{
        await do_unban(ctx, ctx.message.reply_to_message.from);
}

async function ban_with_query(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_ban(ctx, user);
        return true;
}

async function unban_with_query(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_unban(ctx, user);
        return true;
}

async function ban_cmd(ctx: any)
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
                if (await ban_with_query(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await ban_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to ban a user!");
}

async function unban_cmd(ctx: any)
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
                if (await unban_with_query(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await unban_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to unban a user!");
}

export const banCommand: Command = {
        command: "ban",
        function: ban_cmd
};

export const unbanCommand: Command = {
        command: "unban",
        function: unban_cmd
};
