import { Command, ValidateOptions } from "../../types/type";
import { validateRequest } from "../validation";
import { extract_kick_query } from "./kick";
import { timeToSecond, getStorageDir } from "../generic";
import { writeFile, rm, mkdir } from "fs/promises";
import { existsSync } from "fs";

/*
 * See argument variants spec: https://t.me/GNUWeeb/683627 (by Alviro).
 */

const STORAGE_DIR = getStorageDir();
const BAN_MODULE_RULES = [
        "in_supergroup",
        "user_is_admin",
        "bot_is_admin",
        "noreply_admin",
] satisfies ValidateOptions[];

const SIDE_NOTE = `<b>Side note:</b>
Currently, the <code>[reason]</code> doesn't mean anything, but accepted.`;

const BAN_ARG_SPEC = `
<code>/ban</code> command arguments spec:

  <code>/ban</code>   (must reply)
  <code>/ban [reason]</code>   (must reply, *)
  <code>/ban [user_id]</code>
  <code>/ban [user_id] [reason]</code>

  <code>/sban</code>   (must reply)
  <code>/sban [reason]</code>   (must reply, *)
  <code>/sban [user_id]</code>
  <code>/sban [user_id] [reason]</code>

*: The first word of the <code>[reason]</code> sentence must be NaN. If it is a number, it will fallback to <code>[user_id]</code> variants.

${SIDE_NOTE}`;

const TBAN_ARG_SPEC = `
<code>/tban</code> command arguments spec:

  <code>/tban [time]</code>   (must reply)
  <code>/tban [time] [reason]</code>   (must reply, *)
  <code>/tban [user_id] [time]</code>
  <code>/tban [user_id] [time] [reason]</code>

*: The first word of the <code>[reason]</code> sentence must be NaN. If it is a number, it will fallback to <code>[user_id] [time]</code> variants.

${SIDE_NOTE}`;

/**
 * Perform banChatMember().
 *
 * @ctx       The chat context.
 *
 * @user      The user to be banned.
 *
 * @seconds   How long the user should be banned? (in seconds).
 *            If @seconds is less than 30 secs, the @user will be
 *            banned permanently.
 *
 * @silent    Send banned notice?
 */
async function do_ban(ctx: any, user: any, seconds: number = 0,
                      silent: boolean = false)
{
        let silent_f = `${STORAGE_DIR}/ban_silent/`;

        if (silent) {
                if (!existsSync(silent_f))
                        await mkdir(silent_f);

                silent_f += `${ctx.chat.id}.temp`;
                await writeFile(silent_f, "");
        }

        let until_date;

        if (seconds === 0) {
                /* Forever. */
                until_date = 0;
        } else {
                until_date = Math.floor(Date.now() / 1000) + seconds;
        }

        await ctx.banChatMember(user.id, until_date, {revoke_messages: true});

        const T = (until_date) ? "T" : "";
        const S = (silent) ? "S" : "";
        console.log(`[${T}${S}BAN] ${user.first_name} (${user.id})`);

        if (silent) {
                const time = setTimeout(async () => {
                        await rm(silent_f);
                        clearTimeout(time);
                }, 4 * 1000);
                return;
        }

        let r = `User ${user.first_name} (${user.id}) `;
        if (ctx?.tban_time_arg)
                r += `is temporarily banned for ${ctx.tban_time_arg}!`;
        else
                r += `has been banned!`;

        await ctx.reply(r);
}

async function do_unban(ctx: any, user: any, silent: boolean = false)
{
        await ctx.unbanChatMember(user.id, {only_if_banned: true});
        console.log(`[UNBAN] ${user.first_name} (${user.id})`);

        if (silent)
                return;

        await ctx.reply(`User ${user.first_name} (${user.id}) has been unbanned!`);
}

function error_on_user_admin(user: any)
{
        const s = user?.status;
        if (s === "creator" || s === "administrator")
                return "You can't use this command against an admin!";

        return null;
}

