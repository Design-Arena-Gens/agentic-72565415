"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Flame,
  FlipHorizontal2,
  Gauge,
  Layers,
  MoveDown,
  MoveUp,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

type PositionDirection = "Long" | "Short";

type Position = {
  id: string;
  asset: string;
  assetClass: "Crypto" | "Metals";
  direction: PositionDirection;
  size: number;
  entry: number;
  mark: number;
  stopPercent: number;
  tpPercent: number;
  confidence: number;
  conviction: "High" | "Medium" | "Rebuilding";
  history: number[];
};

type Indicator = {
  name: string;
  shorthand: string;
  value: number;
  format: "price" | "percent" | "index";
  change: number;
  bias: "Bullish" | "Bearish" | "Neutral";
  description: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  market: string;
  impact: "High" | "Medium" | "Low";
  datetime: string;
  play: string;
};

type LiquidationSpike = {
  id: string;
  symbol: string;
  exchange: string;
  notional: number;
  side: "Longs" | "Shorts";
  intensity: "Extreme" | "Elevated" | "Moderate";
  timestamp: string;
  reaction: string;
};

const initialPositions: Position[] = [
  {
    id: "btc-core",
    asset: "BTCUSDT",
    assetClass: "Crypto",
    direction: "Long",
    size: 2.4,
    entry: 48250,
    mark: 49580,
    stopPercent: 2.1,
    tpPercent: 8.5,
    confidence: 0.92,
    conviction: "High",
    history: [
      46800, 47040, 47250, 47410, 47680, 47900, 48250, 48420, 48700, 48980, 49110,
      49250, 49300, 49420, 49510, 49580,
    ],
  },
  {
    id: "eth-satellite",
    asset: "ETHUSDT",
    assetClass: "Crypto",
    direction: "Long",
    size: 120,
    entry: 2720,
    mark: 2816,
    stopPercent: 1.8,
    tpPercent: 6.2,
    confidence: 0.88,
    conviction: "High",
    history: [
      2580, 2598, 2625, 2644, 2660, 2688, 2705, 2720, 2735, 2764, 2782, 2795, 2805,
      2812, 2816,
    ],
  },
  {
    id: "gold-hedge",
    asset: "GOLDUSD",
    assetClass: "Metals",
    direction: "Short",
    size: 820,
    entry: 2422,
    mark: 2389,
    stopPercent: 1.2,
    tpPercent: 3.1,
    confidence: 0.74,
    conviction: "Medium",
    history: [
      2468, 2462, 2455, 2451, 2444, 2438, 2432, 2428, 2422, 2416, 2410, 2404, 2398,
      2392, 2389,
    ],
  },
];

const indicatorSeeds: Indicator[] = [
  {
    name: "Exponential Moving Average",
    shorthand: "EMA(50/200)",
    value: 1.14,
    format: "percent",
    change: 0.24,
    bias: "Bullish",
    description: "Golden ratio spread signaling sustained trend strength.",
  },
  {
    name: "Average Directional Index",
    shorthand: "ADX 37",
    value: 37,
    format: "index",
    change: 4.2,
    bias: "Bullish",
    description: "Directional energy accelerating with price expansion.",
  },
  {
    name: "Average True Range",
    shorthand: "ATR 14",
    value: 4.8,
    format: "percent",
    change: -0.6,
    bias: "Neutral",
    description: "Volatility compressing; supports pyramiding trend adds.",
  },
  {
    name: "Relative Strength Index",
    shorthand: "RSI 63",
    value: 63,
    format: "index",
    change: 3.1,
    bias: "Bullish",
    description: "Momentum uptrend intact with moderated overbought risk.",
  },
  {
    name: "Funding & Crowd Flow",
    shorthand: "Funding +4.2bps",
    value: 0.042,
    format: "percent",
    change: -0.8,
    bias: "Neutral",
    description: "Crowd greed cooling; ideal for trend continuation entries.",
  },
  {
    name: "Volume Weighted Average Price",
    shorthand: "VWAP",
    value: 48790,
    format: "price",
    change: 240,
    bias: "Bullish",
    description: "Price holding premium above VWAP with rising participation.",
  },
];

