import { Context, Middleware, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { MaybeArray } from "telegraf/typings/util";

export type Command = {
    command: MaybeArray<string>;
    function: Middleware<
        NarrowedContext<
            Context<Update>,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        >
    >;
};

export type ContextDefault = NarrowedContext<
    Context<Update>,
    {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }
>;

export type Greets = {
    [key: string]: GreetItem;
};

export type GreetItem = {
    welcome: string;
    farewell: string;
};

/*
 * TODO(irvanmalik4):
 *
 *   This one somehow breaks my new implementation of
 *   rules ordering. Please fix. I don't know TS much.
 *
 *   I use array of strings for now.
 *
 *   See modules/validation.ts.
 *
 *  -- Viro
 */
export type ValidateOptions =
    | "user_is_admin"
    | "bot_is_admin"
    | "noreply_admin"
    | "query"
    | "replied_user_in_group"
    | "reply"
    | "in_supergroup";

export type UserInfo = {
    firstName: string;
    lastName: string;
    username: string;
    id: string;
    isBot: boolean;
    isAdmin: string;
};