async function __parse_ban_cmd(ctx: any, args: string[])
{
        let reason = "";
        let user = null;
        let err = null;

        if (!args[1].match(/^\d+$/)) {

                /*
                 * This is a `/ban [reason]`. Must reply.
                 *
                 * [reason] is NaN, if it was a number, we would
                 * fall to the 'try and catch' below here.
                 */
                reason = args.slice(1).join(" ");
                user = ctx.message?.reply_to_message?.from;
                if (!user)
                        err = `You must reply to a message!`;

                return [user, reason, err];
        }


        /*
         * This is a `/ban [user_id] [reason]` where the
         * `[reason]` is optional.
         *
         * Replied message is ignored.
         */
        try {
                user = await ctx.getChatMember(Number(args[1]));
                reason = args.slice(2).join(" ");
                err = error_on_user_admin(user);

                if (user?.user)
                        user = user.user;

        } catch (e) {
                err = `Cannot resolve user_id ${args[1]}`;
        }
        return [user, reason, err];
}

/*
 * This is used by `/ban` and `/sban`. They both have
 * the same arguments spec.
 */
async function parse_ban_cmd(ctx: any)
{
        let args = ctx.message.text.split(" ");
        let reason = "";
        let err = null;
        let user = null;

        if (args.length > 1) {
                [user, reason, err] = await __parse_ban_cmd(ctx, args);
        } else {
                /*
                 * args.length === 1 (without arguments), must reply.
                 */
                user = ctx.message?.reply_to_message?.from;
                if (!user)
                        err = `You must reply to a message!`;
        }

        return {
                user: user,
                reason: reason,
                err: err
        };
}

/*
 * Coupled with timeToSecond() parser in generic.ts.
 */
function is_time_pattern(s: string)
{
        return s.match(/^\d+(s|mo?|h|d|w|y)?$/);
}

async function __parse_tban_cmd(ctx: any, args: string[])
{
        let args1_is_tpat;
        let args2_is_tpat;
        let seconds = 0;
        let reason = "";
        let err = null;
        let user = null;

        /*
         * Don't call is_time_pattern() too often.
         */
        args1_is_tpat = is_time_pattern(args[1]);

        if (2 in args)
                args2_is_tpat = is_time_pattern(args[2]);
        else
                args2_is_tpat = false;

        if (!args1_is_tpat && !args2_is_tpat) {
                err = "Invalid <code>[time]</code> pattern, accepted time pattern is:\n"+
                      "<code>/^\\d+(s|mo?|h|d|w|y)?$/</code>";
                return [null, null, null, err];
        }

        if (args1_is_tpat && !args2_is_tpat) {
                /*
                 * /tban [time]
                 * /tban [time] [reason]
                 *
                 * Must reply. [reason] is optional, if provided,
                 * the first word must be NaN.
                 *
                 * If the first word was a number, we would fall
                 * to the `[user_id] [time]` variants below.
                 */

                user = ctx.message?.reply_to_message?.from;
                if (!user) {
                        err = "You must reply to a message!";
                } else {
                        seconds = timeToSecond(args[1]);
                        reason = reason = args.slice(2).join(" ");
                        ctx.tban_time_arg = args[1];
                }

                return [user, reason, seconds, err];
        }

        /*
         * Handle these patterns:
         *
         * /tban [user_id] [time]
         * /tban [user_id] [time] [reason]
         *
         * Replied message is ignored.
         * args[2] must be a time pattern.
         */
        try {
                user = await ctx.getChatMember(Number(args[1]));
                err = error_on_user_admin(user);
                reason = args.slice(3).join(" ");
                seconds = timeToSecond(args[2]);
                ctx.tban_time_arg = args[2];

                if (user?.user)
                        user = user.user;

        } catch (e) {
                err = `Cannot resolve user_id ${args[1]}`;
        }

        return [user, reason, seconds, err];
}

