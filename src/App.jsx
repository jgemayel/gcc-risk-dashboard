import { useState, useEffect, useCallback } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const C = {
  bg: "#080b12", card: "#0d1117", cardAlt: "#111820", border: "#1b2535",
  red: "#ef4444", orange: "#f97316", amber: "#f59e0b", green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6", pink: "#ec4899", cyan: "#06b6d4",
  text: "#e2e8f0", muted: "#64748b", dim: "#475569",
};
const CC = { "Saudi Arabia": "#f59e0b", UAE: "#3b82f6", Qatar: "#8b5cf6", Kuwait: "#ef4444", Oman: "#10b981", Bahrain: "#ec4899" };
const riskColor = (s) => s >= 80 ? C.red : s >= 65 ? C.orange : s >= 45 ? C.amber : C.green;
const riskLabel = (s) => s >= 80 ? "CRITICAL" : s >= 65 ? "HIGH" : s >= 45 ? "ELEVATED" : "MODERATE";

const CONFLICT_META = {
  name: "Operation Epic Fury",
  startDate: "2026-02-28",
  dayCount: () => { const d = new Date(); const s = new Date("2026-02-28"); return Math.max(1, Math.ceil((d - s) / 86400000)); },
};

const countries = [
  {
    name: "Saudi Arabia", pop: 36.9, oilProd: 9.0, oilExport: 6.3, gasSelf: false,
    gasNote: "Burns oil for 39% of electricity. 300k bbl/day for desalination alone.",
    foodImport: 85, desalPct: 70, elecPeakGW: 72.9, elecGas: 61, elecOil: 39, waterDays: 2,
    preWar: { food: 62, water: 72, electricity: 55, chokepoint: 45, fiscal: 40, climate: 78, military: 35 },
    wartime: { food: 72, water: 78, electricity: 62, chokepoint: 88, fiscal: 55, infra: 48, military: 52 },
    warStatus: "TARGETED", warDetail: "Repelled attacks on Riyadh and Eastern Province. Condemned 'blatant Iranian aggression.' MBS authorized potential counterattack. Coordinating unified GCC response.",
    infraHits: ["Riyadh area (intercepted)", "Eastern Province oil facilities (minor damage)", "Al-Udeid adjacent areas"],
    keyRisk: "Only GCC state with Red Sea access. East-West pipeline (5 Mbpd) becomes critical if Hormuz stays closed. Burns 1/3 of oil production domestically.",
    altRoute: { text: "East-West Pipeline to Yanbu (Red Sea), 5 Mbpd. Only GCC state with Red Sea access.", viability: "PARTIAL" },
    scenarios: [
      { name: "Hormuz closure 2+ weeks", sev: 75, impact: "Oil revenue drops ~60%. East-West Pipeline maxed at 5 Mbpd. Fiscal breakeven breach." },
      { name: "Strike on Jubail desalination", sev: 95, impact: "90% of Riyadh water cut. Evacuation within 7 days per leaked US cables." },
      { name: "Oil spike to $130/bbl", sev: 25, impact: "Massive fiscal windfall IF exports reach market. Incentive to keep conflict contained." },
      { name: "Prolonged conflict (30+ days)", sev: 70, impact: "Vision 2030 freezes. FDI collapses. Tourism halted. Expat exodus begins." },
    ],
  },
  {
    name: "UAE", pop: 10.1, oilProd: 3.4, oilExport: 2.6, gasSelf: false,
    gasNote: "Imports gas from Qatar via Dolphin pipeline. Barakah nuclear ~6% of power.",
    foodImport: 85, desalPct: 42, elecPeakGW: 34.0, elecGas: 94, elecOil: 0, waterDays: 2,
    preWar: { food: 58, water: 55, electricity: 42, chokepoint: 70, fiscal: 35, climate: 65, military: 30 },
    wartime: { food: 82, water: 75, electricity: 68, chokepoint: 95, infra: 88, fiscal: 72, military: 65 },
    warStatus: "UNDER ATTACK", warDetail: "Heaviest hit. 165 ballistic missiles, 2 cruise, 541 drones in 48hrs. DXB Terminal 3 hit. Jebel Ali fire. Burj Al Arab facade fire. Abu Dhabi airport (1 dead). Embassy Tehran closed. Markets shut.",
    infraHits: ["DXB Terminal 3", "Jebel Ali Port (fire, ops halted)", "Burj Al Arab facade", "Abu Dhabi Zayed Airport (1 killed)", "Fairmont Palm Jumeirah", "Sharjah industrial area", "Al Salam Naval Base AUH", "Etihad Towers AUH", "ICAD & Mussaffah", "Al Hamra RAK"],
    keyRisk: "88% expat pop. Jebel Ali + free zone = 36% of Dubai GDP. Airspace closed. 'Dubai ultimate nightmare' per ECFR.",
    altRoute: { text: "ADCOP pipeline to Fujairah (outside Hormuz), 1.5 Mbpd. Fujairah still near conflict zone.", viability: "LIMITED" },
    scenarios: [
      { name: "Jebel Ali closed 1+ week", sev: 92, impact: "36% of Dubai GDP disrupted. Supply chain collapse. Container rerouting adds weeks." },
      { name: "Airspace stays closed", sev: 88, impact: "Emirates/Etihad grounded. Tourism (15% GDP) collapses. Tens of thousands stranded." },
      { name: "Expat confidence collapse", sev: 85, impact: "88% expat pop. Mass departures. Real estate crash. Safe haven brand destroyed." },
      { name: "Dolphin pipeline disrupted", sev: 90, impact: "Gas from Qatar cut. 94% electricity gas-powered. Barakah only 6%. Rolling blackouts." },
    ],
  },
  {
    name: "Qatar", pop: 2.7, oilProd: 1.3, oilExport: 0.5, gasSelf: true,
    gasNote: "World's 3rd largest gas reserves. LNG output rising to 142 Mtpa by 2030.",
    foodImport: 90, desalPct: 99, elecPeakGW: 9.81, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 75, water: 82, electricity: 30, chokepoint: 80, fiscal: 25, climate: 70, military: 40 },
    wartime: { food: 90, water: 88, electricity: 52, chokepoint: 95, infra: 70, fiscal: 45, military: 55 },
    warStatus: "UNDER ATTACK", warDetail: "65 missiles, 12 drones. 16 injured (1 critical). Al-Udeid targeted. Explosions across Doha Sunday. Thick smoke over southern Doha.",
    infraHits: ["Al-Udeid Air Base vicinity", "Southern Doha (explosions)", "Intercepted missiles over Doha"],
    keyRisk: "99% desal. 90% food imported. Hormuz closure traps ALL LNG exports. Revenue collapse swift. 1.5 days water reserves.",
    altRoute: { text: "No pipeline bypass. 100% of LNG transits Hormuz. $80B North Field expansion at risk.", viability: "NONE" },
    scenarios: [
      { name: "Hormuz traps LNG fleet", sev: 95, impact: "World's largest LNG exporter frozen. Entire export revenue halted. Asian buyers scramble." },
      { name: "Al-Udeid escalation", sev: 80, impact: "US ops from base make Qatar primary target. Civilian Doha at extreme risk." },
      { name: "Food imports severed", sev: 75, impact: "90% food via Hormuz. 300k MT rice silos tested. Rationing within 2-3 weeks." },
      { name: "Mediation role collapses", sev: 60, impact: "Diplomatic bridge to Iran destroyed. Post-war influence diminished." },
    ],
  },
  {
    name: "Kuwait", pop: 4.9, oilProd: 2.7, oilExport: 1.9, gasSelf: false,
    gasNote: "Imports gas from Qatar. Repeated power cuts 2024-2025 in peacetime.",
    foodImport: 90, desalPct: 90, elecPeakGW: 17.64, elecGas: 99, elecOil: 1, waterDays: 1,
    preWar: { food: 72, water: 88, electricity: 78, chokepoint: 85, fiscal: 50, climate: 82, military: 50 },
    wartime: { food: 88, water: 92, electricity: 90, chokepoint: 95, infra: 72, fiscal: 68, military: 62 },
    warStatus: "UNDER ATTACK", warDetail: "Air base runway 'significantly damaged' per Italian FM. Naval base drone intercepted. Sirens nationwide.",
    infraHits: ["Air base runway (significant damage)", "Naval base (drone intercepted)", "Air defense activated nationwide"],
    keyRisk: "Most vulnerable. 90% desal, 90% food imports, gas deficit, 1 day water reserves. Grid already failing pre-war.",
    altRoute: { text: "No alternative routes. Fully landlocked to Gulf. 100% Hormuz dependent.", viability: "NONE" },
    scenarios: [
      { name: "Gas imports disrupted", sev: 95, impact: "99% gas-fired power. No surplus. Grid collapse in days. Desal stops. 1 day water." },
      { name: "Summer peak + conflict", sev: 92, impact: "17.64 GW peak. Already had peacetime blackouts. Grid failure near-certain." },
      { name: "Food chain severed", sev: 88, impact: "90% food imported via Hormuz. 4.9M faces rationing in 2 weeks." },
      { name: "Oil exports stranded", sev: 85, impact: "1.9 Mbpd stranded. Just passed debt law 2025. Limited borrowing." },
    ],
  },
  {
    name: "Oman", pop: 5.2, oilProd: 1.1, oilExport: 0.8, gasSelf: true,
    gasNote: "Slight gas surplus. Port of Duqm on Indian Ocean but already hit by drone.",
    foodImport: 80, desalPct: 86, elecPeakGW: 8.4, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 65, water: 75, electricity: 48, chokepoint: 40, fiscal: 60, climate: 72, military: 45 },
    wartime: { food: 75, water: 80, electricity: 55, chokepoint: 65, infra: 55, fiscal: 65, military: 58 },
    warStatus: "TARGETED", warDetail: "Duqm port hit by drone. FM said US 'duped into war by Israelis.' Oil tanker struck offshore. Mediator role destroyed.",
    infraHits: ["Port of Duqm (drone strike)", "Oil tanker struck offshore", "Maritime infra at risk"],
    keyRisk: "Duqm was the safe Hormuz alternative. Its targeting changes strategic calculus. FM's rebuke of US is notable.",
    altRoute: { text: "Duqm on Indian Ocean (outside Hormuz). Hit once but partially viable.", viability: "PARTIAL" },
    scenarios: [
      { name: "Duqm as bypass route", sev: 40, impact: "Could bypass Hormuz. But already hit once, insurance uncertain." },
      { name: "Mediator credibility gone", sev: 70, impact: "Unique position with Iran erased. Post-war influence shifts." },
      { name: "Tanker attacks off coast", sev: 75, impact: "Even outside Hormuz, shipping insurance surges. Maritime economy hit." },
      { name: "Fiscal strain", sev: 60, impact: "Gas self-sufficient but limited reserves. Prices help only if exports flow." },
    ],
  },
  {
    name: "Bahrain", pop: 1.5, oilProd: 0.2, oilExport: 0.04, gasSelf: false,
    gasNote: "Production barely meets demand. Hosts US 5th Fleet. Most exposed militarily.",
    foodImport: 85, desalPct: 60, elecPeakGW: 3.8, elecGas: 99, elecOil: 0, waterDays: 1,
    preWar: { food: 70, water: 68, electricity: 65, chokepoint: 82, fiscal: 72, climate: 75, military: 55 },
    wartime: { food: 85, water: 82, electricity: 78, chokepoint: 95, infra: 82, fiscal: 80, military: 85 },
    warStatus: "UNDER ATTACK", warDetail: "5th Fleet HQ hit. 45 missiles, 9 drones intercepted. Shahed-136 into Manama apartment. Airport struck.",
    infraHits: ["US 5th Fleet HQ (partial hit)", "Manama apartment (Shahed drone)", "Bahrain Intl Airport", "Civilian areas (debris)"],
    keyRisk: "Smallest, most vulnerable. 5th Fleet = primary target. Fuels 1/3 of revenue. 1 day water. Small island, nowhere to shelter.",
    altRoute: { text: "Negligible exports. Connected to Saudi via causeway.", viability: "N/A" },
    scenarios: [
      { name: "5th Fleet escalation", sev: 92, impact: "Primary US naval HQ draws max fire. 1.5M on small island, nowhere to go." },
      { name: "Residential casualties", sev: 88, impact: "Drone in apartment sets precedent. Any miss hits civilians. Instability risk." },
      { name: "Fiscal collapse", sev: 78, impact: "0.04 Mbpd exports. Fuels 1/3 revenue. Needs Saudi/GCC financial support." },
      { name: "Water + power failure", sev: 90, impact: "Gas barely meets demand. 1 day reserves. Any infra hit cascades." },
    ],
  },
];

