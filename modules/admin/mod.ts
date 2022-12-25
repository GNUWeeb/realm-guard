import { banCommand, unbanCommand } from "./ban";
import { muteCommand, unmuteCommand } from "./mute";
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
  dropWelcomeAndFarewell
} from "./greets";

export const adminCommands = [
  banCommand,
  unbanCommand,
  kickCommand,
  muteCommand,
  unmuteCommand,
  setWelcomeCommand,
  getWelcomeCommand,
  setFarewellCommand,
  getFarewellCommand,
  resetWelcomeCommand,
  resetFarewellCommand,
  resetGreetsCommand,
  warnCommand,
  unwarnCommand,
  warnsCommand
];

export { dropWelcomeAndFarewell };
