import { useState, useEffect, useCallback } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const C = {
  bg: "#080b12", card: "#0d1117", cardAlt: "#111820", border: "#1b2535", borderActive: "#2a3a52",
  red: "#ef4444", redGlow: "#dc262640", orange: "#f97316", amber: "#f59e0b", green: "#10b981", blue: "#3b82f6", purple: "#8b5cf6", pink: "#ec4899", cyan: "#06b6d4",
  text: "#e2e8f0", muted: "#64748b", dim: "#475569",
  warRed: "#b91c1c", warGlow: "rgba(185,28,28,0.08)",
};

const CC = { "Saudi Arabia": "#f59e0b", UAE: "#3b82f6", Qatar: "#8b5cf6", Kuwait: "#ef4444", Oman: "#10b981", Bahrain: "#ec4899" };

const riskColor = (s) => s >= 80 ? C.red : s >= 65 ? C.orange : s >= 45 ? C.amber : C.green;
const riskLabel = (s) => s >= 80 ? "CRITICAL" : s >= 65 ? "HIGH" : s >= 45 ? "ELEVATED" : "MODERATE";

// ── DATA ──
const countries = [
  {
    name: "Saudi Arabia", pop: 36.9, oilProd: 9.0, oilExport: 6.3, gasSelf: false,
    gasNote: "Burns oil for 39% of electricity. No gas imports. 300k bbl/day just for desalination.",
    foodImport: 85, desalPct: 70, elecPeakGW: 72.9, elecGas: 61, elecOil: 39, waterDays: 2,
    preWar: { food: 62, water: 72, electricity: 55, chokepoint: 45, fiscal: 40, climate: 78, military: 35 },
    wartime: { food: 72, water: 78, electricity: 62, chokepoint: 88, fiscal: 55, infrastructure: 48, military: 52 },
    warStatus: "TARGETED",
    warDetail: "Repelled attacks on Riyadh and Eastern Province. IRGC missiles targeted oil infrastructure. KSA condemned 'blatant Iranian aggression' and authorized potential counterattack if strikes continue. MBS coordinating unified GCC response.",
    infraHits: ["Riyadh area (intercepted)", "Eastern Province oil facilities (minor damage)", "Al-Udeid adjacent areas"],
    keyRisk: "Only GCC state with Red Sea access. If Hormuz stays closed, East-West pipeline (5 Mbpd capacity) becomes critical but runs through vulnerable terrain. Burns 1/3 of oil production domestically.",
    scenarioSpecific: [
      { scenario: "Hormuz closure extends 2+ weeks", severity: 75, impact: "Oil revenue drops ~60% (6.3 Mbpd stranded). East-West Pipeline at max 5 Mbpd. Fiscal breakeven breach within weeks." },
      { scenario: "Iranian strike on Jubail desalination", severity: 95, impact: "90% of Riyadh's water cut. Population evacuation within 7 days per leaked US cables. Catastrophic humanitarian crisis." },
      { scenario: "Oil price spike to $130/bbl", severity: 25, impact: "Massive fiscal windfall IF exports can reach market. Incentive to keep conflict contained while benefiting from price." },
      { scenario: "Prolonged conflict (30+ days)", severity: 70, impact: "Vision 2030 mega-projects freeze. FDI collapses. Tourism (Neom, Red Sea) halted. Expat exodus begins." },
    ],
  },
  {
    name: "UAE", pop: 10.1, oilProd: 3.4, oilExport: 2.6, gasSelf: false,
    gasNote: "Imports gas from Qatar via Dolphin pipeline. Nuclear (Barakah) provides ~6% of power.",
    foodImport: 85, desalPct: 42, elecPeakGW: 34.0, elecGas: 94, elecOil: 0, waterDays: 2,
    preWar: { food: 58, water: 55, electricity: 42, chokepoint: 70, fiscal: 35, climate: 65, military: 30 },
    wartime: { food: 82, water: 75, electricity: 68, chokepoint: 95, infrastructure: 88, fiscal: 72, military: 65 },
    warStatus: "UNDER ATTACK",
    warDetail: "Heaviest hit GCC state. 165 ballistic missiles, 2 cruise missiles, 541 drones over 48 hours. DXB Terminal 3 hit (4 injured). Jebel Ali Port fire. Burj Al Arab facade fire. Abu Dhabi airport hit (1 dead). Schools closed. Embassy in Tehran shuttered. ADX/DFM markets closed Mon-Tue.",
    infraHits: ["Dubai Intl Airport Terminal 3", "Jebel Ali Port (fire, ops suspended)", "Burj Al Arab (facade fire)", "Abu Dhabi Zayed Airport (1 killed)", "Fairmont Palm Jumeirah", "Sharjah industrial area", "Al Salam Naval Base Abu Dhabi", "Etihad Towers Abu Dhabi (debris)", "ICAD & Mussaffah warehouses", "Al Hamra Village RAK"],
    keyRisk: "88% expat population. Jebel Ali + free zone = 36% of Dubai GDP. Airspace closed. 'Dubai's ultimate nightmare' per ECFR. If conflict extends, capital flight and expat exodus could be catastrophic.",
    scenarioSpecific: [
      { scenario: "Jebel Ali port remains closed 1+ week", severity: 92, impact: "36% of Dubai GDP disrupted. Supply chain collapse for food, goods. Container rerouting adds weeks. Emergency reserves tested." },
      { scenario: "Continued airspace closure", severity: 88, impact: "Emirates/Etihad grounded. Tourism (15% of GDP) collapses. Tens of thousands stranded. Global aviation chaos (DXB = world's busiest)." },
      { scenario: "Expat confidence collapse", severity: 85, impact: "With 88% expat pop, mass departure drains economy. Real estate crash. Banking sector stress. 'Safe haven' brand destroyed." },
      { scenario: "Dolphin pipeline disruption", severity: 90, impact: "Gas imports from Qatar cut. 94% of electricity is gas-powered. Barakah nuclear provides only 6%. Rolling blackouts within days." },
    ],
  },
  {
    name: "Qatar", pop: 2.7, oilProd: 1.3, oilExport: 0.5, gasSelf: true,
    gasNote: "World's 3rd largest gas reserves. LNG output rising to 142 Mtpa by 2030. North Field expansion ongoing.",
    foodImport: 90, desalPct: 99, elecPeakGW: 9.81, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 75, water: 82, electricity: 30, chokepoint: 80, fiscal: 25, climate: 70, military: 40 },
    wartime: { food: 90, water: 88, electricity: 52, chokepoint: 95, infrastructure: 70, fiscal: 45, military: 55 },
    warStatus: "UNDER ATTACK",
    warDetail: "65 missiles and 12 drones launched. 16 injured (1 critical). Al-Udeid Air Base (largest US base in region) targeted. Israeli strikes on Doha occurred in Sept 2025. Doha explosions heard on Sunday morning. Thick smoke over southern Doha.",
    infraHits: ["Al-Udeid Air Base vicinity", "Southern Doha (smoke/explosions)", "Intercepted missiles over Doha"],
    keyRisk: "99% water from desalination. 90% food imported. Hormuz closure traps ALL LNG exports (world's largest LNG exporter). Revenue collapse would be swift. Only 1.5 days water reserves.",
    scenarioSpecific: [
      { scenario: "Hormuz closure traps LNG fleet", severity: 95, impact: "Qatar is world's largest LNG exporter. Entire export revenue frozen. $80B+ in North Field expansion at risk. Asian buyers scramble." },
      { scenario: "Al-Udeid base escalation", severity: 80, impact: "If US operations expand from Al-Udeid, Qatar becomes primary Iranian target. Civilian Doha at extreme risk given proximity." },
      { scenario: "99% desal + gas self-sufficiency paradox", severity: 65, impact: "Can power own desal plants (gas surplus) but food imports cut by Hormuz closure. 300,000 MT rice silos tested within weeks." },
      { scenario: "Mediation role collapses", severity: 60, impact: "Qatar's diplomatic bridge to Iran destroyed. Post-war regional influence diminished. Billions in mediation-linked investments at risk." },
    ],
  },
  {
    name: "Kuwait", pop: 4.9, oilProd: 2.7, oilExport: 1.9, gasSelf: false,
    gasNote: "Imports gas from Qatar. Repeated power cuts in 2024-2025. IRGC drone hit naval base.",
    foodImport: 90, desalPct: 90, elecPeakGW: 17.64, elecGas: 99, elecOil: 1, waterDays: 1,
    preWar: { food: 72, water: 88, electricity: 78, chokepoint: 85, fiscal: 50, climate: 82, military: 50 },
    wartime: { food: 88, water: 92, electricity: 90, chokepoint: 95, infrastructure: 72, fiscal: 68, military: 62 },
    warStatus: "UNDER ATTACK",
    warDetail: "Air base runway 'significantly damaged' by Iranian missile per Italian FM. Naval base targeted by drone (intercepted). Sirens heard across Kuwait. Called for 'calm and restraint.'",
    infraHits: ["Air base runway (significant damage, Italian forces present)", "Naval base (drone intercepted)", "Air defense systems activated across country"],
    keyRisk: "Most vulnerable GCC state pre-war. 90% desal, 90% food imports, gas deficit, only 1 day water reserves. Repeated power cuts already in peacetime. Electricity grid was already failing before conflict.",
    scenarioSpecific: [
      { scenario: "Gas imports from Qatar disrupted", severity: 95, impact: "99% of power is gas-fired. No domestic surplus. Grid collapse within days. Desalination stops. 1 day of water reserves." },
      { scenario: "Summer peak demand during conflict", severity: 92, impact: "Peak 17.64 GW demand + conflict damage. Already had rolling blackouts in peacetime. Grid failure near-certain if sustained." },
      { scenario: "Food supply chain fully severed", severity: 88, impact: "90% food imported. 90% of rice via Hormuz. Strategic reserves moderate. Population 4.9M faces rationing within 2 weeks." },
      { scenario: "Oil export halt (Hormuz dependent)", severity: 85, impact: "1.9 Mbpd exports stranded. Fiscal reserves stressed. Kuwait just passed debt law in 2025, limited borrowing capacity." },
    ],
  },
  {
    name: "Oman", pop: 5.2, oilProd: 1.1, oilExport: 0.8, gasSelf: true,
    gasNote: "Slight gas surplus. Port of Duqm on Indian Ocean (outside Hormuz). Hit by Iranian drone strike.",
    foodImport: 80, desalPct: 86, elecPeakGW: 8.4, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 65, water: 75, electricity: 48, chokepoint: 40, fiscal: 60, climate: 72, military: 45 },
    wartime: { food: 75, water: 80, electricity: 55, chokepoint: 65, infrastructure: 55, fiscal: 65, military: 58 },
    warStatus: "TARGETED",
    warDetail: "Port of Duqm hit by Iranian drone. FM Badr al-Busaidi expressed 'dismay,' accused US of being 'duped into war by Israelis.' Oil tanker struck off Oman's coast. Oman had been key mediator in US-Iran talks.",
    infraHits: ["Port of Duqm (drone strike)", "Oil tanker struck offshore", "Potential damage to maritime infrastructure"],
    keyRisk: "Duqm port was supposed to be the 'safe' alternative outside Hormuz. Its targeting changes the strategic calculus. Oman's mediator role destroyed. FM's public rebuke of US is notable.",
    scenarioSpecific: [
      { scenario: "Duqm port as alternative export route", severity: 40, impact: "If Hormuz stays blocked, Duqm becomes critical for Omani and potentially Saudi/UAE oil bypass. But it was already hit once." },
      { scenario: "Mediator credibility destroyed", severity: 70, impact: "Oman's unique diplomatic position with Iran erased. Post-war regional influence shifts. Economic partnerships with Iran frozen." },
      { scenario: "Tanker attacks off Omani coast", severity: 75, impact: "Even outside Hormuz, shipping insurance surges. Oman's maritime economy and Duqm free zone plans disrupted." },
      { scenario: "Fiscal strain from oil price vs. export halt", severity: 60, impact: "Gas self-sufficient but limited reserves vs. peers. Higher oil prices help only if exports flow. Vision 2040 timeline slips." },
    ],
  },
  {
    name: "Bahrain", pop: 1.5, oilProd: 0.2, oilExport: 0.04, gasSelf: false,
    gasNote: "Production barely meets demand. Hosts US 5th Fleet HQ. Most exposed militarily.",
    foodImport: 85, desalPct: 60, elecPeakGW: 3.8, elecGas: 99, elecOil: 0, waterDays: 1,
    preWar: { food: 70, water: 68, electricity: 65, chokepoint: 82, fiscal: 72, climate: 75, military: 55 },
    wartime: { food: 85, water: 82, electricity: 78, chokepoint: 95, infrastructure: 82, fiscal: 80, military: 85 },
    warStatus: "UNDER ATTACK",
    warDetail: "US 5th Fleet HQ hit. 45 missiles and 9 drones intercepted. Shahed-136 drone slammed into apartment building in Manama. Civilians injured. Bahrain airport struck. Most militarily exposed due to 5th Fleet.",
    infraHits: ["US 5th Fleet HQ (partial hit)", "Residential building in Manama (Shahed drone)", "Bahrain International Airport", "Multiple civilian areas from debris"],
    keyRisk: "Smallest, most vulnerable GCC state. Hosts 5th Fleet making it primary Iranian target. Fuels make up only 1/3 of export revenue (lowest in GCC). Already fragile fiscal position. 1 day water reserves.",
    scenarioSpecific: [
      { scenario: "5th Fleet base escalation", severity: 92, impact: "As primary US naval HQ in Gulf, Bahrain draws maximum Iranian fire. Small island geography means nowhere to hide for 1.5M residents." },
      { scenario: "Residential casualties mount", severity: 88, impact: "Drone in Manama apartment building sets precedent. Bahrain's small size means any miss hits civilians. Political instability risk." },
      { scenario: "Fiscal collapse (limited oil revenue)", severity: 78, impact: "Only 0.04 Mbpd exports. Fuels = 1/3 of revenue (lowest in GCC). Limited sovereign wealth. Dependent on Saudi/GCC financial support." },
      { scenario: "Water/power simultaneous failure", severity: 90, impact: "Gas production barely meets demand. 1 day reserves. 60% desal. Any infrastructure damage cascades to water + power failure." },
    ],
  },
];

