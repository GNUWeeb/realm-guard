import { adminCommands } from "./admin/mod";
import {
    helpCommand,
    pingCommand,
    startCommand,
    versionCommand,
    printUserInfoCommand,
} from "./generic";

const genericCommands = [
    startCommand,
    versionCommand,
    pingCommand,
    helpCommand,
    printUserInfoCommand,
];

export const commands = [...genericCommands, ...adminCommands];
