# Solana Wallet Tracker

Follow any Solana wallets and see every memecoin buy and sell they make: token, size in SOL and USD, and a Solscan link. Optional Discord alerts for copy-trading and smart-money watching.

![Node 22+](https://img.shields.io/badge/node-%E2%89%A522-5FA04E?logo=node.js&logoColor=white) ![Dependencies: 0](https://img.shields.io/badge/dependencies-0-2ea44f) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Website](https://img.shields.io/badge/website-blixtrade.github.io-8b5cf6)](https://blixtrade.github.io/solana-wallet-tracker/)

> Free and open source, part of the [Blix Trade](https://github.com/blixtrade) toolkit. For the live version with AI ratings on every coin, wallet tracking and one-click trading at 0% fees, see **[BLIX, the Solana memecoin terminal](https://blixvip.com/solana-wallet-tracker?utm_source=github&utm_medium=readme&utm_campaign=solana-wallet-tracker)**.

## What it does

- Reads each wallet's transactions and turns them into buys, sells and token-for-token swaps, with the SOL or stablecoin amount and the USD value.
- Works across every DEX and launchpad (pump.fun, PumpSwap, Raydium, Meteora, Jupiter routes), because it reads balance changes rather than one program's instructions.
- Watches for new trades on a timer and can post each one to a Discord webhook.
- Load a list of wallets with labels from a file: one `address label` per line.

## Quick start

You need [Node.js](https://nodejs.org) 22 or newer. There is nothing else to install: no dependencies, no API keys.

Run it straight from GitHub:

```bash
npx -y github:blixtrade/solana-wallet-tracker <wallet> [<wallet> ...]
```

Or clone it:

```bash
git clone https://github.com/blixtrade/solana-wallet-tracker.git
cd solana-wallet-tracker
node bin/wallet-tracker.js <wallet> [<wallet> ...]
```

To get a `wallet-tracker` command on your PATH, run `npm link` inside the folder.

## Example output

Real output from a run on 18 November 2026:

```text
18 Nov, 17:32:22   BAqd…exx3       SELL       7.2K DCTY              1.377 SOL    $100.38  9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump
18 Nov, 17:34:26   BAqd…exx3       BUY        5.3K DCTY              1.002 SOL     $73.05  9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump
18 Nov, 17:35:05   BAqd…exx3       BUY        2.6K DCTY              0.502 SOL     $36.60  9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump
18 Nov, 17:36:00   BAqd…exx3       BUY        2.6K DCTY              0.502 SOL     $36.60  9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump
18 Nov, 17:36:12   BAqd…exx3       BUY        1.0K DCTY              0.203 SOL     $14.76  9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump
```

## Options

```text
solana-wallet-tracker: watch Solana wallets and see every buy and sell

Usage:
  wallet-tracker <wallet> [<wallet> ...] [options]
  wallet-tracker --file wallets.txt [options]

Options:
  --file <path>       Text file with one wallet per line, optionally followed by a label
  --history <n>       Recent trades to show per wallet at start (default 5, 0 for none)
  --once              Show the history and exit, without watching
  --interval <sec>    Seconds between checks (default 20, minimum 10)
  --min-sol <n>       Hide trades smaller than this many SOL
  --transfers         Also show plain token transfers in and out
  --webhook <url>     Post each new trade to a Discord webhook
  --json              One JSON object per line
  --version           Show version
  --help              Show this help

Environment:
  SOLANA_RPC_URL      Your own RPC endpoint (recommended for more than 3 wallets)
```

## How it works

- For each transaction, the wallet's SOL change (fee added back) and token balance changes are compared. Token in plus SOL out is a buy; the reverse is a sell. Wrapped SOL counts as SOL; USDC and USDT count as dollars.
- Moves smaller than a token-account rent deposit are treated as transfers, not trades.
- Token names and prices come from DexScreener; the SOL price from Jupiter.

## Limits

- On the free public RPC, about one transaction is read per second. For more than 3 wallets, set `SOLANA_RPC_URL`.
- Transfers are hidden by default (`--transfers` shows them).

## Development

```bash
npm test
```

Tests run offline against fixtures, so they never depend on a live API.

## Contributing

Pull requests are welcome, and first-timers are too. Pick an issue labelled [good first issue](https://github.com/blixtrade/solana-wallet-tracker/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/blixtrade/solana-wallet-tracker/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22), comment that you are taking it, and read [CONTRIBUTING.md](CONTRIBUTING.md). No API keys needed: the tests run offline.

[![Contributors](https://contrib.rocks/image?repo=blixtrade/solana-wallet-tracker)](https://github.com/blixtrade/solana-wallet-tracker/graphs/contributors)

## More free Solana tools from Blix Trade

| Tool | What it does |
|---|---|
| [solana-bubble-map](https://github.com/blixtrade/solana-bubble-map) | Holder bubble map for any Solana or pump.fun token. |
| [pump-fun-tracker](https://github.com/blixtrade/pump-fun-tracker) | Every new pump.fun launch on Solana, live in your terminal, the moment it is created. |
| [solana-rug-checker](https://github.com/blixtrade/solana-rug-checker) | Rug pull scanner for Solana and pump.fun tokens. |
| [solana-memecoin-screener](https://github.com/blixtrade/solana-memecoin-screener) | Screen trending, new and boosted Solana memecoins from the terminal. |
| [solana-pnl-tracker](https://github.com/blixtrade/solana-pnl-tracker) | Profit and loss for any Solana wallet's memecoin trades, worked out from its on-chain transactions. |
| [solana-whale-tracker](https://github.com/blixtrade/solana-whale-tracker) | Big buys and sells on any Solana token: net whale flow, every large trade with a Solscan link, and leaderboards of the wallets buying and dumping the most. |
| [memecoin-paper-trading](https://github.com/blixtrade/memecoin-paper-trading) | Practise Solana memecoin trading with fake SOL at real prices. |
| [memecoin-alert-bot](https://github.com/blixtrade/memecoin-alert-bot) | pump.fun alerts in Telegram and Discord. |
| [pump-fun-mcp](https://github.com/blixtrade/pump-fun-mcp) | An MCP server that gives Claude, Cursor and other AI assistants six Solana memecoin research tools: token info, rug check, top holders, a screener, whale trades and wallet trades. |

Want all of this in one place, live, with AI on every coin? **[Open BLIX](https://blixvip.com/?utm_source=github&utm_medium=readme&utm_campaign=solana-wallet-tracker)**: the Solana memecoin terminal with 0% trading fees.

## Disclaimer

This is research software, not financial advice. Memecoins are extremely volatile and most go to zero. Never trade more than you can afford to lose. The data comes from free third-party APIs that can be wrong, late or unavailable.

## License

[MIT](LICENSE)
