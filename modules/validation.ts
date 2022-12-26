import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { ValidateOptions } from "../types/type";

export async function validateRequest(
    ctx: NarrowedContext<
        Context<Update>,
        {
            message: Update.New & Update.NonChannel & Message.TextMessage;
            update_id: number;
        }
    >,
    includes: ValidateOptions[]
): Promise<boolean> {
    const message = ctx.message;
    const reply_to = message.reply_to_message;
    const user = message.from;
    const target_user_id = reply_to?.from?.id;

    if (includes.includes("reply")) {
        if (!reply_to) {
            ctx.reply("You must reply to a message!");
            console.log(
                `[ERROR] User with ID ${user.id} didn't reply to a message!`
            );
            return false;
        }
    }

    if (includes.includes("query")) {
        if (!ctx.message.text.split(" ")[1]) {
            ctx.reply("You must provide a query!");
            console.log(
                `[ERROR] User with ID ${user.id} didn't provide a query!`
            );
            return false;
        }
    }

    const target_user_status = (
        await ctx.getChatMember(target_user_id as number)
    ).status;

    if (includes.includes("supergroup")) {
        if (
            !ctx.getChatMember(target_user_id as number) &&
            target_user_status !== "left"
        ) {
            ctx.reply("The user must be in a supergroup!");
            console.log(
                `[ERROR] User with ID ${target_user_id} is not in the supergroup!`
            );
            return false;
        }
    }

    const admins = await ctx.getChatAdministrators();

    if (includes.includes("admin") && !includes.includes("noreply_admin")) {
        if (admins.some((admin) => admin.user.id === reply_to?.from?.id)) {
            ctx.reply("You can't use it on admin!");
            console.log(
                `[ERROR] User with ID ${user.id} tried to use it on admin!`
            );
            return false;
        }
    }

    if (includes.includes("admin")) {
        if (!admins.some((admin) => admin.user.id === user.id)) {
            ctx.reply("You must be an admin!");
            console.log(`[ERROR] User with ID ${user.id} is not an admin!`);
            return false;
        }
    }

    if (includes.includes("admin")) {
        if (!admins.some((admin) => admin.user.id === ctx.botInfo?.id)) {
            ctx.reply("I must be an admin!");
            console.log(`[ERROR] Bot is not an admin!`);
            return false;
        }
    }

    return true;
}
