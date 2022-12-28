import { Command, ValidateOptions } from "../../types/type";
import { validateRequest } from "../validation";

async function purge_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "user_is_admin",
                "bot_is_admin"
        ] satisfies ValidateOptions[];

        if (!(await validateRequest(ctx, rules)))
                return;

        const message = ctx.message;
        const repliedId = message.reply_to_message.message_id;
        const messageId = message.message_id;
        const ids: number[] = [];

        let iterator = repliedId;
        while (iterator < messageId) {
                ids.push(iterator);
                iterator++;
        }

        await Promise.all(ids.map((id) => {
                const f = function () {
                        console.log(`[ERROR] Could not delete message ${id}!`);
                };
                ctx.deleteMessage(id).catch(f);
        }));
        await ctx.reply("Purge complete!");
        console.log(`[PURGE] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`);
}

export const purgeCommand: Command = {
        command: "purge",
        function: purge_cmd
};
