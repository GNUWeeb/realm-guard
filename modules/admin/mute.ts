import { Command } from "../../types/type";
import { timeToSecond } from "../generic";
import { validateRequest } from "../validation";

export const muteCommand: Command = {
    command: "mute",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;
        // Mute user by reply
        else if (ctx.message.reply_to_message) {
            await ctx.telegram.restrictChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!,
                {
                    permissions: {
                        can_send_messages: false,
                        can_send_media_messages: false,
                        can_send_polls: false,
                        can_send_other_messages: false,
                    },
                }
            );
            console.log(
                `[MUTE] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) muted!`
            );
        }

        // Mute user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }
            await ctx.telegram.restrictChatMember(ctx.chat.id, user.user.id, {
                permissions: {
                    can_send_messages: false,
                    can_send_media_messages: false,
                    can_send_polls: false,
                    can_send_other_messages: false,
                },
            });
            console.log(`[MUTE] ${user.user.first_name} (${user.user.id})`);
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) muted!`
            );
        }
    },
};

export const unmuteCommand: Command = {
    command: "unmute",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;
        // Check if no valid reply or user ID
        else if (
            !ctx.message.reply_to_message &&
            !ctx.message.text.split(" ")[1]
        ) {
            await ctx.reply(
                "Please reply to a message or type the user ID to unmute a user!"
            );
            console.log("[ERROR] No valid reply or user ID!");
            return;
        }

        // Unmute user by reply
        else if (ctx.message.reply_to_message) {
            await ctx.telegram.restrictChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!,
                {
                    permissions: {
                        can_send_messages: true,
                        can_send_media_messages: true,
                        can_send_polls: true,
                        can_send_other_messages: true,
                    },
                }
            );
            console.log(
                `[UNMUTE] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) unmuted!`
            );
        }

        // Unmute user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }
            await ctx.telegram.restrictChatMember(ctx.chat.id, user.user.id, {
                permissions: {
                    can_send_messages: true,
                    can_send_media_messages: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                },
            });
            console.log(`[UNMUTE] ${user.user.first_name} (${user.user.id})`);
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) unmuted!`
            );
        }
    },
};


export const timedMuteCommand: Command = {
    command: "tmute",
    function: async (ctx) => {
        if ((await validateRequest(ctx, ["reply", "query", "admin"])) === false)
            return;
        // Mute user by reply
        else if (ctx.message.reply_to_message) {
            const args = ctx.message.text.split(" ");

            const time = timeToSecond(args[1]);

            await ctx.telegram.restrictChatMember(
                ctx.chat.id,
                ctx.message.reply_to_message.from?.id!,
                {
                    permissions: {
                        can_send_messages: false,
                        can_send_media_messages: false,
                        can_send_polls: false,
                        can_send_other_messages: false,
                    },
                    until_date: Math.floor(Date.now() / 1000) + time,
                }
            );
            console.log(
                `[MUTE] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`
            );
            await ctx.reply(
                `User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) muted!`
            );
        }

        // Mute user by ID
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const user = await ctx.telegram.getChatMember(
                ctx.chat.id,
                Number(args[1])
            );
            if ((await validateRequest(ctx, ["supergroup"])) === false) {
                return;
            }

            const time = timeToSecond(args[2]);

            await ctx.telegram.restrictChatMember(ctx.chat.id, user.user.id, {
                permissions: {
                    can_send_messages: false,
                    can_send_media_messages: false,
                    can_send_polls: false,
                    can_send_other_messages: false,
                },
                until_date: Math.floor(Date.now() / 1000) + time,
            });
            console.log(`[MUTE] ${user.user.first_name} (${user.user.id})`);
            await ctx.reply(
                `User ${user.user.first_name} (${user.user.id}) muted!`
            );
        }
    },
};
