import { Command } from "../../types/type";

export const kickCommand: Command = {
  command: "kick",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if the bot is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.botInfo.id)) {
      await ctx.reply("I'm sorry, but I'm not an admin.");
      console.log("[ERROR] Bot is not an admin!");
      return;
    }
  
    // Check if no valid reply or user ID
    else if (!ctx.message.reply_to_message && !ctx.message.text.split(" ")[1]) {
      await ctx.reply("Please reply to a message or type the user ID to kick a user!");
      console.log("[ERROR] No valid reply or user ID!");
      return;
    }
  
    // Check if user is an admin
    else if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Check if user is trying to kick an admin
    if (adminList.some((admin) => admin.user.id === ctx.message.reply_to_message?.from?.id)) {
      await ctx.reply("I'm sorry, but you can't kick an admin/owner of this group.");
      console.log("[ERROR] User is an admin!");
      return;
    } 
  
    // Kick user by reply
    else if (ctx.message.reply_to_message) {
      await ctx.telegram.unbanChatMember(ctx.chat.id, ctx.message.reply_to_message.from?.id!);
      console.log(`[KICK] ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id})`);
      await ctx.reply(`User ${ctx.message.reply_to_message.from?.first_name} (${ctx.message.reply_to_message.from?.id}) kicked!`);
    }
  
    // Kick user by ID
    else if (ctx.message.text) {
      const args = ctx.message.text.split(" ");
      const user = await ctx.telegram.getChatMember(ctx.chat.id, Number(args[1]));
      if (!user) {
        await ctx.reply("Uhh, I don't recognize them since they're not here?");
        console.log("[ERROR] User is not in the chat!");
        return;
      }
      await ctx.telegram.unbanChatMember(ctx.chat.id, user.user.id);
      console.log(`[KICK] ${user.user.first_name} (${user.user.id})`);
      await ctx.reply(`User ${user.user.first_name} (${user.user.id}) kicked!`);
    }
  
    // Other cases
    else {
      console.log("[ERROR] No valid reply or user ID!");
      await ctx.reply("Please reply to a message or type the user ID to kick a user!");
      return;
    }
  },
}