// ── COMPONENTS ──
const Pulse = ({ color, size = 8 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size}px ${color}`, animation: "pulse 2s infinite" }} />
);

const Badge = ({ score, large }) => {
  const col = riskColor(score);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: large ? "4px 14px" : "2px 10px", borderRadius: 20, fontSize: large ? 13 : 11, fontWeight: 700, color: col, border: `1px solid ${col}30`, background: `${col}12`, letterSpacing: "0.04em" }}>
      <Pulse color={col} size={large ? 8 : 6} />
      {riskLabel(score)} {score}
    </span>
  );
};

const Card = ({ children, style = {}, glow }) => (
  <div style={{ background: C.card, border: `1px solid ${glow ? `${C.red}30` : C.border}`, borderRadius: 12, padding: 20, ...(glow ? { boxShadow: `0 0 20px ${C.redGlow}` } : {}), ...style }}>
    {children}
  </div>
);

const Title = ({ children, sub, warning }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: warning ? C.red : C.amber, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</h3>
      {warning && <Pulse color={C.red} size={6} />}
    </div>
    {sub && <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{sub}</p>}
  </div>
);

const MiniBar = ({ value, max = 100, color, label, suffix = "%" }) => (
  <div style={{ marginBottom: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
      <span style={{ fontSize: 10, color: C.muted }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color }}>{value}{suffix}</span>
    </div>
    <div style={{ height: 3, background: "#1a2332", borderRadius: 2 }}>
      <div style={{ height: 3, borderRadius: 2, background: color, width: `${Math.min((value / max) * 100, 100)}%`, transition: "width 0.6s ease" }} />
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const col = status === "UNDER ATTACK" ? C.red : C.orange;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 800, color: col, background: `${col}15`, border: `1px solid ${col}30`, letterSpacing: "0.06em" }}>
      <Pulse color={col} size={6} />
      {status}
    </span>
  );
};

// ── MAIN PANELS ──
const WarBanner = () => (
  <div style={{ background: `linear-gradient(90deg, ${C.warGlow}, transparent, ${C.warGlow})`, border: `1px solid ${C.red}25`, borderRadius: 10, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Pulse color={C.red} size={10} />
      <div>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.red, letterSpacing: "0.04em" }}>ACTIVE CONFLICT: OPERATION EPIC FURY</span>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>US-Israel strikes on Iran began Feb 28, 2026. Ayatollah Khamenei killed. Iran retaliating across all 6 GCC states. Hormuz de facto closed.</p>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>DAY 3</div>
      <div style={{ fontSize: 10, color: C.muted }}>Conflict ongoing</div>
    </div>
  </div>
);

const KPIStrip = () => {
  const kpis = [
    { label: "Hormuz Status", value: "DE FACTO CLOSED", sub: "70% traffic drop, 150+ tankers anchored", color: C.red },
    { label: "Brent Crude", value: "$80+/bbl", sub: "Up ~10% OTC. $100-130 forecast if sustained", color: C.orange },
    { label: "GCC States Hit", value: "6 of 6", sub: "First time all GCC targeted by one actor", color: C.red },
    { label: "UAE Intercepts", value: "708+", sub: "165 ballistic, 2 cruise, 541 drones. 3 killed", color: C.orange },
    { label: "Ports Suspended", value: "JEBEL ALI", sub: "36% of Dubai GDP. DP World ops halted", color: C.red },
    { label: "Airspace", value: "CLOSED", sub: "DXB, AUH, DOH, KWI, BAH all shut", color: C.red },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 18 }}>
      {kpis.map((k) => (
        <Card key={k.label} glow={k.color === C.red} style={{ padding: "12px 14px", borderTop: `2px solid ${k.color}` }}>
          <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 3 }}>{k.label}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: k.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.2 }}>{k.value}</div>
          <div style={{ fontSize: 9, color: C.dim, marginTop: 2, lineHeight: 1.3 }}>{k.sub}</div>
        </Card>
      ))}
    </div>
  );
};

const Heatmap = ({ onSelect, selected }) => {
  const metrics = ["food", "water", "electricity", "chokepoint", "infrastructure", "fiscal", "military"];
  return (
    <Card style={{ gridColumn: "span 2" }}>
      <Title warning sub="Wartime risk scores (0-100). Click a row for country deep dive.">Wartime Risk Heatmap</Title>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "3px 4px" }}>
          <thead><tr>
            <th style={{ textAlign: "left", fontSize: 10, color: C.muted, padding: "4px 8px", fontWeight: 600 }}>Country</th>
            <th style={{ textAlign: "center", fontSize: 10, color: C.muted, padding: "4px 6px", fontWeight: 600 }}>Status</th>
            {metrics.map((m) => <th key={m} style={{ textAlign: "center", fontSize: 10, color: C.muted, padding: "4px 6px", fontWeight: 600, textTransform: "capitalize" }}>{m === "infrastructure" ? "Infra" : m}</th>)}
            <th style={{ textAlign: "center", fontSize: 10, color: C.muted, padding: "4px 6px", fontWeight: 600 }}>Composite</th>
          </tr></thead>
          <tbody>
            {countries.map((c) => {
              const vals = Object.values(c.wartime);
              const comp = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
              const isSel = selected?.name === c.name;
              return (
                <tr key={c.name} onClick={() => onSelect(c)} style={{ cursor: "pointer", outline: isSel ? `2px solid ${CC[c.name]}` : "none", borderRadius: 6 }}>
                  <td style={{ padding: "6px 8px", fontSize: 12, fontWeight: 700, color: CC[c.name], borderRadius: "4px 0 0 4px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: 2, background: CC[c.name] }} />
                      {c.name}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", padding: "4px 4px" }}><StatusBadge status={c.warStatus} /></td>
                  {metrics.map((m) => {
                    const v = c.wartime[m]; const col = riskColor(v);
                    return <td key={m} style={{ textAlign: "center", padding: "6px 4px", background: `${col}12`, borderTop: `2px solid ${col}35`, fontSize: 12, fontWeight: 700, color: col }}>{v}</td>;
                  })}
                  <td style={{ textAlign: "center", padding: "6px 8px", background: `${riskColor(comp)}10`, fontSize: 14, fontWeight: 800, color: riskColor(comp), borderRadius: "0 4px 4px 0" }}>{comp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const InfraTracker = () => (
  <Card glow style={{ gridColumn: "span 2" }}>
    <Title warning sub="Confirmed strikes, debris impacts, and infrastructure damage across GCC (first 48 hours)">Live Infrastructure Damage Tracker</Title>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {countries.map((c) => (
        <div key={c.name} style={{ padding: 12, borderRadius: 8, background: C.cardAlt, border: `1px solid ${c.warStatus === "UNDER ATTACK" ? C.red : C.orange}20` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: CC[c.name] }}>{c.name}</span>
            <StatusBadge status={c.warStatus} />
          </div>
          <div style={{ maxHeight: 120, overflowY: "auto" }}>
            {c.infraHits.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
                <span style={{ color: C.red, fontSize: 8, marginTop: 3 }}>●</span>
                <span style={{ fontSize: 10, color: C.text, lineHeight: 1.4 }}>{h}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const HormuzPanel = () => (
  <Card glow>
    <Title warning sub="De facto closure since Feb 28. IRGC broadcasting 'no passage' on VHF.">Strait of Hormuz Crisis</Title>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
      {[
        { label: "Daily oil transit (normal)", val: "20M bbl/day", col: C.muted },
        { label: "Traffic reduction", val: "~70%", col: C.red },
        { label: "Tankers anchored", val: "150+", col: C.orange },
        { label: "Tankers struck", val: "3 confirmed", col: C.red },
        { label: "Insurance status", val: "WAR RISK CANCELLED", col: C.red },
        { label: "Maersk/MSC/Hapag", val: "ALL SUSPENDED", col: C.red },
      ].map((r) => (
        <div key={r.label} style={{ padding: "6px 8px", background: C.cardAlt, borderRadius: 4 }}>
          <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>{r.label}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: r.col, fontFamily: "'JetBrains Mono', monospace" }}>{r.val}</div>
        </div>
      ))}
    </div>
    <div style={{ padding: 10, background: `${C.red}08`, borderRadius: 6, border: `1px solid ${C.red}15` }}>
      <p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.5 }}>
        ⚠️ Iran has not formally closed Hormuz but IRGC radio broadcasts + tanker strikes + insurance withdrawal = de facto closure. Kpler estimates this is a real supply disruption, not a risk premium event. JPMorgan/Barclays forecast $100-130/bbl if sustained.
      </p>
    </div>
  </Card>
);

const NexusPanel = () => (
  <Card>
    <Title sub="How the Iran war cascades across interconnected systems">Wartime Nexus Risks</Title>
    {[
      { icon: "🔥", t: "Hormuz → Revenue → Food Imports", level: C.red, body: "Hormuz closure simultaneously blocks oil/gas EXPORTS (revenue) and food IMPORTS (supply). GCC cannot pay for food it cannot receive." },
      { icon: "💧", t: "Gas Disruption → Desal → Water Crisis", level: C.red, body: "UAE and Kuwait import gas for power/desal. Pipeline or supply disruption cascades to water failure within 1-2 days of reserves." },
      { icon: "✈️", t: "Airspace → Tourism → Expat Confidence", level: C.orange, body: "All GCC airspace closed. Emirates/Qatar Airways grounded. Tourism collapses. 88% of UAE population is expat and may leave." },
      { icon: "🏗️", t: "Infrastructure Hits → Investor Flight", level: C.orange, body: "Jebel Ali, DXB, Burj Al Arab all damaged. ADX/DFM closed. Vision 2030/2040 timelines freeze. FDI evaporates." },
    ].map((n) => (
      <div key={n.t} style={{ padding: "10px 12px", borderRadius: 6, background: `${n.level}06`, border: `1px solid ${n.level}18`, marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 14 }}>{n.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: n.level, textTransform: "uppercase" }}>{n.t}</span>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{n.body}</p>
      </div>
    ))}
  </Card>
);

const CountryDeepDive = ({ country: c }) => {
  const radarData = Object.entries(c.wartime).map(([k, v]) => ({ metric: k.charAt(0).toUpperCase() + k.slice(1), score: v, fullMark: 100 }));
  const preRadar = Object.entries(c.preWar).map(([k, v]) => ({ metric: k.charAt(0).toUpperCase() + k.slice(1), score: v, fullMark: 100 }));
  const comp = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Header */}
      <Card glow={c.warStatus === "UNDER ATTACK"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: CC[c.name] }}>{c.name}</h2>
              <StatusBadge status={c.warStatus} />
              <Badge score={comp} large />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>Pop: {c.pop}M | Oil: {c.oilProd} Mbpd | Export: {c.oilExport} Mbpd | Peak Elec: {c.elecPeakGW} GW</p>
          </div>
        </div>
        <div style={{ padding: 12, background: `${C.red}06`, borderRadius: 8, border: `1px solid ${C.red}15` }}>
          <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.6 }}>{c.warDetail}</p>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Radar */}
        <Card>
          <Title sub="Pre-war (outline) vs. wartime (filled) risk profile">Risk Radar: Pre-War vs. Wartime</Title>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: C.muted, fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Wartime" dataKey="score" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Pre-war" dataKey="score" data={preRadar} stroke={C.amber} fill="none" strokeWidth={1} strokeDasharray="4 4" />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: C.red }}>━━ Wartime</span>
            <span style={{ fontSize: 10, color: C.amber }}>╌╌ Pre-war</span>
          </div>
        </Card>

        {/* Dependencies + Infra */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Title>Critical Dependencies</Title>
            <MiniBar value={c.foodImport} color={riskColor(c.wartime.food)} label="Food Import Dependency" />
            <MiniBar value={c.desalPct} color={riskColor(c.wartime.water || 70)} label="Desalination Dependency" />
            <MiniBar value={c.elecGas} color={c.elecGas > 95 ? C.orange : C.blue} label="Gas for Electricity" />
            <div style={{ padding: "8px 10px", background: C.cardAlt, borderRadius: 6, marginTop: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: C.muted }}>Water Reserve Buffer</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.waterDays <= 1 ? C.red : C.orange }}>{c.waterDays} days</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>Gas self-sufficient: <span style={{ color: c.gasSelf ? C.green : C.red, fontWeight: 700 }}>{c.gasSelf ? "YES" : "NO"}</span></div>
              <p style={{ margin: "6px 0 0", fontSize: 10, color: C.dim, lineHeight: 1.4 }}>{c.gasNote}</p>
            </div>
          </Card>
          <Card>
            <Title warning>Infrastructure Hits</Title>
            {c.infraHits.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                <span style={{ color: C.red, fontSize: 7, marginTop: 4 }}>●</span>
                <span style={{ fontSize: 11, color: C.text, lineHeight: 1.4 }}>{h}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Key Strategic Risk */}
      <Card style={{ borderLeft: `3px solid ${CC[c.name]}` }}>
        <Title>Key Strategic Assessment</Title>
        <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.7 }}>{c.keyRisk}</p>
      </Card>

      {/* Country-Specific War Scenarios */}
      <Card glow>
        <Title warning sub={`War-specific scenario analysis for ${c.name}`}>Wartime Scenarios</Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {c.scenarioSpecific.map((sc) => (
            <div key={sc.scenario} style={{ padding: 14, borderRadius: 8, background: `${riskColor(sc.severity)}06`, border: `1px solid ${riskColor(sc.severity)}18` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{sc.scenario}</span>
                <Badge score={sc.severity} />
              </div>
              <div style={{ height: 3, background: "#1a2332", borderRadius: 2, marginBottom: 8 }}>
                <div style={{ height: 3, borderRadius: 2, background: riskColor(sc.severity), width: `${sc.severity}%` }} />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{sc.impact}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const PreWarComparison = () => {
  const data = countries.map((c) => {
    const pre = Math.round(Object.values(c.preWar).reduce((a, b) => a + b, 0) / Object.values(c.preWar).length);
    const war = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length);
    return { name: c.name.replace("Saudi Arabia", "KSA"), preWar: pre, wartime: war, delta: war - pre };
  });
  return (
    <Card>
      <Title sub="Composite risk score shift since Feb 28 strikes">Pre-War vs. Wartime Risk</Title>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barGap={3}>
          <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.text }} />
          <Bar dataKey="preWar" name="Pre-war" fill={C.amber} radius={[3, 3, 0, 0]} opacity={0.5} />
          <Bar dataKey="wartime" name="Wartime" fill={C.red} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {data.map((d) => (
          <span key={d.name} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: `${C.red}12`, color: C.red, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
            {d.name} +{d.delta}pts
          </span>
        ))}
      </div>
    </Card>
  );
};

const SupplyChainPanel = () => (
  <Card>
    <Title warning sub="Maritime chokepoints, shipping suspensions, and supply disruption">Supply Chain Status</Title>
    {[
      { route: "Strait of Hormuz", status: "DE FACTO CLOSED", detail: "70% traffic drop. IRGC VHF warnings. 3 tankers struck. Insurance cancelled. 150+ vessels anchored.", sev: 95 },
      { route: "Bab al-Mandab / Red Sea", status: "SUSPENDED", detail: "Maersk paused trans-Suez. CMA CGM rerouting via Cape of Good Hope. Houthi threat compounds.", sev: 85 },
      { route: "Jebel Ali Port (Dubai)", status: "OPS HALTED", detail: "Fire from intercepted missile debris. DP World suspended operations. Largest ME container port.", sev: 90 },
      { route: "Gulf Airspace", status: "CLOSED", detail: "Iran, Iraq, Kuwait, Israel, Bahrain airspace empty. DXB, AUH, DOH airports shut. Thousands stranded.", sev: 92 },
    ].map((r) => (
      <div key={r.route} style={{ padding: "10px 12px", borderRadius: 6, background: `${riskColor(r.sev)}06`, border: `1px solid ${riskColor(r.sev)}15`, marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{r.route}</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: riskColor(r.sev), fontFamily: "'JetBrains Mono', monospace" }}>{r.status}</span>
        </div>
        <p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{r.detail}</p>
      </div>
    ))}
  </Card>
);

// ── APP ──
export default function Dashboard() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("overview");
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  }, []);

  const tabs = [
    { key: "overview", label: "Situation Overview" },
    { key: "supply", label: "Supply Chain & Hormuz" },
    { key: "country", label: selected ? `Deep Dive: ${selected.name}` : "Select Country ↑" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", padding: "20px 28px" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>GCC Resource Risk Dashboard</h1>
            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, background: `${C.red}20`, color: C.red, fontWeight: 800, letterSpacing: "0.05em" }}>⚠ WARTIME</span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Iran Conflict Impact Assessment | Oil & Gas, Food, Water, Electricity, Infrastructure, Strategic Reserves</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: C.muted }}>Last updated</div>
          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: C.amber }}>{time}</div>
        </div>
      </div>

      <WarBanner />
      <KPIStrip />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "7px 16px", borderRadius: "5px 5px 0 0", border: "none",
            background: tab === t.key ? `${C.red}15` : "transparent",
            color: tab === t.key ? C.red : C.muted,
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            borderBottom: tab === t.key ? `2px solid ${C.red}` : "2px solid transparent",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Heatmap onSelect={(c) => { setSelected(c); setTab("country"); }} selected={selected} />
          <InfraTracker />
          <PreWarComparison />
          <NexusPanel />
        </div>
      )}

      {tab === "supply" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <HormuzPanel />
          <SupplyChainPanel />
          <Card style={{ gridColumn: "span 2" }}>
            <Title sub="Which GCC states can export if Hormuz stays closed?">Export Route Alternatives</Title>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { country: "Saudi Arabia", alt: "East-West Pipeline to Yanbu (Red Sea), 5 Mbpd capacity. Only GCC state with Red Sea access.", viability: "PARTIAL", col: C.amber },
                { country: "UAE", alt: "Abu Dhabi Crude Oil Pipeline (ADCOP) to Fujairah (outside Hormuz), 1.5 Mbpd. But Fujairah is still in Gulf of Oman near conflict zone.", viability: "LIMITED", col: C.orange },
                { country: "Qatar", alt: "No pipeline bypass. 100% of LNG exports transit Hormuz. Entire $80B North Field expansion at risk.", viability: "NONE", col: C.red },
                { country: "Kuwait", alt: "No alternative routes. Fully landlocked to Gulf. 100% Hormuz dependent for exports.", viability: "NONE", col: C.red },
                { country: "Oman", alt: "Port of Duqm on Indian Ocean (outside Hormuz) but already struck by drone. Partial bypass possible.", viability: "PARTIAL", col: C.amber },
                { country: "Bahrain", alt: "Negligible exports (0.04 Mbpd). Connected to Saudi via causeway. Dependent on Saudi alternative routes.", viability: "N/A", col: C.dim },
              ].map((r) => (
                <div key={r.country} style={{ padding: 12, borderRadius: 8, background: C.cardAlt, border: `1px solid ${r.col}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: CC[r.country] }}>{r.country}</span>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${r.col}15`, color: r.col, fontWeight: 700 }}>{r.viability}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{r.alt}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "country" && selected && <CountryDeepDive country={selected} />}
      {tab === "country" && !selected && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 13, color: C.muted }}>Click any country in the <span style={{ color: C.red, cursor: "pointer" }} onClick={() => setTab("overview")}>Situation Overview</span> heatmap to see a full wartime deep dive.</p>
        </Card>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, padding: "14px 0", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 9, color: C.dim }}>
          Sources: Atlantic Council, CSIS, Al Jazeera, CNBC, Reuters, Breaking Defense, Fortune, Euronews, The National, Middle East Eye, FDD, Kpler, gCaptain, Wikipedia (Mar 2, 2026). Pre-war data: DNV ETO 2026, OPEC ASB 2025, World Bank, WEF, Strategy&, Alpen Capital, MEI.
        </span>
        <span style={{ fontSize: 9, color: C.dim }}>Risk scores are composite analytical assessments. Not financial or military advice. Situation evolving rapidly.</span>
      </div>
    </div>
  );
}
