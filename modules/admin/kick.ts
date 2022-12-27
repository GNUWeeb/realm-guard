import { Command, ValidateOptions } from "../../types/type";
import { validateRequest } from "../validation";

/*
 * Export this for ban.ts.
 */
export async function extract_kick_query(ctx: any, text: string)
{
        const args = text.split(" ");
        let user;

        /*
         * Currently, supported pattern is only:
         * /cmd 123456789
         *
         * TODO(Viro_SSFS): Implement ban reason here.
         *
         * TODO(Viro_SSFS): Ban by username is possible with storage.
         *                  This bot must have a memory!
         */
        if (args.length != 2)
                return false;

        if (!args[1].match(/^\d+$/))
                return false;

        try {
                user = await ctx.getChatMember(Number(args[1]));
                if (!("user" in user))
                        return false;

        } catch (e) {
                return false;
        }

        return user.user;
}

async function do_kick(ctx: any, user: any)
{
        await ctx.unbanChatMember(user.id);
        console.log(`[KICK] ${user.first_name} (${user.id})`);
        await ctx.reply(`User ${user.first_name} (${user.id}) kicked!`);
}

async function kick_with_reply(ctx: any)
{
        await do_kick(ctx, ctx.message.reply_to_message.from);
}

async function kick_with_query(ctx: any)
{
        const user = extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_kick(ctx, user);
        return true;
}

async function kick_cmd(ctx: any)
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
                if (await kick_with_query(ctx))
                        return;
        }

        if (ctx.message?.reply_to_message?.from) {
                await kick_with_reply(ctx);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to kick a user!");
}

export const kickCommand: Command = {
        command: "kick",
        function: kick_cmd
};
