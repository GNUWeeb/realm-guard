import { banCommand, unbanCommand } from "./ban";
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
];

export { dropWelcomeAndFarewell };
