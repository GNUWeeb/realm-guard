# realm-guard

A Telegram group management bot made with Node and Telegraf.

Currently at a WIP stage and is not fit for production use.

## Features

### Generic

- [x] Show bot start message
- [x] Show bot help
  - [ ] Interactive bot help
- [x] Show bot version
- [x] Show user/bot information

### Administration

- [x] Greeting user
  - [x] Setting and resetting welcome message
  - [x] Setting and resetting farewell message
- [x] Banning user
  - [x] Banning user temporarily
  - [x] Banning user silently
  - [ ] Banning user globally
- [x] Unbanning user
  - [ ] Unbanning user globally
- [x] Kicking user
  - [ ] Kicking user globally
- [x] Muting user
  - [x] Muting user temporarily
  - [x] Muting user silently
  - [ ] Muting user globally
- [x] Unmuting user
- [x] Warning user
  - [x] Adding user warns
  - [x] Clearing user warns
  - [ ] Resetting user warns
  - [x] Showing user warns
- [x] Purging the group chat
- [ ] Managing group rules
  - [ ] Setting group rules
  - [ ] Showing group rules
- [x] Reporting user
- [x] Pinning message
- [x] Unpinning message
- [ ] Spam management
  - [ ] Flood control
  - [ ] CAPTCHA challenge for new users
  - [ ] Spam detection
- [ ] Snipping messages with keys

> Features are subject to change and will probably change depending on the needs

## Running

1. Install the dependencies using `pnpm install` or `npm install` or whichever node package manager you prefer.
2. Copy the example `.env.example` environment table file and rename it to `.env`.
3. Copy your bot token into the environment variable `BOT_TOKEN` as its value.
4. Change the remaining environment variables accordingly. (`BOT_NAME` and `STORAGE_DIR` if you use it)
5. Run `npm run dev` or `pnpm run dev` or `yarn run dev` or whichever node package manager you prefer as long as it runs.
6. Voila!

## License

MIT
