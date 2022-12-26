import { Command } from "../../types/type";
import { validateRequest } from "../validation";

export const kickCommand: Command = {
    command: "kick",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;
        // Kick user by reply
        else if (ctx.message.reply_to_message) {
            await ctx.telegram.unbanChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!
            );
            console.log(
                `[KICK] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) kicked!`
            );
        }

        // Kick user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }
            await ctx.telegram.unbanChatMember(ctx.chat.id, user.user.id);
            console.log(`[KICK] ${user.user.first_name} (${user.user.id})`);
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) kicked!`
            );
        }

        // Other cases
        else {
            console.log("[ERROR] No valid reply or user ID!");
            await ctx.reply(
                "Please reply to a message or type the user ID to kick a user!"
            );
            return;
        }
    },
};