async function parse_tban_cmd(ctx: any)
{
        let args = ctx.message.text.split(" ");
        let seconds = 0;
        let reason = "";
        let err = null;
        let user = null;

        if (args.length === 1) {
                /*
                 * Timed ban always needs arguments.
                 */
                err = `Invalid <code>${args[0]}</code> command arguments!`;
        } else if (args.length >= 2) {
                [user, reason, seconds, err] = await __parse_tban_cmd(ctx, args);
        } else {
                /* Impossible. */
        }

        return {
                user: user,
                reason: reason,
                seconds: seconds,
                err: err
        };
}

async function unban_with_user_id(ctx: any)
{
        const user = await extract_kick_query(ctx, ctx.message.text);

        if (!user)
                return false;

        await do_unban(ctx, user);
        return true;
}

async function unban_cmd(ctx: any)
{
        if (!(await validateRequest(ctx, BAN_MODULE_RULES)))
                return;

        if (await unban_with_user_id(ctx))
                return;

        if (ctx.message?.reply_to_message?.from) {
                await do_unban(ctx, ctx.message.reply_to_message.from);
                return;
        }

        console.log("[ERROR] No valid reply or user ID!");
        await ctx.reply("Please reply to a message or type the user ID to unban a user!");
}

async function tban_cmd(ctx: any)
{
        if (!(await validateRequest(ctx, BAN_MODULE_RULES)))
                return;

        const ret = await parse_tban_cmd(ctx);
        if (ret.err) {
                await ctx.replyWithHTML(ret.err + `\n${TBAN_ARG_SPEC}`);
                return;
        }

        /*
         * TODO(???): What should we do with @ret.reason?
         */
        await do_ban(ctx, ret.user, ret.seconds, false);
}

async function __ban_cmd(ctx: any, silent: boolean)
{
        if (!(await validateRequest(ctx, BAN_MODULE_RULES)))
                return;

        const ret = await parse_ban_cmd(ctx);
        if (ret.err) {
                await ctx.replyWithHTML(ret.err + `\n${BAN_ARG_SPEC}`);
                return;
        }

        /*
         * TODO(???): What should we do with @ret.reason?
         */
        await do_ban(ctx, ret.user, 0, silent);
}

async function ban_cmd(ctx: any)
{
        await __ban_cmd(ctx, false);
}

async function sban_cmd(ctx: any)
{
        /*
         * Pretty much the same thing as `/ban` but:
         * silent === true
         */
        await __ban_cmd(ctx, true);
}

export const unbanCommand: Command = {
        command: "unban",
        function: unban_cmd
};

// `/tban <time>` command (temporarily ban user)
export const tbanCommand: Command = {
        command: "tban",
        function: tban_cmd
};

export const banCommand: Command = {
        command: "ban",
        function: ban_cmd
};

// `/sban` command (silently ban user)
export const sbanCommand: Command = {
        command: "sban",
        function: sban_cmd
};

/*
 * Quick dirty unit tests. Just to make sure my parsers
 * are correct :)
 *
 * For testing only.
 */
function assert(cond: boolean)
{
        if (!cond)
                throw Error("Assertion failed!");
}

