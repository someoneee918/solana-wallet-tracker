#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { c, compact, footer, getTx, isAddress, main, pad, parseArgs, rpc, short, sleep } from "../lib/core.js";
import { parseWalletTx, solUsd, tokenInfo } from "../lib/swaps.js";

const HELP = `solana-wallet-tracker: watch Solana wallets and see every buy and sell

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
`;

function readWallets(args) {
  const wallets = new Map();
  for (const a of args._) wallets.set(a, null);
  if (typeof args.file === "string") {
    for (const line of readFileSync(args.file, "utf8").split("\n")) {
      const [addr, ...rest] = line.split("#")[0].trim().split(/\s+/);
      if (addr) wallets.set(addr, rest.join(" ") || null);
    }
  }
  for (const w of wallets.keys()) if (!isAddress(w)) throw new Error(`"${w}" is not a Solana address.`);
  return wallets;
}

main(async () => {
  const args = parseArgs(process.argv.slice(2), { booleans: ["once", "json", "help", "transfers", "version"] });
  if (args.help) { console.log(HELP); return; }
  if (args.version) {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    console.log(`${pkg.name} ${pkg.version}`);
    return;
  }
  const wallets = readWallets(args);
  if (!wallets.size) { console.log(HELP); process.exit(1); }
  const history = args.history !== undefined ? Math.max(0, Math.min(20, Number(args.history))) : 5;
  const interval = Math.max(10, Number(args.interval) || 20) * 1000;
  const minSol = Number(args["min-sol"]) || 0;
  const webhook = typeof args.webhook === "string" ? args.webhook : null;
  const nameOf = (w) => wallets.get(w) || short(w);

  const show = async (trades, { notify }) => {
    if (!trades.length) return;
    const info = await tokenInfo(trades.flatMap((t) => [t.mint, t.fromMint].filter(Boolean)));
    const sol = await solUsd();
    for (const t of trades) {
      const token = info.get(t.mint);
      const usdValue = t.quote === "SOL" ? (sol ? t.quoteAmount * sol : null) : t.quote === "USD" ? t.quoteAmount : token?.priceUsd ? t.tokenAmount * token.priceUsd : null;
      const solValue = t.quote === "SOL" ? t.quoteAmount : usdValue !== null && sol ? usdValue / sol : null;
      if (minSol && (solValue ?? 0) < minSol) continue;
      const ticker = token?.symbol || short(t.mint);
      if (args.json) { console.log(JSON.stringify({ ...t, label: wallets.get(t.wallet), symbol: token?.symbol || null, usdValue })); continue; }
      const verb = { buy: c.green("BUY "), sell: c.red("SELL"), swap: c.cyan("SWAP"), transfer_in: c.dim("IN  "), transfer_out: c.dim("OUT ") }[t.type];
      const size = t.quote === "SOL" ? `${t.quoteAmount.toFixed(3)} SOL` : t.quote === "USD" ? `$${compact(t.quoteAmount)}` : t.type === "swap" ? `from ${short(t.fromMint)}` : "";
      const when = t.time ? new Date(t.time).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "";
      console.log(`${pad(when, 17)}  ${pad(c.bold(nameOf(t.wallet)), 14)}  ${verb}  ${pad(compact(t.tokenAmount), 9, true)} ${pad(c.bold(ticker), 12)}  ${pad(size, 13, true)}  ${pad(usdValue !== null ? "$" + compact(usdValue) : "", 9, true)}  ${c.dim(t.mint)}`);
      if (notify && webhook) {
        const text = `**${nameOf(t.wallet)}** ${t.type.replace("_", " ")} ${compact(t.tokenAmount)} **${ticker}**${size ? ` for ${size}` : ""}\n<https://solscan.io/tx/${t.signature}>`;
        fetch(webhook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: text }) }).catch(() => {});
      }
    }
  };

  const wanted = (t) => t && (args.transfers || !t.type.startsWith("transfer"));
  const fetchTrades = async (wallet, sigs, max = Infinity) => {
    const trades = [];
    for (const s of sigs) {
      if (s.err) continue;
      let tx;
      try { tx = await getTx(s.signature); } catch { continue; } // one unreadable transaction should not stop the tracker
      const trade = parseWalletTx(tx, wallet);
      if (wanted(trade)) trades.push(trade);
      if (trades.length >= max) break;
    }
    return trades;
  };

  if (!args.json) console.error(c.dim(`Tracking ${wallets.size} wallet${wallets.size > 1 ? "s" : ""}${args.once ? "" : `, checking every ${interval / 1000}s. Ctrl+C to stop.`}`));
  const last = new Map();
  for (const wallet of wallets.keys()) {
    const sigs = await rpc("getSignaturesForAddress", [wallet, { limit: history ? 25 : 1 }]);
    last.set(wallet, sigs[0]?.signature || null);
    if (history) {
      const trades = await fetchTrades(wallet, sigs, history);
      await show(trades.reverse(), { notify: false });
      if (!trades.length && !args.json) console.log(c.dim(`${nameOf(wallet)}: no token trades in its last ${sigs.length} transactions.`));
    }
  }
  if (args.once) { if (!args.json) footer("/solana-wallet-tracker", "Wallet tracking with PnL, smart-money ranking and instant alerts"); return; }

  process.on("SIGINT", () => { if (!args.json) footer("/solana-wallet-tracker", "Wallet tracking with PnL, smart-money ranking and instant alerts"); process.exit(0); });
  if (!args.json) console.error(c.dim("Watching for new trades…"));
  for (;;) {
    await sleep(interval);
    for (const wallet of wallets.keys()) {
      try {
        const options = { limit: 25 };
        if (last.get(wallet)) options.until = last.get(wallet);
        const sigs = await rpc("getSignaturesForAddress", [wallet, options]);
        if (!sigs.length) continue;
        last.set(wallet, sigs[0].signature);
        await show(await fetchTrades(wallet, sigs.reverse()), { notify: true });
      } catch (err) {
        if (!args.json) console.error(c.dim(`[${nameOf(wallet)}] ${err.message}`));
      }
    }
  }
});
