import { Command, GreetItem, ValidateOptions } from "../../types/type";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import { Context } from "telegraf";
import { User } from "telegraf/typings/core/types/typegram";
import { getStorageDir } from "../generic";
import { validateRequest } from "../validation";

const rules = [
        "user_is_admin",
        "query",
] satisfies ValidateOptions[];

const storage_dir = getStorageDir();

export const setWelcomeCommand: Command = {
    command: "setwelcome",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        if ((await validateRequest(ctx, rules)) === false)
            return;

        // Set welcome message
        if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const welcomeMessage = args.slice(1).join(" ");
            const greets: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/${ctx.chat.id}.json`,
                    "utf-8"
                )
            );

            // directly modify the JSON file
            let greetsProcess: GreetItem = {
                welcome: welcomeMessage,
                farewell: greets.farewell,
            };

            // write the JSON file
            await fs.writeFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                JSON.stringify(greetsProcess, null, 2)
            );
            console.log("[INFO] Welcome message set!");
            await ctx.replyWithHTML(
                `Welcome message set to:\n<code>${welcomeMessage}</code>`
            );
        }
    },
};

export const getWelcomeCommand: Command = {
    command: "getwelcome",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        const greets: GreetItem = JSON.parse(
            await fs.readFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                "utf-8"
            )
        );
        const greetsDefault: GreetItem = JSON.parse(
            await fs.readFile(storage_dir + `groups/default.json`, "utf-8")
        );
        const welcomeMessage = greets;
        if (!welcomeMessage) {
            await ctx.reply(
                `No welcome message set! Using the default template:\n<code>${greetsDefault.welcome}</code>`
            );
            console.log(
                "[INFO] No welcome message set! Default template used."
            );
            return;
        }
        await ctx.replyWithHTML(
            `Welcome message:\n<code>${welcomeMessage}</code>`
        );
        console.log("[INFO] Welcome message sent!");
    },
};

export const setFarewellCommand: Command = {
    command: "setfarewell",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        if ((await validateRequest(ctx, rules)) === false)
            return;
        // Set farewell message
        else if (ctx.message.text) {
            const args = ctx.message.text.split(" ");
            const farewellMessage = args.slice(1).join(" ");
            const greets: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/${ctx.chat.id}.json`,
                    "utf-8"
                )
            );
            const greetsDefault: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/default.json`,
                    "utf-8"
                )
            );

            // directly modify the JSON file
            let greetsProcess: GreetItem = {
                welcome: greets?.welcome || greetsDefault.welcome,
                farewell: farewellMessage,
            };

            // write the JSON file
            await fs.writeFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                JSON.stringify(greetsProcess, null, 2)
            );
            console.log(`[INFO] Farewell message set for chat ${ctx.chat.id}`);
            await ctx.replyWithHTML(
                `Farewell message set to:\n<code>${farewellMessage}</code>`
            );
        }
    },
};

export const getFarewellCommand: Command = {
    command: "getfarewell",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        const greets: GreetItem = JSON.parse(
            await fs.readFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                "utf-8"
            )
        );
        const greetsDefault: GreetItem = JSON.parse(
            await fs.readFile(storage_dir + `groups/default.json`, "utf-8")
        );
        const farewellMessage = greets;
        if (!farewellMessage) {
            await ctx.reply(
                `No farewell message set! Using the default template:\n<code>${greetsDefault.farewell}</code>`
            );
            console.log(
                "[INFO] No farewell message set! Default template used."
            );
            return;
        }
        await ctx.replyWithHTML(
            `Farewell message:\n<code>${farewellMessage}</code>`
        );
        console.log("[INFO] Farewell message sent!");
    },
};

export const resetWelcomeCommand: Command = {
    command: "resetwelcome",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        if ((await validateRequest(ctx, rules)) === false)
            return;
        // Reset welcome message
        else {
            const greets: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/${ctx.chat.id}.json`,
                    "utf-8"
                )
            );
            const greetsDefault: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/default.json`,
                    "utf-8"
                )
            );

            // directly modify the JSON file
            let greetsProcess: GreetItem = {
                welcome: greetsDefault.welcome,
                farewell: greets?.farewell || greetsDefault.farewell,
            };

            // write the JSON file
            await fs.writeFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                JSON.stringify(greetsProcess, null, 2)
            );
            console.log(`[INFO] Welcome message reset for chat ${ctx.chat.id}`);
            await ctx.reply("Welcome message reset!");
        }
    },
};

export const resetFarewellCommand: Command = {
    command: "resetfarewell",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        if ((await validateRequest(ctx, rules)) === false)
            return;
        // Reset farewell message
        else {
            const greets: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/${ctx.chat.id}.json`,
                    "utf-8"
                )
            );
            const greetsDefault: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/default.json`,
                    "utf-8"
                )
            );

            // directly modify the JSON file
            let greetsProcess: GreetItem = {
                welcome: greets?.welcome || greetsDefault.welcome,
                farewell: greetsDefault.farewell,
            };

            // write the JSON file
            await fs.writeFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                JSON.stringify(greetsProcess, null, 2)
            );
            console.log(
                `[INFO] Farewell message reset for chat ${ctx.chat.id}`
            );
            await ctx.reply("Farewell message reset!");
        }
    },
};

export const resetGreetsCommand: Command = {
    command: "resetgreets",
    function: async (ctx) => {
        if (
            !fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)
        ) {
            await fs.mkdir(storage_dir + `groups/`, {
                recursive: true,
            });
            await fs.copyFile(
                storage_dir + `groups/default.json`,
                storage_dir + `groups/${ctx.chat.id}.json`
            );
        }

        if ((await validateRequest(ctx, rules)) === false)
            return;

        // Reset welcome and farewell messages
        else {
            const greetsDefault: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/default.json`,
                    "utf-8"
                )
            );

            // directly modify the JSON file
            let greetsProcess: GreetItem = {
                welcome: greetsDefault.welcome,
                farewell: greetsDefault.farewell,
            };

            // write the JSON file
            await fs.writeFile(
                storage_dir + `groups/${ctx.chat.id}.json`,
                JSON.stringify(greetsProcess, null, 2)
            );
            console.log(
                `[INFO] Welcome and farewell messages reset for chat ${ctx.chat.id}`
            );
            await ctx.reply("Welcome and farewell messages reset!");
        }
    },
};

