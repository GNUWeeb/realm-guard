import { bot } from "./config";
import { commands } from "./modules/mod";
import { dropWelcomeAndFarewell } from "./modules/admin/mod";
import { createDefaults } from "./defaults";

createDefaults();

commands.forEach((command) => {
        bot.command(command.command!, command.function);
});

bot.drop(dropWelcomeAndFarewell);

bot.launch();

console.log("[STARTED] Realm Guard is now online!");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