async function test_parse_tban_cmd(ctx: any)
{
        let ret;

        /*
         * `/tban` without arguments is always invalid.
         */
        ctx.message.text = "/tban";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);

        ctx.message.text = "/tban";
        ctx.message.reply_to_message = {from: "user_obj_123"};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/tban [time]` without a replied message is
         * invalid.
         */
        ctx.message.text = "/tban 1d";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/tban [time] [reason]` without a replied message is
         * invalid.
         */
        ctx.message.text = "/tban 1d spam";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/tban [time] [reason]` (multiple words) without a
         * replied message is invalid.
         */
        ctx.message.text = "/tban 1d bitcoin crypto spam";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/tban [not a time]` is always invalid.
         */
        ctx.message.text = "/tban aaaaa";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);

        ctx.message.text = "/tban aaaaa";
        ctx.message.reply_to_message = {from: "user_obj_123"};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/tban [user_id] [not a time]` without a replied message
         * is invalid. If it had a replied message, it will fallback
         * to `/tban [time] [reason]` because `[user_id]` is a valid
         * time pattern.
         */
        ctx.message.text = "/tban 123123 aaaaa";
        ctx.message.reply_to_message = {};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err !== null);

        ctx.message.text = "/tban 123123 aaaaa";
        ctx.message.reply_to_message = {from: "user_obj_321"};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_321");
        assert(ret.seconds === 123123);
        assert(ret.reason === "aaaaa");


        /*
         * `/tban [user_id] [time]`, the replied message is ignored.
         */
        ctx.message.text = "/tban 123123 1h";
        ctx.message.reply_to_message = {from: "user_obj_123123"};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_123123");
        assert(ret.seconds === 3600);
        assert(ret.reason === "");


        /*
         * `/tban [user_id] [time] [reason]`, the replied message is ignored.
         */
        ctx.message.text = "/tban 123123 1h spam";
        ctx.message.reply_to_message = {from: "user_obj_123123"};
        ret = await parse_tban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_123123");
        assert(ret.seconds === 3600);
        assert(ret.reason === "spam");
}

async function test_parse_ban_cmd(ctx: any)
{
        let ret;

        /*
         * `/ban` without a replied message is invalid.
         */
        ctx.message.text = "/ban";
        ctx.message.reply_to_message = {};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/ban [reason]` without a replied message is invalid.
         */
        ctx.message.text = "/ban spam";
        ctx.message.reply_to_message = {};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/ban [reason]` (multiple words) without a replied
         * message is invalid.
         */
        ctx.message.text = "/ban crypto spam";
        ctx.message.reply_to_message = {};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err !== null);


        /*
         * `/ban` with a replied message is OK.
         */
        ctx.message.text = "/ban";
        ctx.message.reply_to_message = {from: "user_obj_111"};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_111");
        assert(ret.reason === "");


        /*
         * `/ban [reason]` with a replied message is OK.
         */
        ctx.message.text = "/ban spam";
        ctx.message.reply_to_message = {from: "user_obj_111"};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_111");
        assert(ret.reason === "spam");


        /*
         * `/ban [reason]` (multiple words) with a replied message
         * is OK.
         */
        ctx.message.text = "/ban bitcoin crypto spam";
        ctx.message.reply_to_message = {from: "user_obj_222"};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err === null);
        assert(ret.user === "user_obj_222");
        assert(ret.reason === "bitcoin crypto spam");


        /*
         * `/ban [user_id] [reason]` must ignore the replied
         * message.
         */
        ctx.message.text = "/ban 999 spam";
        ctx.message.reply_to_message = {from: "user_obj_333"};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err === null);
        /* 999 not 333 */
        assert(ret.user === "user_obj_999");
        assert(ret.reason === "spam");


        /*
         * `/ban [user_id] [reason]` (multiple words) must ignore
         * the replied message.
         */
        ctx.message.text = "/ban 999 bitcoin crypto spam";
        ctx.message.reply_to_message = {from: "user_obj_333"};
        ret = await parse_ban_cmd(ctx);
        assert(ret.err === null);
        /* 999 not 333 */
        assert(ret.user === "user_obj_999");
        assert(ret.reason === "bitcoin crypto spam");
}

export async function TestBanModuleParsers()
{
        let ctx = {
                message: {
                        text: "",
                        reply_to_message: {}
                },
                getChatMember: async function (x: any) {
                        return `user_obj_${x}`;
                }
        };

        let tests = [];
        let ret;
        let i;

        console.log("[TEST] Testing TestBanModuleParsers...");

        tests.push(test_parse_ban_cmd(ctx));
        tests.push(test_parse_tban_cmd(ctx));

        for (i in tests)
                await tests[i];

        console.log("[TEST] TestBanModuleParsers is OK!");
}
