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

export type ValidateOptions =
    | "reply"
    | "query"
    | "supergroup"
    | "admin"
    | "noreply_admin";

export type UserInfo = {
    firstName: string;
    lastName: string;
    username: string;
    id: string;
    isBot: boolean;
    isAdmin: string;
};
