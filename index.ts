import { bot } from "./config";
import { startCommand, versionCommand, pingCommand, helpCommand } from "./modules/generic";
import { banCommand, unbanCommand } from "./modules/admin/ban";

bot.command(startCommand.command, startCommand.function);
bot.command(versionCommand.command, versionCommand.function);
bot.command(pingCommand.command, pingCommand.function);
bot.command(helpCommand.command, helpCommand.function);

bot.command(banCommand.command, banCommand.function);
bot.command(unbanCommand.command, unbanCommand.function);

bot.launch();

console.log("[STARTED] Realm Guard is now online!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));