export const dropWelcomeAndFarewell = (ctx: Context<any>) => {
    if (!fsSync.existsSync(storage_dir + `groups/${ctx.chat.id}.json`)) {
        fsSync.copyFileSync(
            storage_dir + `groups/default.json`,
            storage_dir + `groups/${ctx.chat.id}.json`,
            fsSync.constants.COPYFILE_EXCL
        );
    }

    if (fsSync.existsSync(
        storage_dir + `ban_silent/${ctx.chat.id}.temp`,
    )) return false;

    if (ctx.message?.new_chat_members) {
        ctx.message.new_chat_members.forEach(async (user: User) => {
            if (user.is_bot) return false;
            const greets: GreetItem = JSON.parse(
                await fs.readFile(
                    storage_dir + `groups/${ctx.chat.id}.json`,
                    "utf-8"
                )
            );
            const greet = greets;
            await ctx.reply(
                greet.welcome
                    .replace("{{user_name}}", user.first_name)
                    .replace("{{user_id}}", user.id.toString())
                    .replace(
                        "{{group_name}}",
                        ctx.chat.title || ctx.chat.first_name
                    )
                    .replace("{{group_id}}", ctx.chat.id.toString())
            );
        });
    } else if (ctx.message?.left_chat_member) {
        const user = ctx.message.left_chat_member;
        if (user.is_bot) return false;
        const greets: GreetItem = JSON.parse(
            fsSync.readFileSync(
                storage_dir + `groups/${ctx.chat.id}.json`,
                "utf-8"
            )
        );
        ctx.reply(
            greets.farewell
                .replace("{{user_name}}", user.first_name)
                .replace("{{user_id}}", user.id.toString())
                .replace(
                    "{{group_name}}",
                    ctx.chat.title || ctx.chat.first_name
                )
                .replace("{{group_id}}", ctx.chat.id.toString())
        );
    }
    return true;
};
