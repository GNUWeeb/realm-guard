import { Command } from "../../types/type";
import { validateRequest } from "../validation";

export const purgeCommand: Command = {
    command: "purge",
    function: async (ctx) => {
        if (
            (await validateRequest(ctx, [
                "reply",
                "admin",
                "noreply_admin",
            ])) === false
        )
            return;
        // Purge by reply
        else if (ctx.message.reply_to_message) {
            const repliedId = ctx.message.reply_to_message.message_id;
            const messageId = ctx.message.message_id;
            const ids: number[] = [];

            let iterator = repliedId;
            while (iterator < messageId) {
                ids.push(iterator);
                iterator++;
            }

            await Promise.all(ids.map((id) => ctx.deleteMessage(id)));

            await ctx.reply("Purge complete!");
            console.log(
                `[PURGE] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
        }
    },
};
