import { Command } from "../../types/type";

// `/ban` command
export const banCommand: Command = {
  command: "ban",
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

    // Check if the user is trying to ban an admin
    else if (
      adminList.some(
        (admin) => admin.user.id === ctx.message.reply_to_message?.from?.id
      )
    ) {
      await ctx.reply(
        "I'm sorry, but you can't ban an admin/owner of this group."
      );
      console.log("[ERROR] User is an admin!");
      return;
    }

    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply(
        "Please reply to a message or type the user ID to ban a user!"
      );
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }

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
      if (!user) {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
        return;
      }
      await ctx.telegram.banChatMember(ctx.chat.id, user.user.id);
      console.log(`[BAN] ${user.user.first_name} (${user.user.id})`);
      await ctx.reply(`User ${user.user.first_name} (${user.user.id}) banned!`);
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

    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply(
        "Please reply to a message or type the user ID to unban a user!"
      );
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }

    // Check if user trying to unban by username since you simply can't
    else if (
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
      if (!user || user.status === "left") {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
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
