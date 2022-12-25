import { Context, Middleware, NarrowedContext } from "telegraf"
import { Message, Update } from "telegraf/typings/core/types/typegram"
import { MaybeArray } from "telegraf/typings/util"

export type Command = {
  command: MaybeArray<string>,
  function: Middleware<NarrowedContext<Context<Update>, {
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }>>,
}