const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
};

const Pulse = ({ color, size = 8 }) => (<span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size}px ${color}`, animation: "pulse 2s infinite", flexShrink: 0 }} />);

const Badge = ({ score, small }) => { const col = riskColor(score); return (<span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "1px 6px" : "2px 10px", borderRadius: 16, fontSize: small ? 9 : 11, fontWeight: 700, color: col, border: `1px solid ${col}30`, background: `${col}12`, whiteSpace: "nowrap", flexShrink: 0 }}><Pulse color={col} size={small ? 4 : 6} />{riskLabel(score)} {score}</span>); };

const StatusBadge = ({ status }) => { const col = status === "UNDER ATTACK" ? C.red : C.orange; return (<span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800, color: col, background: `${col}15`, border: `1px solid ${col}30`, whiteSpace: "nowrap", flexShrink: 0 }}><Pulse color={col} size={5} />{status}</span>); };

const Card = ({ children, style = {}, glow }) => (<div style={{ background: C.card, border: `1px solid ${glow ? `${C.red}30` : C.border}`, borderRadius: 10, padding: 16, ...(glow ? { boxShadow: "0 0 16px rgba(185,28,28,0.06)" } : {}), ...style }}>{children}</div>);

const Ttl = ({ children, sub, warning }) => (<div style={{ marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: warning ? C.red : C.amber, letterSpacing: "0.07em", textTransform: "uppercase" }}>{children}</h3>{warning && <Pulse color={C.red} size={5} />}</div>{sub && <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{sub}</p>}</div>);

const MiniBar = ({ value, max = 100, color, label }) => (<div style={{ marginBottom: 7 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: C.muted }}>{label}</span><span style={{ fontSize: 10, fontWeight: 700, color }}>{value}%</span></div><div style={{ height: 3, background: "#1a2332", borderRadius: 2 }}><div style={{ height: 3, borderRadius: 2, background: color, width: `${Math.min((value / max) * 100, 100)}%`, transition: "width 0.5s" }} /></div></div>);

const WarBanner = ({ mobile }) => (<div style={{ background: "linear-gradient(90deg,rgba(185,28,28,0.06),transparent,rgba(185,28,28,0.06))", border: `1px solid ${C.red}20`, borderRadius: 8, padding: mobile ? "10px 12px" : "12px 18px", marginBottom: 16, display: "flex", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 10, flexDirection: mobile ? "column" : "row" }}><div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}><Pulse color={C.red} size={10} /><div><span style={{ fontSize: mobile ? 11 : 13, fontWeight: 800, color: C.red }}>ACTIVE CONFLICT: OPERATION EPIC FURY</span><p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, lineHeight: 1.4 }}>US-Israel strikes on Iran began Feb 28. Khamenei killed. Iran retaliating across all 6 GCC states. Hormuz de facto closed.</p></div></div><div style={{ textAlign: mobile ? "left" : "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.red, fontFamily: "monospace" }}>DAY {CONFLICT_META.dayCount()}</div><div style={{ fontSize: 9, color: C.muted }}>Conflict ongoing</div></div></div>);

const KPIStrip = ({ mobile }) => {
  const kpis = [
    { label: "Hormuz", value: "CLOSED", sub: "70% traffic drop", color: C.red },
    { label: "Brent", value: "$80+", sub: "$100-130 if sustained", color: C.orange },
    { label: "States Hit", value: "6 / 6", sub: "All GCC targeted", color: C.red },
    { label: "UAE Hits", value: "708+", sub: "3 killed, 58 injured", color: C.orange },
    { label: "Jebel Ali", value: "HALTED", sub: "36% Dubai GDP", color: C.red },
    { label: "Airspace", value: "CLOSED", sub: "All Gulf hubs", color: C.red },
  ];
  return (<div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>{kpis.map((k) => (<Card key={k.label} glow={k.color === C.red} style={{ padding: "8px 10px", borderTop: `2px solid ${k.color}` }}><div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{k.label}</div><div style={{ fontSize: mobile ? 12 : 14, fontWeight: 800, color: k.color, fontFamily: "monospace", lineHeight: 1.2 }}>{k.value}</div><div style={{ fontSize: 8, color: C.dim, marginTop: 1 }}>{k.sub}</div></Card>))}</div>);
};

const Heatmap = ({ onSelect, selected, mobile }) => {
  const metrics = ["food", "water", "electricity", "chokepoint", "infra", "fiscal", "military"];
  return (<Card style={mobile ? {} : { gridColumn: "span 2" }}><Ttl warning sub="Tap a country for deep dive">Wartime Risk</Ttl><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{countries.map((c) => { const comp = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length); return (<div key={c.name} onClick={() => onSelect(c)} style={{ padding: "10px 12px", borderRadius: 8, background: C.cardAlt, border: `1px solid ${selected?.name === c.name ? CC[c.name] : C.border}`, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: CC[c.name], flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 700, color: CC[c.name] }}>{c.name}</span></div><StatusBadge status={c.warStatus} /></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{metrics.map((m) => (<span key={m} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: `${riskColor(c.wartime[m])}12`, color: riskColor(c.wartime[m]), fontWeight: 600 }}>{m.slice(0, 4)} {c.wartime[m]}</span>))}</div><Badge score={comp} small /></div></div>); })}</div></Card>);
};

const InfraTracker = ({ mobile }) => (<Card glow style={mobile ? {} : { gridColumn: "span 2" }}><Ttl warning sub="Confirmed hits, first 48 hours">Infrastructure Damage</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>{countries.map((c) => (<div key={c.name} style={{ padding: 10, borderRadius: 6, background: C.cardAlt, border: `1px solid ${c.warStatus === "UNDER ATTACK" ? C.red : C.orange}15` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: CC[c.name] }}>{c.name}</span><StatusBadge status={c.warStatus} /></div><div style={{ maxHeight: 90, overflowY: "auto" }}>{c.infraHits.map((h, i) => (<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 3 }}><span style={{ color: C.red, fontSize: 6, marginTop: 4, flexShrink: 0 }}>●</span><span style={{ fontSize: 10, color: C.text, lineHeight: 1.3 }}>{h}</span></div>))}</div></div>))}</div></Card>);

const NexusPanel = () => (<Card><Ttl sub="How the war cascades across systems">Nexus Risks</Ttl>{[{ icon: "🔥", t: "Hormuz → Revenue → Food", lev: C.red, b: "Blocks exports (revenue) and food imports simultaneously." },{ icon: "💧", t: "Gas → Desal → Water", lev: C.red, b: "UAE/Kuwait import gas for desal. Disruption = water failure in 1-2 days." },{ icon: "✈️", t: "Airspace → Tourism → Expats", lev: C.orange, b: "All airspace closed. Emirates/QA grounded. 88% of UAE is expat." },{ icon: "🏗️", t: "Infra Hits → Investor Flight", lev: C.orange, b: "Jebel Ali, DXB, Burj Al Arab hit. Markets closed. Vision 2030 frozen." }].map((n) => (<div key={n.t} style={{ padding: "8px 10px", borderRadius: 5, background: `${n.lev}05`, border: `1px solid ${n.lev}15`, marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}><span>{n.icon}</span><span style={{ fontSize: 10, fontWeight: 700, color: n.lev, textTransform: "uppercase" }}>{n.t}</span></div><p style={{ margin: 0, fontSize: 10, color: C.text, lineHeight: 1.4 }}>{n.b}</p></div>))}</Card>);

const HormuzPanel = ({ mobile }) => (<Card glow><Ttl warning sub="De facto closure since Feb 28">Strait of Hormuz</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>{[{ l: "Normal transit", v: "20M bbl/d", c: C.muted },{ l: "Traffic drop", v: "~70%", c: C.red },{ l: "Anchored", v: "150+", c: C.orange },{ l: "Struck", v: "3 tankers", c: C.red },{ l: "Insurance", v: "CANCELLED", c: C.red },{ l: "Carriers", v: "ALL HALTED", c: C.red }].map((r) => (<div key={r.l} style={{ padding: "5px 7px", background: C.cardAlt, borderRadius: 4 }}><div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase" }}>{r.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: r.c, fontFamily: "monospace" }}>{r.v}</div></div>))}</div><div style={{ padding: 8, background: `${C.red}06`, borderRadius: 5, border: `1px solid ${C.red}12` }}><p style={{ margin: 0, fontSize: 10, color: C.text, lineHeight: 1.5 }}>⚠️ IRGC VHF warnings + tanker strikes + insurance withdrawal = closure. JPMorgan forecasts $100-130/bbl if sustained.</p></div></Card>);

const ExportRoutes = ({ mobile }) => (<Card style={mobile ? {} : { gridColumn: "span 2" }}><Ttl sub="Hormuz bypass options by country">Export Alternatives</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>{countries.map((c) => { const vCol = c.altRoute.viability === "NONE" ? C.red : c.altRoute.viability === "PARTIAL" ? C.amber : C.dim; return (<div key={c.name} style={{ padding: 10, borderRadius: 6, background: C.cardAlt, border: `1px solid ${vCol}18` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: CC[c.name] }}>{c.name}</span><span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: `${vCol}15`, color: vCol, fontWeight: 700 }}>{c.altRoute.viability}</span></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{c.altRoute.text}</p></div>); })}</div></Card>);

const CountryDeepDive = ({ country: c, mobile }) => {
  const radarData = Object.entries(c.wartime).map(([k, v]) => ({ metric: k.charAt(0).toUpperCase() + k.slice(1), score: v }));
  const preRadar = Object.entries(c.preWar).map(([k, v]) => ({ metric: k.charAt(0).toUpperCase() + k.slice(1), score: v }));
  const comp = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length);
  return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card glow={c.warStatus === "UNDER ATTACK"}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: CC[c.name] }}>{c.name}</h2>
        <StatusBadge status={c.warStatus} /><Badge score={comp} />
      </div>
      <p style={{ margin: "0 0 8px", fontSize: 11, color: C.muted }}>Pop: {c.pop}M | Oil: {c.oilProd} Mbpd | Export: {c.oilExport} Mbpd | Peak: {c.elecPeakGW} GW</p>
      <div style={{ padding: 10, background: `${C.red}05`, borderRadius: 6, border: `1px solid ${C.red}12` }}>
        <p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.6 }}>{c.warDetail}</p>
      </div>
    </Card>
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
      <Card>
        <Ttl sub="Pre-war (dashed) vs wartime (filled)">Risk Radar</Ttl>
        <ResponsiveContainer width="100%" height={mobile ? 220 : 250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} /><PolarAngleAxis dataKey="metric" tick={{ fill: C.muted, fontSize: mobile ? 8 : 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Wartime" dataKey="score" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Pre-war" dataKey="score" data={preRadar} stroke={C.amber} fill="none" strokeWidth={1} strokeDasharray="4 4" />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 4 }}><span style={{ fontSize: 9, color: C.red }}>━━ Wartime</span><span style={{ fontSize: 9, color: C.amber }}>╌╌ Pre-war</span></div>
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <Ttl>Dependencies</Ttl>
          <MiniBar value={c.foodImport} color={riskColor(c.wartime.food)} label="Food Import" />
          <MiniBar value={c.desalPct} color={riskColor(c.wartime.water || 70)} label="Desalination" />
          <MiniBar value={c.elecGas} color={c.elecGas > 95 ? C.orange : C.blue} label="Gas for Electricity" />
          <div style={{ padding: "6px 8px", background: C.cardAlt, borderRadius: 4, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 9, color: C.muted }}>Water reserves</span><span style={{ fontSize: 9, fontWeight: 700, color: c.waterDays <= 1 ? C.red : C.orange }}>{c.waterDays} days</span></div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>Gas self-sufficient: <span style={{ color: c.gasSelf ? C.green : C.red, fontWeight: 700 }}>{c.gasSelf ? "YES" : "NO"}</span></div>
            <p style={{ margin: "4px 0 0", fontSize: 9, color: C.dim, lineHeight: 1.3 }}>{c.gasNote}</p>
          </div>
        </Card>
        <Card><Ttl warning>Confirmed Hits</Ttl>{c.infraHits.map((h, i) => (<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 3 }}><span style={{ color: C.red, fontSize: 6, marginTop: 3, flexShrink: 0 }}>●</span><span style={{ fontSize: 10, color: C.text, lineHeight: 1.3 }}>{h}</span></div>))}</Card>
      </div>
    </div>
    <Card style={{ borderLeft: `3px solid ${CC[c.name]}` }}><Ttl>Strategic Assessment</Ttl><p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.6 }}>{c.keyRisk}</p></Card>
    <Card glow><Ttl warning sub={`War scenarios for ${c.name}`}>Wartime Scenarios</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>{c.scenarios.map((sc) => (<div key={sc.name} style={{ padding: 12, borderRadius: 6, background: `${riskColor(sc.sev)}05`, border: `1px solid ${riskColor(sc.sev)}15` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, gap: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.3, flex: 1 }}>{sc.name}</span><Badge score={sc.sev} small /></div><div style={{ height: 3, background: "#1a2332", borderRadius: 2, marginBottom: 6 }}><div style={{ height: 3, borderRadius: 2, background: riskColor(sc.sev), width: `${sc.sev}%` }} /></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{sc.impact}</p></div>))}</div></Card>
  </div>);
};

export default function App() {
  const mobile = useIsMobile();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const refresh = () => setLastRefresh(new Date());

  const tabs = [
    { key: "overview", label: mobile ? "Overview" : "Situation Overview" },
    { key: "supply", label: mobile ? "Hormuz" : "Supply Chain & Hormuz" },
    { key: "country", label: selected ? (mobile ? selected.name : `Deep Dive: ${selected.name}`) : "Select Country" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: mobile ? "10px" : "18px 24px", maxWidth: 1400, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", marginBottom: 10, flexDirection: mobile ? "column" : "row", gap: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: mobile ? 15 : 18, fontWeight: 800, color: C.text }}>GCC Resource Risk Dashboard</h1>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: `${C.red}20`, color: C.red, fontWeight: 800 }}>⚠ WARTIME</span>
          </div>
          <p style={{ margin: "1px 0 0", fontSize: 10, color: C.muted }}>Iran Conflict Impact | Oil, Gas, Food, Water, Electricity, Infrastructure</p>
        </div>
        <button onClick={refresh} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.cardAlt, color: C.amber, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          ↻ {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </button>
      </div>

      <WarBanner mobile={mobile} />
      <KPIStrip mobile={mobile} />

      <div style={{ display: "flex", gap: 2, marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 6, overflowX: "auto" }}>
        {tabs.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} style={{ padding: mobile ? "6px 10px" : "6px 14px", borderRadius: "4px 4px 0 0", border: "none", background: tab === t.key ? `${C.red}12` : "transparent", color: tab === t.key ? C.red : C.muted, fontSize: mobile ? 10 : 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, borderBottom: tab === t.key ? `2px solid ${C.red}` : "2px solid transparent" }}>{t.label}</button>))}
      </div>

      {tab === "overview" && (<div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <Heatmap onSelect={(c) => { setSelected(c); setTab("country"); }} selected={selected} mobile={mobile} />
        <InfraTracker mobile={mobile} />
        <NexusPanel />
        <Card>
          <Ttl sub="Risk score shift since Feb 28">Pre-War vs Wartime</Ttl>
          <ResponsiveContainer width="100%" height={mobile ? 180 : 220}>
            <BarChart data={countries.map((c) => ({ name: c.name.replace("Saudi Arabia", "KSA"), pre: Math.round(Object.values(c.preWar).reduce((a, b) => a + b, 0) / Object.values(c.preWar).length), war: Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length) }))} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: mobile ? 9 : 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.text }} />
              <Bar dataKey="pre" name="Pre-war" fill={C.amber} radius={[3, 3, 0, 0]} opacity={0.4} />
              <Bar dataKey="war" name="Wartime" fill={C.red} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>)}

      {tab === "supply" && (<div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <HormuzPanel mobile={mobile} />
        <Card><Ttl warning sub="Route disruptions">Supply Chain</Ttl>{[{ r: "Strait of Hormuz", s: "CLOSED", d: "IRGC warnings + strikes + insurance = closure.", sev: 95 },{ r: "Bab al-Mandab", s: "SUSPENDED", d: "Maersk paused. CMA CGM rerouting via Cape.", sev: 85 },{ r: "Jebel Ali Port", s: "HALTED", d: "Fire from debris. DP World suspended.", sev: 90 },{ r: "Gulf Airspace", s: "CLOSED", d: "All Gulf hubs shut. Thousands stranded.", sev: 92 }].map((r) => (<div key={r.r} style={{ padding: "8px 10px", borderRadius: 5, background: `${riskColor(r.sev)}05`, border: `1px solid ${riskColor(r.sev)}12`, marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{r.r}</span><span style={{ fontSize: 9, fontWeight: 800, color: riskColor(r.sev), fontFamily: "monospace", flexShrink: 0 }}>{r.s}</span></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{r.d}</p></div>))}</Card>
        <ExportRoutes mobile={mobile} />
      </div>)}

      {tab === "country" && selected && <CountryDeepDive country={selected} mobile={mobile} />}
      {tab === "country" && !selected && (<Card style={{ textAlign: "center", padding: 32 }}><p style={{ fontSize: 12, color: C.muted }}>Tap a country in <span style={{ color: C.red, cursor: "pointer" }} onClick={() => setTab("overview")}>Overview</span> for deep dive.</p></Card>)}

      <div style={{ marginTop: 18, padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
        <p style={{ margin: 0, fontSize: 8, color: C.dim, lineHeight: 1.5 }}>Sources: Atlantic Council, CSIS, Al Jazeera, CNBC, Reuters, Breaking Defense, Fortune, Euronews, The National, MEE, FDD, Kpler, gCaptain (Mar 2, 2026). Pre-war: DNV ETO 2026, OPEC ASB 2025, World Bank, WEF, Strategy&. Not financial or military advice.</p>
      </div>
    </div>
  );
}
