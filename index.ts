import { bot } from "./config";
import { startCommand, versionCommand, pingCommand, helpCommand } from "./modules/generic";
import { banCommand, unbanCommand } from "./modules/admin/ban";
import { kickCommand } from "./modules/admin/kick";
import { muteCommand, unmuteCommand } from "./modules/admin/mute";
import { warnCommand, unwarnCommand, warnsCommand } from "./modules/admin/warn";
import { commands } from "./modules/mod";
import { dropWelcomeAndFarewell } from "./modules/admin/mod";

commands.forEach((command) => {
  bot.command(command.command!, command.function);
});

// for group greetings
bot.drop(dropWelcomeAndFarewell);

bot.command(warnCommand.command, warnCommand.function);
bot.command(unwarnCommand.command, unwarnCommand.function);
bot.command(warnsCommand.command, warnsCommand.function);

bot.launch();

console.log("[STARTED] Realm Guard is now online!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
