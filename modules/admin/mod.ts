import { banCommand, unbanCommand, tbanCommand } from "./ban";
import { muteCommand, unmuteCommand, timedMuteCommand } from "./mute";
import { kickCommand } from "./kick";
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
import { reportCommand } from "./report";

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
    tbanCommand,
    reportCommand,
];

export { dropWelcomeAndFarewell };