const marketCalendar: CalendarEvent[] = [
  {
    id: "cpi",
    title: "US CPI Release",
    market: "Macro",
    impact: "High",
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    play: "Fade first spike; rejoin trend on confirmation volume.",
  },
  {
    id: "ecb",
    title: "ECB Rate Decision",
    market: "EUR Rates",
    impact: "Medium",
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 40).toISOString(),
    play: "Monitor GOLDUSD; tighten stops during statement.",
  },
  {
    id: "eth-upgrade",
    title: "ETH Shanghai +120 Day",
    market: "Ethereum",
    impact: "High",
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 60).toISOString(),
    play: "Deploy trend adds if staking unlock flows stay muted.",
  },
  {
    id: "btc-etf",
    title: "BTC ETF Inflows Update",
    market: "Bitcoin",
    impact: "Medium",
    datetime: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(),
    play: "Use consensus alignment: indicators + sentiment must agree.",
  },
];

const liquidationSeeds: LiquidationSpike[] = [
  {
    id: "btc-n1",
    symbol: "BTCUSDT",
    exchange: "Binance",
    notional: 86_400_000,
    side: "Longs",
    intensity: "Extreme",
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    reaction: "Price snapped +1.8% in 12m; reloaded trend adds.",
  },
  {
    id: "eth-n1",
    symbol: "ETHUSDT",
    exchange: "Bybit",
    notional: 24_900_000,
    side: "Shorts",
    intensity: "Elevated",
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    reaction: "News confirmation + crowd momentum triggered consensus entry.",
  },
  {
    id: "xau-n1",
    symbol: "XAUUSD",
    exchange: "CME",
    notional: 11_200_000,
    side: "Longs",
    intensity: "Moderate",
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    reaction: "Held short bias; rolled stop 0.4% to lock-in gains.",
  },
];

const strategyPillars = [
  {
    tag: "{Trend Trading}",
    title: "Ride dominant flow, ignore the chop.",
    description:
      "Let the market do the heavy lifting: we pyramid with trend confirmations, cut fast when momentum fractures, and refuse to donate during indecisive news chop.",
    highlights: [
      "Multi-timeframe structure to confirm direction",
      "Dynamic ATR matrix to size adds and trim risk",
      "Momentum cooling instantly triggers stop trail",
    ],
  },
  {
    tag: "{News Trading}",
    title: "Exploit catalyst aftermath, never the initial chaos.",
    description:
      "We allow the first spike to exhaust, verify with volume + candle structure, then capture the reaction wave. Funding imbalances are auto-hedged to avoid stuck positioning.",
    highlights: [
      "Event filters auto-pause high-risk assets",
      "Candle + volume confirmation unlocks entries",
      "Puter zero-key automations deploy hedge hedges instantly",
    ],
  },
  {
    tag: "{Consensus Trading}",
    title: "Only trade when the crowd, the chart, and the news agree.",
    description:
      "Signals must stack: technical momentum, macro narrative, and crowd behavior. When two schools align we deploy; otherwise we stay white-glove patient.",
    highlights: [
      "Sentiment gauge drives leverage throttle",
      "Cross-desk news + social scanner syncs bias",
      "Crowd flush + indicator surge triggers greenlight",
    ],
  },
];

const gradientByBias: Record<Indicator["bias"], string> = {
  Bullish: "from-emerald-400/80 to-cyan-400/80",
  Bearish: "from-rose-500/60 to-orange-400/60",
  Neutral: "from-slate-500/60 to-zinc-400/60",
};

const impactPalette: Record<CalendarEvent["impact"], string> = {
  High: "border-rose-400/70 bg-rose-500/10 text-rose-100",
  Medium: "border-amber-400/70 bg-amber-400/10 text-amber-100",
  Low: "border-cyan-400/70 bg-cyan-400/10 text-cyan-100",
};

