import { banCommand, unbanCommand } from "./ban";
import { muteCommand, unmuteCommand, timedMuteCommand } from "./mute";
import { kickCommand } from "./kick";
import { pinCommand, unpinCommand } from "./pin";
import { warnCommand, unwarnCommand, warnsCommand } from "./warn";
import {
    setWelcomeCommand,
    getWelcomeCommand,
    setFarewellCommand,
    getFarewellCommand,
    resetWelcomeCommand,
    resetFarewellCommand,
    resetGreetsCommand,
    dropWelcomeAndFarewell,
} from "./greets";
import { purgeCommand } from "./purge";

export const adminCommands = [
    banCommand,
    unbanCommand,
    kickCommand,
    muteCommand,
    unmuteCommand,
    timedMuteCommand,
    setWelcomeCommand,
    getWelcomeCommand,
    setFarewellCommand,
    getFarewellCommand,
    resetWelcomeCommand,
    resetFarewellCommand,
    resetGreetsCommand,
    warnCommand,
    unwarnCommand,
    warnsCommand,
    purgeCommand,
    pinCommand,
    unpinCommand,
];

export { dropWelcomeAndFarewell };
