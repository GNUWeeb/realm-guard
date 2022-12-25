import { adminCommands } from "./admin/mod";
import { helpCommand, pingCommand, startCommand, versionCommand } from "./generic";

const genericCommands = [startCommand, versionCommand, pingCommand, helpCommand];

export const commands = [...genericCommands, ...adminCommands];