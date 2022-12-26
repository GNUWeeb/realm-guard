# realm-guard

A Telegram group management bot made with Node and Telegraf.

Currently at a WIP stage and is not fit for production use.

## Features

### Generic

- [x] Show bot start message
- [x] Show bot help
- [x] Show bot version
- [x] Show user/bot information

### Administration

- [ ] Greeting user
  - [ ] Setting and resetting welcome message
  - [ ] Setting and resetting farewell message
- [ ] Banning user
  - [ ] Banning user temporarily
  - [ ] Banning user silently
- [ ] Unbanning user
- [ ] Kicking user
- [ ] Muting user
  - [ ] Muting user temporarily
  - [ ] Muting user silently
- [ ] Unmuting user
- [ ] Warning user
  - [ ] Adding user warns
  - [ ] Clearing user warns
  - [ ] Resetting user warns
  - [ ] Showing user warns
- [ ] Purging the group chat
- [ ] 

- [x] Generic bot commands
- [x] Banning user
- [x] Unbanning user
- [x] Kicking user
- [x] Muting user
- [x] Unmuting user
- [x] Warning user
- [x] Clearing user warns
- [x] Purging the group chat to replied message
- [x] Showing user warns
- [x] Setting welcome message
- [x] Setting farewell message
- [x] Greeting new users and leaving users
- [x] Showing user information
- [ ] Setting group rules
- [ ] Showing group rules
- [ ] Reporting user
- [ ] Pinning message
- [ ] Unpinning message
- [ ] Interactive `/help` command
- [ ] Flood control
- [ ] Spam detection and prevention
- [ ] CAPTCHA challenge for new users
- [ ] Global bans, kicks, mutes
- [ ] Message snips with keys
- [ ] Google Translate API integration *(TBD)*
- [ ] GitHub API integration *(TBD)*

> Features are subject to change and will probably change depending on the needs

## Running

1. Install the dependencies using `pnpm install` or `npm install` or whichever node package manager you prefer.
2. Copy the example `.env.example` environment table file and rename it to `.env`.
3. Copy your bot token into the environment variable `BOT_TOKEN` as its value.
4. Run `npm run dev` or `pnpm run dev` or `yarn run dev` or whichever node package manager you prefer as long as it runs.
5. Voila!

## License

MIT