const intensityPalette: Record<LiquidationSpike["intensity"], string> = {
  Extreme: "text-rose-300",
  Elevated: "text-amber-300",
  Moderate: "text-cyan-300",
};

const formatCurrency = (value: number, symbol = "$"): string => {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const formatNumber = (value: number, digits = 2) =>
  value.toLocaleString(undefined, { maximumFractionDigits: digits });

const formatPercent = (value: number, digits = 2) =>
  `${value > 0 ? "+" : ""}${value.toFixed(digits)}%`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getStopPrice = (position: Position) => {
  const offset = position.stopPercent / 100;
  const raw =
    position.direction === "Long"
      ? position.entry * (1 - offset)
      : position.entry * (1 + offset);
  return parseFloat(raw.toFixed(2));
};

const getTargetPrice = (position: Position) => {
  const offset = position.tpPercent / 100;
  const raw =
    position.direction === "Long"
      ? position.entry * (1 + offset)
      : position.entry * (1 - offset);
  return parseFloat(raw.toFixed(2));
};

const computePnl = (position: Position) => {
  const priceDiff =
    position.direction === "Long"
      ? position.mark - position.entry
      : position.entry - position.mark;
  return priceDiff * position.size;
};

const computePnlPercent = (position: Position) => {
  const priceDiff =
    position.direction === "Long"
      ? position.mark - position.entry
      : position.entry - position.mark;
  return (priceDiff / position.entry) * 100;
};

const sentimentLabel = (value: number) => {
  if (value >= 75) return "Euphoria";
  if (value >= 55) return "Greed";
  if (value >= 45) return "Balanced";
  if (value >= 25) return "Fear";
  return "Capitulation";
};

const timeUntil = (dateString: string) => {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) {
    return "Live";
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.round((diff - hours * 3600 * 1000) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

const timeSince = (dateString: string) => {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diff = now - target;
  if (diff <= 0) {
    return "Now";
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.round((diff - hours * 3600 * 1000) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${Math.max(minutes, 1)}m`;
  }
  const mins = Math.max(1, Math.round(diff / (1000 * 60)));
  return `${mins}m`;
};

const Sparkline = ({ data, stroke }: { data: number[]; stroke: string }) => {
  const width = 140;
  const height = 56;
  const gradientId = useId();
  if (data.length === 0) {
    return null;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-36">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.7" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d={`${points} L${width},${height} L0,${height} Z`}
        fill={`url(#${gradientId})`}
        className="opacity-60"
      />
      <path
        d={points}
        fill="none"
        stroke={stroke}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const SentimentGauge = ({ value }: { value: number }) => {
  const clamped = clamp(value, 0, 100);
  const angle = (clamped / 100) * 180 - 90;
  const label = sentimentLabel(clamped);
  const accent =
    clamped >= 55
      ? "from-emerald-400 via-cyan-300 to-sky-400"
      : clamped <= 30
      ? "from-rose-400 via-orange-400 to-amber-300"
      : "from-sky-300 via-indigo-300 to-violet-300";

  return (
    <div className="relative flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="text-sm uppercase tracking-[0.4rem] text-white/50">Market Sentiment</div>
      <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
        <Gauge size={16} />
        Fear & Greed Index
      </div>
      <div className="relative mt-8 h-48 w-48">
        <div className="absolute inset-0 rounded-full border border-white/10 bg-gradient-to-br from-white/5 to-white/0 shadow-[0_0_150px_rgba(34,211,238,0.2)]" />
        <div className="absolute inset-6 rounded-full border border-white/5 bg-neutral-950" />
        <div className="absolute left-1/2 top-1/2 h-1 w-24 origin-left -translate-y-1/2 rounded-full bg-gradient-to-r from-white/20 to-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]" style={{ transform: `rotate(${angle}deg)` }} />
        <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${accent} opacity-30 blur-2xl`} />
        <div className="absolute inset-12 flex flex-col items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm">
          <span className="text-5xl font-semibold tracking-tight text-white">
            {clamped}
          </span>
          <span className="text-xs uppercase tracking-[0.3rem] text-white/60">
            {label}
          </span>
        </div>
      </div>
      <p className="mt-6 max-w-xs text-center text-sm text-white/70">
        Low readings = accumulation mode. High readings = throttle leverage and
        protect unrealized P&L while the crowd chases.
      </p>
    </div>
  );
};

export default function Home() {
  const [positions, setPositions] = useState(initialPositions);
  const [indicators, setIndicators] = useState(indicatorSeeds);
  const [fearGreed, setFearGreed] = useState(72);
  const [liquidations, setLiquidations] = useState(liquidationSeeds);

  const portfolioStats = useMemo(() => {
    const pnl = positions.reduce((acc, position) => acc + computePnl(position), 0);
    const pnlPercent =
      positions.reduce((acc, position) => acc + computePnlPercent(position), 0) /
      positions.length;
    const cryptoSize = positions
      .filter((p) => p.assetClass === "Crypto")
      .reduce((acc, p) => acc + p.size, 0);
    const metalsSize = positions
      .filter((p) => p.assetClass === "Metals")
      .reduce((acc, p) => acc + p.size, 0);

    return {
      pnl,
      pnlPercent,
      cryptoSize,
      metalsSize,
    };
  }, [positions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPositions((prev) =>
        prev.map((position) => {
          const drift =
            (Math.random() - 0.45) *
            (position.assetClass === "Metals" ? 1.4 : position.entry * 0.0009);
          const nextMark = clamp(position.mark + drift, position.entry * 0.92, position.entry * 1.12);
          const nextHistory = [...position.history.slice(1), parseFloat(nextMark.toFixed(2))];
          return {
            ...position,
            mark: parseFloat(nextMark.toFixed(2)),
            history: nextHistory,
          };
        }),
      );
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndicators((prev) =>
        prev.map((indicator) => {
          const directionBias = indicator.bias === "Bullish" ? 1 : indicator.bias === "Bearish" ? -1 : 0;
          const noise = (Math.random() - 0.5 + directionBias * 0.15) * (indicator.format === "price" ? 150 : 1.5);
          const nextValue =
            indicator.format === "index"
              ? clamp(indicator.value + noise, 5, 85)
              : indicator.format === "price"
              ? clamp(indicator.value + noise, indicator.value * 0.94, indicator.value * 1.08)
              : clamp(indicator.value + noise * 0.4, -3, 6);
          const delta = clamp(indicator.change + noise * 0.2, -8, 8);
          return { ...indicator, value: parseFloat(nextValue.toFixed(2)), change: parseFloat(delta.toFixed(2)) };
        }),
      );
    }, 6200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFearGreed((prev) => {
        const drift = (Math.random() - 0.5) * 6;
        return Math.round(clamp(prev + drift, 12, 92));
      });
    }, 8800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiquidations((prev) => {
        const sample: LiquidationSpike = {
          id: `liq-${Date.now()}`,
          symbol: Math.random() > 0.5 ? "BTCUSDT" : "ETHUSDT",
          exchange: Math.random() > 0.5 ? "OKX" : "Deribit",
          notional: Math.round(15_000_000 + Math.random() * 70_000_000),
          side: Math.random() > 0.5 ? "Longs" : "Shorts",
          intensity: Math.random() > 0.6 ? "Extreme" : Math.random() > 0.5 ? "Elevated" : "Moderate",
          timestamp: new Date().toISOString(),
          reaction:
            Math.random() > 0.5
              ? "Fade flush & reload with trend."
              : "Crowd trapped; watch consensus before acting.",
        };
        const next = [sample, ...prev];
        return next.slice(0, 5);
      });
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleAdjustStop = (id: string, nextPercent: number) => {
    setPositions((prev) =>
      prev.map((position) =>
        position.id === id
          ? {
              ...position,
              stopPercent: parseFloat(clamp(nextPercent, 0.4, 12).toFixed(2)),
            }
          : position,
      ),
    );
  };

  const handleAdjustTarget = (id: string, nextPercent: number) => {
    setPositions((prev) =>
      prev.map((position) =>
        position.id === id
          ? {
              ...position,
              tpPercent: parseFloat(clamp(nextPercent, 1.2, 28).toFixed(2)),
            }
          : position,
      ),
    );
  };

  const handleClose = (id: string, ratio: number) => {
    setPositions((prev) =>
      prev.map((position) =>
        position.id === id
          ? {
              ...position,
              size:
                ratio >= 1
                  ? 0
                  : parseFloat(Math.max(position.size * (1 - ratio), 0).toFixed(position.asset === "ETHUSDT" ? 1 : 2)),
              conviction: ratio >= 1 ? "Rebuilding" : position.conviction,
            }
          : position,
      ),
    );
  };

  const handleFlip = (id: string) => {
    setPositions((prev) =>
      prev.map((position) => {
        if (position.id !== id) return position;
        const flippedDirection: PositionDirection = position.direction === "Long" ? "Short" : "Long";
        return {
          ...position,
          direction: flippedDirection,
          entry: parseFloat(position.mark.toFixed(2)),
          stopPercent: parseFloat((position.stopPercent * 0.8).toFixed(2)),
          tpPercent: parseFloat((position.tpPercent * 1.1).toFixed(2)),
          confidence: clamp(position.confidence * 0.97, 0.55, 0.98),
          conviction: "Medium",
        };
      }),
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_bottom,rgba(236,72,153,0.12),transparent_60%)]" />
      <motion.main
        className="relative mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 py-16 lg:px-10 xl:px-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <header className="grid gap-10 rounded-3xl border border-white/10 bg-black/60 p-10 backdrop-blur-2xl lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.55rem] text-white/50">
              <span className="rounded-full border border-white/10 px-4 py-1 font-semibold text-white/70">
                QUANT Strategy
              </span>
              <span>AI Agent Control • 98% hit-rate</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
              Award-winning BTC · ETH · GOLD execution deck with autonomous risk,
              sentiment, and catalyst alignment.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
              Master the trend, capture the catalyst, and let consensus filter the rest.
              Our Puter-powered automations move stops, scale exposure, and flip bias
              instantly—no API keys, no friction, just pure quant precision.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://puter.com"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 px-6 py-3 text-sm font-semibold text-black transition hover:shadow-[0_0_45px_rgba(6,182,212,0.45)]"
              >
                Launch instantly on Puter
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:bg-white/5">
                Watch live execution
                <Activity size={18} className="text-emerald-300" />
              </button>
            </div>
          </div>
          <motion.div
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Portfolio Pulse</span>
              <RefreshCcw size={16} className="animate-spin text-cyan-300" />
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.35rem] text-white/40">
                  Realized + Unrealized
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-semibold text-emerald-300">
                    {formatCurrency(portfolioStats.pnl)}
                  </span>
                  <span className="text-sm text-emerald-200">
                    {formatPercent(portfolioStats.pnlPercent, 1)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-xs uppercase tracking-[0.3rem] text-white/40">
                    Crypto Exposure
                  </span>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatNumber(portfolioStats.cryptoSize, 2)} units
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <span className="text-xs uppercase tracking-[0.3rem] text-white/40">
                    Metals Hedge
                  </span>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatNumber(portfolioStats.metalsSize, 0)} oz
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Flame size={16} className="text-orange-300" />
                  Precision trend hierarchy live
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Zap size={16} className="text-cyan-300" />
                  Stops auto-sync w/ volatility
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="flex items-center justify-between text-sm uppercase tracking-[0.35rem] text-white/50">
              <span>{`{portfolio}`} Tactical Control</span>
              <span className="flex items-center gap-2 text-xs text-white/40">
                <Layers size={16} />
                Manage size, stops, targets, flips
              </span>
            </h2>
            <div className="space-y-6">
              {positions.map((position) => {
                const pnl = computePnl(position);
                const pnlPercent = computePnlPercent(position);
                const stopPrice = getStopPrice(position);
                const targetPrice = getTargetPrice(position);
                const isLong = position.direction === "Long";
                const pnlColor =
                  pnl > 0 ? "text-emerald-300" : pnl < 0 ? "text-rose-300" : "text-white/60";

                return (
                  <motion.article
                    key={position.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs uppercase tracking-[0.45rem] text-white/40">
                            {position.asset}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${isLong ? "bg-emerald-400/10 text-emerald-200" : "bg-rose-400/10 text-rose-200"}`}
                          >
                            {position.direction}
                          </span>
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                            {position.assetClass}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-white/60">
                          <div className="flex items-center gap-3">
                            <span>Size</span>
                            <strong className="text-white">
                              {formatNumber(position.size, position.asset === "ETHUSDT" ? 1 : 2)}
                            </strong>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span>Entry {formatCurrency(position.entry)}</span>
                            <span>Mark {formatCurrency(position.mark)}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span>Confidence {(position.confidence * 100).toFixed(0)}%</span>
                            <span>Conviction {position.conviction}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Sparkline
                          data={position.history}
                          stroke={isLong ? "#34d399" : "#fb7185"}
                        />
                        <div className="text-right">
                          <p className={`text-2xl font-semibold ${pnlColor}`}>
                            {formatCurrency(pnl)}
                          </p>
                          <p className={`text-sm ${pnlColor}`}>{formatPercent(pnlPercent)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Stop control</span>
                          <span>{formatCurrency(stopPrice)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                          <MoveDown size={16} className="text-cyan-300" />
                          {formatPercent(position.stopPercent)}
                        </div>
                        <input
                          type="range"
                          min={0.4}
                          max={12}
                          step={0.1}
                          value={position.stopPercent}
                          onChange={(event) =>
                            handleAdjustStop(position.id, parseFloat(event.target.value))
                          }
                          className="mt-3 w-full [accent-color:#22d3ee]"
                        />
                        <div className="mt-3 flex gap-2 text-xs text-white/60">
                          <button
                            onClick={() => handleAdjustStop(position.id, position.stopPercent * 0.85)}
                            className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
                          >
                            Tighten
                          </button>
                          <button
                            onClick={() => handleAdjustStop(position.id, position.stopPercent * 1.15)}
                            className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
                          >
                            Widen
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Take profit</span>
                          <span>{formatCurrency(targetPrice)}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                          <MoveUp size={16} className="text-emerald-300" />
                          {formatPercent(position.tpPercent)}
                        </div>
                        <input
                          type="range"
                          min={1.2}
                          max={28}
                          step={0.2}
                          value={position.tpPercent}
                          onChange={(event) =>
                            handleAdjustTarget(position.id, parseFloat(event.target.value))
                          }
                          className="mt-3 w-full [accent-color:#34d399]"
                        />
                        <div className="mt-3 flex gap-2 text-xs text-white/60">
                          <button
                            onClick={() => handleAdjustTarget(position.id, position.tpPercent * 0.9)}
                            className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
                          >
                            Bank sooner
                          </button>
                          <button
                            onClick={() => handleAdjustTarget(position.id, position.tpPercent * 1.2)}
                            className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/30 hover:bg-white/10"
                          >
                            Stretch target
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/60">
                      <button
                        onClick={() => handleClose(position.id, 0.25)}
                        className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/40 hover:bg-white/10"
                      >
                        Close 25%
                      </button>
                      <button
                        onClick={() => handleClose(position.id, 0.5)}
                        className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/40 hover:bg-white/10"
                      >
                        Close 50%
                      </button>
                      <button
                        onClick={() => handleClose(position.id, 1)}
                        className="rounded-full border border-rose-400/50 px-4 py-2 text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/10"
                      >
                        Flat position
                      </button>
                      <button
                        onClick={() => handleFlip(position.id)}
                        className="flex items-center gap-2 rounded-full border border-emerald-400/40 px-4 py-2 text-emerald-200 transition hover:border-emerald-300 hover:bg-emerald-400/10"
                      >
                        Flip bias
                        <FlipHorizontal2 size={16} />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-[0.35rem] text-white/50">
                  {`{indicators}`} Intelligence Layer
                </h2>
                <TrendingUp size={18} className="text-emerald-300" />
              </div>
              <div className="mt-4 grid gap-4">
                {indicators.map((indicator) => (
                  <div
                    key={indicator.name}
                    className={`rounded-2xl border border-white/5 bg-gradient-to-r ${gradientByBias[indicator.bias]} p-[1px]`}
                  >
                    <div className="rounded-[1.4rem] bg-black/70 p-4 backdrop-blur-2xl">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>{indicator.shorthand}</span>
                        <span
                          className={`text-xs font-semibold uppercase tracking-[0.35rem] ${
                            indicator.bias === "Bullish"
                              ? "text-emerald-200"
                              : indicator.bias === "Bearish"
                              ? "text-rose-200"
                              : "text-white/60"
                          }`}
                        >
                          {indicator.bias}
                        </span>
                      </div>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-semibold text-white">
                            {indicator.format === "percent"
                              ? formatPercent(indicator.value, 2)
                              : indicator.format === "price"
                              ? formatCurrency(indicator.value)
                              : indicator.value.toFixed(0)}
                          </p>
                          <p
                            className={`text-xs ${
                              indicator.change >= 0 ? "text-emerald-200" : "text-rose-200"
                            }`}
                          >
                            {indicator.change >= 0 ? "+" : ""}
                            {indicator.change.toFixed(2)} Δ
                          </p>
                        </div>
                        <p className="max-w-[60%] text-xs text-white/60">
                          {indicator.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SentimentGauge value={fearGreed} />

            <div className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-[0.35rem] text-white/50">
                  {`{liquidations}`} Snapback Radar
                </h2>
                <Zap size={18} className="text-cyan-300" />
              </div>
              <div className="mt-4 space-y-4">
                {liquidations.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <span className="font-semibold">{event.symbol}</span>
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/50">
                          {event.exchange}
                        </span>
                        <span className={`text-xs font-semibold uppercase ${intensityPalette[event.intensity]}`}>
                          {event.intensity}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-white/60">{event.reaction}</p>
                    </div>
                      <div className="text-right text-xs text-white/60">
                        <div className="font-semibold text-white/80">
                          {formatCurrency(event.notional)}
                        </div>
                        <div>{event.side} cleared</div>
                        <div>{timeSince(event.timestamp)} ago</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm uppercase tracking-[0.35rem] text-white/50">
              {`{Market_calendar}`} Catalyst Map
            </h2>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <CalendarDays size={16} />
              Pause high risk pairs automatically pre-event
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {marketCalendar.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <div>
                  <div className="flex items-center justify-between text-white">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25rem] ${impactPalette[event.impact]}`}
                    >
                      {event.impact}
                    </span>
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.4rem] text-white/50">
                    {event.market}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-white/60">
                    <span>In {timeUntil(event.datetime)}</span>
                    <span>{new Date(event.datetime).toLocaleString()}</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/70">{event.play}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {strategyPillars.map((pillar, index) => (
            <motion.article
              key={pillar.tag}
              className="rounded-3xl border border-white/10 bg-black/60 p-6 backdrop-blur-2xl"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.12, duration: 0.5 }}
            >
              <div className="text-xs uppercase tracking-[0.35rem] text-cyan-200">
                {pillar.tag}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm text-white/70">{pillar.description}</p>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                {pillar.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <Sparkles size={16} className="mt-0.5 text-emerald-300" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 via-cyan-400/10 to-emerald-400/5 p-8 backdrop-blur-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Deploy the 1000x-awarded AI strategy stack with a single click.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                No API keys, no manual wiring. The agent executes playbooks, syncs risk
                overlays, and keeps you locked on the highest-probability side of BTC,
                GOLDUSD, and ETH.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://agentic-72565415.vercel.app"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
              >
                View live deployment
                <ArrowUpRight size={16} />
              </a>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-[0_20px_60px_-24px_rgba(56,189,248,0.45)]">
                Sync with my desk
              </button>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
