# Repository notes

Goat-Bot-V2 is a Facebook Messenger bot. The Messenger client is the `neokex-fca`
npm package, loaded from `bot/login/login.js` via `require("neokex-fca")`.

The client used to be vendored as an in-tree `fb-meta/` folder (published as
`fca-meta`). That code now ships as the `neokex-fca` package (source repo:
`nkxVoid/FCA-META`, private), so it is no longer part of this repository.

## Layout

- `bot/` — login flow (`bot/login/login.js`) and the command/event handlers
  (`bot/handler/`).
- `scripts/cmds/` and `scripts/events/` — user commands and event hooks.
- `database/` — data models and stores.
- `func/`, `logger/`, `languages/` — helpers, logging, and i18n.
- `config.json` — runtime config; `optionsFca` is passed through to `neokex-fca`.

## Client integration

- `bot/login/login.js` reads the session from `account.txt` (appState cookies) and
  falls back to credential login. It strips the `notes` key out of `optionsFca`
  before handing options to `neokex-fca`, which warns about unknown options.
- `optionsFca.autoReconnect` must stay true or the reconnect loop is disabled.
- `config.json` `restartListenMqtt.enable` defaults to false; the client
  auto-reconnects and refreshes its own session tokens, so a periodic restart is
  unnecessary and only risks gaps in event delivery.
- `login.js` persists the live fbstate every `autoRefreshFbstateInterval` minutes
  (default 30) so a hard restart reloads fresh cookies.

## Secrets

`account.txt` holds the live Facebook session cookies and **must stay empty in the
repository**. Never commit real cookies or other credentials; this repo is public.

## Git identity and remotes

Always commit and push as `nkxVoid <nkxVoid@users.noreply.github.com>` (set both in
`.git/config` for this repo). `origin` is `nkxVoid/Goatbot-V2`; push to `main`.

## Admin (role 2) custom features

Two opt-in features, both off by default in `config.json`:

- `noprefix.enable` — when true, a bot admin (role 2) can call any command by its bare
  name with no prefix. The no-prefix path is in `handlerEvents.onStart`: a message is only
  treated as a command when its first word resolves to a real command name/alias, so
  ordinary chat is ignored. Non-admins are unaffected (they still need the prefix).
  `removeCommandNameFromBody()` strips the bare name (empty prefix) in this mode.
- `unsendOnReaction.enable` — when true, a bot admin reacting with 😠 or 😡 to a message
  the bot sent makes the bot unsend it. `login.js` wraps `api.sendMessage`/
  `api.sendMessageMqtt` to record sent message ids in `global.GoatBot.sentMessageIDs`
  (capped at 1000); `handlerEvents.onReaction` checks that set before its normal dispatch.

Toggle commands (author `Neoaz 🐊`, role 2, no comments): `scripts/cmds/noprefix.js`
(`noprefix [on|off]`) and `scripts/cmds/uor.js` (`uor [on|off]`).
