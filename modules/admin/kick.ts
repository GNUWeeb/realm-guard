import { Command, ValidateOptions } from "../../types/type";
import { parse_ban_cmd } from "./ban";
import { validateRequest } from "../validation";

const SIDE_NOTE = `<b>Side note:</b>
Currently, the <code>[reason]</code> doesn't mean anything, but accepted.`;

const KICK_ARG_SPEC = `
<code>/kick</code> command arguments spec:

  <code>/kick</code>   (must reply)
  <code>/kick [reason]</code>   (must reply, *)
  <code>/kick [user_id]</code>
  <code>/kick [user_id] [reason]</code>

*: The first word of the <code>[reason]</code> sentence must be NaN. If it is a number, it will fallback to <code>[user_id]</code> variants.

${SIDE_NOTE}`;

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
        await ctx.reply(`User ${user.first_name} (${user.id}) has been kicked!`);
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

        /*
         * The `/kick` command has the same arguments spec
         * with the `/ban` command.
         */
        const ret = await parse_ban_cmd(ctx);
        if (ret.err) {
                await ctx.replyWithHTML(ret.err + `\n${KICK_ARG_SPEC}`);
                return;
        }

        /*
         * TODO(???): What should we do with @ret.reason?
         */
        await do_kick(ctx, ret.user);
}

export const kickCommand: Command = {
        command: "kick",
        function: kick_cmd
};
