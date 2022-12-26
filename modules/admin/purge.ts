import { Command } from "../../types/type";

export const purgeCommand: Command = {
  command: "purge",
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

    // Check if no valid reply
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply(
        "Please reply to a message to commit the purge!"
      );
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }

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
  }
};
