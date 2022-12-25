import * as fs from "fs";
import { replyToMsgId, getStorageDir } from "../generic";

const U_MUST_REPLY = 1 << 0;
const U_MUST_BE_IN_SUPERGROUP = 1 << 1;
const U_MUST_BE_AN_ADMIN = 1 << 2;
const U_CANT_REPLY_TO_ADMIN = 1 << 3;

/*
 * TODO(Viro_SSFS): Allow group admins the specify the max number of
 *                  warnings before the user gets banned.
 */
const NR_MAX_WARNS = 3;

/*
 * TODO(Viro_SSFS): Implement file locking for concurrent user_file
 *                  read/write.
 */
function get_user_warns_count(user_id: number, group_id: number) {
  let users_dir = getStorageDir() + "/users";
  let user_file = users_dir + "/" + user_id + ".json";
  let user_info;

  if (!fs.existsSync(users_dir)) {
    /*
     * Make sure the user directory exists.
     */
    fs.mkdirSync(users_dir);
  }

  if (!fs.existsSync(user_file)) {
    /*
     * This user is never warned.
     */
    user_info = { warns_count: { [group_id]: 0 } };
    user_info.warns_count[group_id] = 0;
    fs.writeFileSync(user_file, JSON.stringify(user_info));
    return 0;
  }

  user_info = JSON.parse(fs.readFileSync(user_file).toString());
  if ("warns_count" in user_info) {
    if (group_id in user_info.warns_count)
      return user_info.warns_count[group_id];
  }
  return 0;
}

function add_user_warn(user_id: number, group_id: number, nr_warn: number) {
  let users_dir = getStorageDir() + "/users";
  let user_file = users_dir + "/" + user_id + ".json";
  let warns_count = 0;
  let user_info;

  if (!fs.existsSync(users_dir)) {
    /*
     * Make sure the user directory exists.
     */
    fs.mkdirSync(users_dir);
  }

  if (!fs.existsSync(user_file)) {
    /*
     * First time get a warn.
     */
    user_info = { warns_count: { [group_id]: 0 } };
    user_info.warns_count[group_id] = nr_warn;
    fs.writeFileSync(user_file, JSON.stringify(user_info));
    return nr_warn;
  }

  user_info = JSON.parse(fs.readFileSync(user_file).toString());
  if ("warns_count" in user_info) {
    if (group_id in user_info.warns_count)
      warns_count = user_info.warns_count[group_id] + nr_warn;
    else warns_count = nr_warn;
  }

  /*
   * Don't be negative.
   */
  if (warns_count < 0) warns_count = 0;

  user_info.warns_count[group_id] = warns_count;
  fs.writeFileSync(user_file, JSON.stringify(user_info));
  return warns_count;
}

async function validate_request(ctx: any, bitmask: number) {
  const update = ctx.update;
  const msg_id = update.message.message_id;
  const message = update.message;

  if (
    bitmask & U_MUST_BE_IN_SUPERGROUP &&
    message?.chat?.type !== "supergroup"
  ) {
    await replyToMsgId(
      ctx,
      "This command can only be executed in a supergroup!",
      msg_id
    );
    return false;
  }

  if (bitmask & U_MUST_REPLY && !message?.reply_to_message) {
    await replyToMsgId(
      ctx,
      "You need to reply to a message to use this command.",
      msg_id
    );
    return false;
  }

  const admin_list = await ctx.getChatAdministrators();

  if (
    bitmask & U_MUST_BE_AN_ADMIN &&
    !admin_list.some((admin: any) => admin.user.id === ctx.from?.id)
  ) {
    await replyToMsgId(ctx, "You are not an admin!", msg_id);
    return false;
  }

  if (
    bitmask & U_CANT_REPLY_TO_ADMIN &&
    admin_list.some(
      (admin: any) => admin.user.id === message.reply_to_message?.from?.id
    )
  ) {
    await replyToMsgId(
      ctx,
      "You can't warn an admin/owner of this group.",
      msg_id
    );
    return false;
  }

  return true;
}

function construct_name(from: any) {
  let name = `${from?.first_name}`;

  if ("last_name" in from) name += ` ${from.last_name}`;

  if ("username" in from) name += ` (@${from.username})`;

  return name;
}

async function do_ban(ctx: any, user_id: number) {
  try {
    await ctx.banChatMember(user_id);
    return "";
  } catch (e: any) {
    console.log(e);
    return JSON.stringify(e.response);
  }
}

/*
 * TODO(Viro_SSFS): Allow user to {un,}warn user by @username or user id.
 *
 * For ex: /warn @Viro_SSFS
 *         /warn 123456780
 *         /unwarn @Viro_SSFS
 *         /unwarn 123456780
 */
async function warn_command(ctx: any) {
  const mask =
    U_MUST_REPLY |
    U_MUST_BE_IN_SUPERGROUP |
    U_MUST_BE_AN_ADMIN |
    U_CANT_REPLY_TO_ADMIN;

  const update = ctx.update;
  const msg_id = update.message.message_id;
  const reply_to = update.message.reply_to_message;
  const message = update.message;
  let warns_count;
  let name;
  let rmsg;

  if (!(await validate_request(ctx, mask))) return;

  warns_count = add_user_warn(reply_to.from.id, message.chat.id, 1);
  name = construct_name(reply_to.from);

  if (warns_count >= NR_MAX_WARNS) {
    rmsg = `${name} has been banned (reached the max num of warns)!`;

    let err = await do_ban(ctx, reply_to.from.id);
    if (err !== "") rmsg += `\n\nError: ${err}`;
  } else {
    rmsg = `${name} has been warned!`;
  }

  rmsg += `\n\nNumber of warnings: ${warns_count}`;

  await replyToMsgId(ctx, rmsg, reply_to.message_id);
}

async function unwarn_command(ctx: any) {
  const mask =
    U_MUST_REPLY |
    U_MUST_BE_IN_SUPERGROUP |
    U_MUST_BE_AN_ADMIN |
    U_CANT_REPLY_TO_ADMIN;

  const update = ctx.update;
  const msg_id = update.message.message_id;
  const reply_to = update.message.reply_to_message;
  const message = update.message;
  let warns_count;
  let name;
  let rmsg;

  if (!(await validate_request(ctx, mask))) return;

  warns_count = add_user_warn(reply_to.from.id, message.chat.id, -1);
  name = construct_name(reply_to.from);
  rmsg =
    `${name} has been unwarned!` + `\n\nNumber of warnings: ${warns_count}`;
  await replyToMsgId(ctx, rmsg, reply_to.message_id);
}

/*
 * Show the number of warnings. Can be used by everyone.
 */
async function warns_command(ctx: any) {
  const mask = U_MUST_BE_IN_SUPERGROUP;
  const update = ctx.update;
  const message = update.message;
  const msg_id = message.message_id;
  let warns_count;

  if (!(await validate_request(ctx, mask))) return;

  warns_count = get_user_warns_count(message.from.id, message.chat.id);
  replyToMsgId(ctx, "Your number of warnings is: " + warns_count, msg_id);
}

export const warnCommand = {
  command: "warn",
  function: warn_command,
};

export const unwarnCommand = {
  command: "unwarn",
  function: unwarn_command,
};

export const warnsCommand = {
  command: "warns",
  function: warns_command,
};
