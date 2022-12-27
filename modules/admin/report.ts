import { Command, ValidateOptions } from "../../types/type";
import { validateRequest } from "../validation";
import { construct_name } from "../generic";

async function send_report(ctx: any, admin: any)
{
        if (admin.user.id === ctx.botInfo.id)
                return;

        const reason = ctx.message.text?.split(" ").slice(1).join(" ") ||
                        "No reason provided.";
        const reportedUser = ctx.message.reply_to_message?.from;
        const name = construct_name(ctx.from);
        const reportedName = construct_name(reportedUser);
        const report_text =
                `User ${reportedName} (${reportedUser?.id}) reported by ${name} (${ctx.from?.id})!` +
                `\n\nReason: ${reason}`;

        const fail = () => {
                console.log(`[ERROR] Could not send report message to ${admin.user.first_name} (${admin.user.id})!`);
        };

        await ctx.telegram.sendMessage(admin.user.id, report_text).catch(fail);
}

async function report_cmd(ctx: any)
{
        const rules = [
                "in_supergroup",
                "noreply_admin",
                "reply",
        ] satisfies ValidateOptions[];

        if (!(await validateRequest(ctx, rules)))
                return;

        const reportedUser = ctx.message.reply_to_message?.from;
        const admins = await ctx.getChatAdministrators();
        await admins.forEach(async (admin: any) => send_report(ctx, admin));
        await ctx.reply(`User ${reportedUser?.first_name} (${reportedUser?.id}) reported!`);
}

// `report` command (report a user in the group to admins)
export const reportCommand: Command = {
        command: "report",
        function: report_cmd
};
