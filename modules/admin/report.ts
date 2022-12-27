import { Command } from "../../types/type";
import { validateRequest } from "../validation";

// `report` command (report a user in the group to admins)
export const reportCommand: Command = {
    command: "report",
    function: async (ctx) => {
        const val = await validateRequest(
            ctx,
            ["reply", "supergroup", "admin", "noreply_admin"]
        ) === false;


        if (val)
            return;

        // Get the reported user
        const reportedUser = ctx.message.reply_to_message?.from;

        // Get the admins of the group
        const admins = await ctx.telegram.getChatAdministrators(ctx.chat.id);

        // Send a report message to all admins
        admins.forEach(async (admin) => {
            if (admin.user.id === ctx.botInfo.id) return;

            await ctx.telegram.sendMessage(
                admin.user.id,
                `User ${reportedUser?.first_name} (${reportedUser?.id}) reported by ${ctx.from?.first_name} (${ctx.from?.id})!` +
                `\n\nReason: ${ctx.message.text?.split(" ").slice(1).join(" ") || "No reason provided."}`
            ).catch(() => {
                console.log(`[ERROR] Could not send report message to ${admin.user.first_name} (${admin.user.id})!`);
            });
        });

        // Send a confirmation message to the reporter
        await ctx.reply(
            `User ${reportedUser?.first_name} (${reportedUser?.id}) reported!`
        );
    }
};
