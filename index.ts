import { bot } from "./config";
import { startCommand, versionCommand, pingCommand, helpCommand } from "./modules/generic";
import { banCommand, unbanCommand } from "./modules/admin/ban";
import { kickCommand } from "./modules/admin/kick";
import { muteCommand, unmuteCommand } from "./modules/admin/mute";
import { warnCommand, unwarnCommand, warnsCommand } from "./modules/admin/warn";

bot.command(startCommand.command, startCommand.function);
bot.command(versionCommand.command, versionCommand.function);
bot.command(pingCommand.command, pingCommand.function);
bot.command(helpCommand.command, helpCommand.function);

bot.command(banCommand.command, banCommand.function);
bot.command(unbanCommand.command, unbanCommand.function);

bot.command(kickCommand.command, kickCommand.function);
bot.command(muteCommand.command, muteCommand.function);
bot.command(unmuteCommand.command, unmuteCommand.function);

bot.command(warnCommand.command, warnCommand.function);
bot.command(unwarnCommand.command, unwarnCommand.function);
bot.command(warnsCommand.command, warnsCommand.function);

bot.launch();

console.log("[STARTED] Realm Guard is now online!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
