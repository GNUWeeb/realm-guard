import { Command } from "../../types/type";
import { validateRequest } from "../validation";

// `/ban` command
export const banCommand: Command = {
    command: "ban",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;
        // Check if user trying to ban by username since you simply can't
        else if (
            !ctx.message.reply_to_message &&
            ctx.message.text.split(" ")[1].startsWith("@")
        ) {
            await ctx.reply(
                "The API doesn't allow me to ban users by username, please reply to a message or type the user ID to ban a user!"
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }

        // Check if user is trying to do ban reason, we'll implement ban reason later
        else if (
            isNaN(Number(ctx.message.text.split(" ")[1])) &&
            !ctx.message.reply_to_message
        ) {
            await ctx.reply(
                `I don't recognize that as a user ID, please reply to a message or type the user ID to ban a user! Also, ban reasons are not implemented yet.`
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }

        // Ban user by reply
        else if (ctx.message.reply_to_message) {
            await ctx.telegram.banChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!
            );
            console.log(
                `[BAN] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) banned!`
            );
        }

        // Ban user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }
            await ctx.telegram.banChatMember(ctx.chat.id, user.user.id);
            console.log(`[BAN] ${user.user.first_name} (${user.user.id})`);
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) banned!`
            );
            return;
        }

        // Other cases
        else {
            console.log("[ERROR] No valid reply or user ID!");
            await ctx.reply(
                "Please reply to a message or type the user ID to ban a user!"
            );
            return;
        }
    },
};

// `/unban` command
export const unbanCommand: Command = {
    command: "unban",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;

        // Check if user trying to unban by username since you simply can't
        if (
            !ctx.message.reply_to_message &&
            ctx.message.text.split(" ")[1].startsWith("@")
        ) {
            await ctx.reply(
                "The API doesn't allow me to unban users by username, please reply to a message or type the user ID to unban a user!"
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }

        // Check if user is trying to do dumb shit, there's no such thing as unban reason
        else if (
            isNaN(Number(ctx.message.text.split(" ")[1])) &&
            !ctx.message.reply_to_message
        ) {
            await ctx.reply(
                "I don't recognize that as a user ID, please reply to a message or type the user ID to unban a user! Also, unban reasons are dumb, I mean just unban them."
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }

        // Unban user by reply
        else if (ctx.message.reply_to_message) {
            await ctx.telegram.unbanChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!,
                { only_if_banned: true }
            );
            console.log(
                `[UNBAN] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) unbanned!`
            );
            return;
        }

        // Unban user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }
            await ctx.telegram.unbanChatMember(ctx.chat.id, user.user.id, {
                only_if_banned: true,
            });
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) unbanned!`
            );
            return;
        }

        // Other cases
        else {
            await ctx.reply(
                "Please reply to a message or type the user ID to unban a user!"
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }
    },
};
