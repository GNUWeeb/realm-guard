import { Command, Greets } from "../../types/type";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import { Context } from "telegraf";
import { User } from "telegraf/typings/core/types/typegram";

export const setWelcomeCommand: Command = {
  command: "setwelcome",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if user is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Set welcome message
    else if (ctx.message.text) {
      const args = ctx.message.text.split(" ");
      const welcomeMessage = args.slice(1).join(" ");
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));

      // directly modify the JSON file
      let greetsProcess: Greets = {
        ...greets,
        [ctx.chat.id]: {
          welcome: welcomeMessage,
          farewell: greets[ctx.chat.id]?.farewell || greets.default.farewell
        }
      }

      // write the JSON file
      await fs.writeFile("./dist/data/greets.json", JSON.stringify(greetsProcess, null, 2));
      console.log("[INFO] Welcome message set!");
      await ctx.replyWithHTML(`Welcome message set to:\n<code>${welcomeMessage}</code>`);
    }
  }
}

export const getWelcomeCommand: Command = {
  command: "getwelcome",
  function: async (ctx) => {
    const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));
    const welcomeMessage = greets[ctx.chat.id];
    if (!welcomeMessage) {
      await ctx.reply(`No welcome message set! Using the default template:\n<code>${greets.default.welcome}</code>`);
      console.log("[INFO] No welcome message set! Default template used.");
      return;
    }
    await ctx.replyWithHTML(`Welcome message:\n<code>${welcomeMessage}</code>`);
    console.log("[INFO] Welcome message sent!");
  }
}

export const setFarewellCommand: Command = {
  command: "setfarewell",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if user is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Set farewell message
    else if (ctx.message.text) {
      const args = ctx.message.text.split(" ");
      const farewellMessage = args.slice(1).join(" ");
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));

      // directly modify the JSON file
      let greetsProcess: Greets = {
        ...greets,
        [ctx.chat.id]: {
          welcome: greets[ctx.chat.id]?.welcome || greets.default.welcome,
          farewell: farewellMessage
        }
      }

      // write the JSON file
      await fs.writeFile("./dist/data/greets.json", JSON.stringify(greetsProcess, null, 2));
      console.log(`[INFO] Farewell message set for chat ${ctx.chat.id}`);
      await ctx.replyWithHTML(`Farewell message set to:\n<code>${farewellMessage}</code>`);
    }
  }
}

export const getFarewellCommand: Command = {
  command: "getfarewell",
  function: async (ctx) => {
    const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));
    const farewellMessage = greets[ctx.chat.id];
    if (!farewellMessage) {
      await ctx.reply(`No farewell message set! Using the default template:\n<code>${greets.default.farewell}</code>`);
      console.log("[INFO] No farewell message set! Default template used.");
      return;
    }
    await ctx.replyWithHTML(`Farewell message:\n<code>${farewellMessage}</code>`);
    console.log("[INFO] Farewell message sent!");
  }
}

export const resetWelcomeCommand: Command = {
  command: "resetwelcome",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if user is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Reset welcome message
    else {
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));

      // directly modify the JSON file
      let greetsProcess: Greets = {
        ...greets,
        [ctx.chat.id]: {
          welcome: greets.default.welcome,
          farewell: greets[ctx.chat.id]?.farewell || greets.default.farewell
        }
      }

      // write the JSON file
      await fs.writeFile("./dist/data/greets.json", JSON.stringify(greetsProcess, null, 2));
      console.log(`[INFO] Welcome message reset for chat ${ctx.chat.id}`);
      await ctx.reply("Welcome message reset!");
    }
  }
}

export const resetFarewellCommand: Command = {
  command: "resetfarewell",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if user is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Reset farewell message
    else {
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));

      // directly modify the JSON file
      let greetsProcess: Greets = {
        ...greets,
        [ctx.chat.id]: {
          welcome: greets[ctx.chat.id]?.welcome || greets.default.welcome,
          farewell: greets.default.farewell
        }
      }

      // write the JSON file
      await fs.writeFile("./dist/data/greets.json", JSON.stringify(greetsProcess, null, 2));
      console.log(`[INFO] Farewell message reset for chat ${ctx.chat.id}`);
      await ctx.reply("Farewell message reset!");
    }
  }
}

export const resetGreetsCommand: Command = {
  command: "resetgreets",
  function: async (ctx) => {
    const adminList = await ctx.getChatAdministrators();
  
    // Check if user is an admin
    if (!adminList.some((admin) => admin.user.id === ctx.from?.id)) {
      await ctx.reply("I'm sorry, but you are not an admin.");
      console.log("[ERROR] User is not an admin!");
      return;
    }

    // Reset welcome and farewell messages
    else {
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));

      // directly modify the JSON file
      let greetsProcess: Greets = {
        ...greets,
        [ctx.chat.id]: {
          welcome: greets.default.welcome,
          farewell: greets.default.farewell
        }
      }

      // write the JSON file
      await fs.writeFile("./dist/data/greets.json", JSON.stringify(greetsProcess, null, 2));
      console.log(`[INFO] Welcome and farewell messages reset for chat ${ctx.chat.id}`);
      await ctx.reply("Welcome and farewell messages reset!");
    }
  }
}

export const dropWelcomeAndFarewell = (ctx: Context<any>) => {
  if (ctx.message?.new_chat_members) {
    ctx.message.new_chat_members.forEach(async (user: User) => {
      if (user.is_bot) return false;
      const greets: Greets = JSON.parse(await fs.readFile("./dist/data/greets.json", "utf-8"));
      const greet = greets[ctx.chat.id] || greets.default;
      await ctx.reply(greet.welcome
        .replace("{{user_name}}", user.first_name)
        .replace("{{user_id}}", user.id.toString())
        .replace("{{group_name}}", ctx.chat.title || ctx.chat.first_name)
        .replace("{{group_id}}", ctx.chat.id.toString()));
    });
  } else if (ctx.message?.left_chat_member) {
    const user = ctx.message.left_chat_member;
    if (user.is_bot) return false;
    const greets: Greets = JSON.parse(fsSync.readFileSync("./dist/data/greets.json", "utf-8"));
    const greet = greets[ctx.chat.id] || greets.default;
    ctx.reply(greet.farewell
      .replace("{{user_name}}", user.first_name)
      .replace("{{user_id}}", user.id.toString())
      .replace("{{group_name}}", ctx.chat.title || ctx.chat.first_name)
      .replace("{{group_id}}", ctx.chat.id.toString()));
  }
  return true;
}
