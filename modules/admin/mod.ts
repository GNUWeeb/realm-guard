import { banCommand, unbanCommand } from "./ban";
import { muteCommand, unmuteCommand } from "./mute";
import { kickCommand } from "./kick";

export const adminCommands = [banCommand, unbanCommand, kickCommand, muteCommand, unmuteCommand];