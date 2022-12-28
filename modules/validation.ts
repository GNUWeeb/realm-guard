import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { ValidateOptions } from "../types/type";


/*
 * State resolver functions.
 */
async function resolve_t_user_status(ctx: any, state: any)
{
        if (state.reply_uinfo !== null)
                return;

        const reply_to = ctx.message?.reply_to_message;
        if (!reply_to)
                return;

        const t_user_id = reply_to?.from?.id;
        const x = await ctx.getChatMember(t_user_id as number);
        state.reply_u_chat_info = x;
}

async function resolve_t_admin_list(ctx: any, state: any)
{
        if (state.admin_list !== null)
                return;

        state.admin_list = await ctx.getChatAdministrators();
}


/*
 * Rule functions.
 */
async function r_user_is_admin(ctx: any, state: any)
{
        await resolve_t_admin_list(ctx, state);
        const admins = state.admin_list;
        const user = ctx.message.from;

        if (admins.some((admin: any) => admin.user.id === user.id))
                return true;

        ctx.reply("You must be an admin!");
        console.log(`[ERROR] User with ID ${user.id} is not an admin!`);
        return false;
}

async function r_bot_is_admin(ctx: any, state: any)
{
        await resolve_t_admin_list(ctx, state);
        const admins = state.admin_list;
        const user = ctx.message.from;

        if (admins.some((admin: any) => admin.user.id === ctx.botInfo?.id))
                return true;

        ctx.reply("I must be an admin!");
        console.log(`[ERROR] Bot is not an admin!`);
        return false;
}

async function r_noreply_admin(ctx: any, state: any)
{
        await resolve_t_admin_list(ctx, state);
        const admins = state.admin_list;
        const user = ctx.message.from;
        const reply_to = ctx.message?.reply_to_message;

        if (!admins.some((admin: any) => admin.user.id === reply_to?.from?.id))
                return true;

        ctx.reply("You can't use this command against an admin!");
        console.log(`[ERROR] User with ID ${user.id} tried to use it on admin!`);
        return false;
}

async function r_reply(ctx: any)
{
        if (ctx.message?.reply_to_message)
                return true;

        ctx.reply("You must reply to a message!");

        const user = ctx.message.from;
        console.log(`[ERROR] User with ID ${user.id} didn't reply to a message!`);
        return false;
}

async function r_query(ctx: any)
{
        if (ctx.message.text.split(" ")[1])
                return true;

        ctx.reply("You must provide a query!");

        const user = ctx.message.from;
        console.log(`[ERROR] User with ID ${user.id} didn't provide a query!`);
        return false;
}

async function r_replied_user_in_group(ctx: any, state: any)
{
        await resolve_t_user_status(ctx, state);
        const uinfo = state.reply_u_chat_info;

        if (uinfo && uinfo.status !== "left")
                return true;

        ctx.reply("The replied user must be in the group!");

        const t_user_id = ctx.message?.reply_to_message?.from?.id;
        console.log(`[ERROR] User with ID ${t_user_id} is not in the supergroup!`);
        return false;
}

async function r_in_supergroup(ctx: any)
{
        if (ctx.message?.chat?.type === "supergroup")
                return true;

        ctx.reply("This command must be used in a supergroup!");
        return false;
}

async function invoke_rule(rule: string, ctx: any, state: any)
{
        switch (rule) {
        case "user_is_admin":
                return r_user_is_admin(ctx, state);
        case "bot_is_admin":
                return r_bot_is_admin(ctx, state);
        case "noreply_admin":
                return r_noreply_admin(ctx, state);
        case "reply":
                return r_reply(ctx);
        case "query":
                return r_query(ctx);
        case "replied_user_in_group":
                return r_replied_user_in_group(ctx, state);
        case "in_supergroup":
                return r_in_supergroup(ctx);
        default:
                throw new Error(`Invalid rule "${rule}"`);
        }
}

export async function validateRequest(
    ctx: NarrowedContext<
        Context<Update>,
        {
            message: Update.New & Update.NonChannel & Message.TextMessage;
            update_id: number;
        }
    >,
    rules: ValidateOptions[]
): Promise<boolean> {

        /*
         * @cache_state is to avoid multiple network requests.
         *
         * For example:
         * @ctx.getChatAdministrators() doesn't have to be called
         * more than once if multiple rules need the admin list.
         *
         * Currently, used fields are:
         *
         *    - admin_list         (cacheof getChatAdministrator())
         *    - reply_u_chat_info  (cacheof getChatMember(reply_to.from))
         *
         *
         * TODO(irvanmalik48): Annotate this with typescript stuff.
         *                     If not needed, delete this TODO comment.
         */
        let cache_state = {
                admin_list: null,
                reply_u_chat_info: null,
        };
        let i;

        for (i = 0; i < rules.length; i++) {
                /*
                 * TODO(Viro_SSFS): Allow callable type for rules[i].
                 */
                if (!(await invoke_rule(rules[i], ctx, cache_state)))
                        return false;
        }

        return true;
}
