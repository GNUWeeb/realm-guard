import { Command } from "../../types/type";

export const muteCommand: Command = {
  command: "mute",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();

    // Check if the bot is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.botInfo.id)) {
      await ctx.reply("I'm sorry, but I'm not an admin.");
      console.log("[ERROR] Bot is not an admin!");
      return;
    }

    // Check if user is an admin
    else if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Check if the user is trying to mute an admin
    if (
      adminList.some(
        (admin) => admin.user.id === ctx.message.reply_to_message?.from?.id
      )
    ) {
      await ctx.reply(
        "I'm sorry, but you can't mute an admin/owner of this group."
      );
      console.log("[ERROR] User is an admin!");
      return;
    }

    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply(
        "Please reply to a message or type the user ID to mute a user!"
      );
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }

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
      if (!user) {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
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
      await ctx.reply(`User ${user.user.first_name} (${user.user.id}) muted!`);
    }
  },
};

export const unmuteCommand: Command = {
  command: "unmute",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();

    // Check if the bot is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.botInfo.id)) {
      await ctx.reply("I'm sorry, but I'm not an admin.");
      console.log("[ERROR] Bot is not an admin!");
      return;
    }

    // Check if user is an admin
    else if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Check if the user is trying to unmute an admin
    if (
      adminList.some(
        (admin) => admin.user.id === ctx.message.reply_to_message?.from?.id
      )
    ) {
      await ctx.reply(
        "I'm sorry, but you can't unmute an admin/owner of this group."
      );
      console.log("[ERROR] User is an admin!");
      return;
    }

    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
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
      if (!user) {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
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

function timeToSecond(time: string) {
  if (time.endsWith("s")) {
    return Number(time.slice(0, -1));
  } else if (time.endsWith("m")) {
    return Number(time.slice(0, -1)) * 60;
  } else if (time.endsWith("h")) {
    return Number(time.slice(0, -1)) * 60 * 60;
  } else if (time.endsWith("d")) {
    return Number(time.slice(0, -1)) * 60 * 60 * 24;
  } else if (time.endsWith("w")) {
    return Number(time.slice(0, -1)) * 60 * 60 * 24 * 7;
  } else if (time.endsWith("mo")) {
    return Number(time.slice(0, -2)) * 60 * 60 * 24 * 30;
  } else if (time.endsWith("y")) {
    return Number(time.slice(0, -1)) * 60 * 60 * 24 * 365;
  } else {
    return 0;
  }
}

export const timedMuteCommand: Command = {
  command: "tmute",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();

    // Check if the bot is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.botInfo.id)) {
      await ctx.reply("I'm sorry, but I'm not an admin.");
      console.log("[ERROR] Bot is not an admin!");
      return;
    }

    // Check if user is an admin
    else if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Check if the user is trying to mute an admin
    if (
      adminList.some(
        (admin) => admin.user.id === ctx.message.reply_to_message?.from?.id
      )
    ) {
      await ctx.reply(
        "I'm sorry, but you can't mute an admin/owner of this group."
      );
      console.log("[ERROR] User is an admin!");
      return;
    }

    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply(
        "Please reply to a message or type the user ID to mute a user!"
      );
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }

    // Check if no valid time
    else if (!ctx.message.text.split(" ")[1]) {
      await ctx.reply("Please enter a valid time!");
      console.log("[ERROR] No valid time!");
      return;
    }

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
      if (!user) {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
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
