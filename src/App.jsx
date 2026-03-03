import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  dayCount: () => { const d = new Date(); const s = new Date("2026-02-28"); return Math.max(1, Math.ceil((d - s) / 86400000)); },
};

// ─────────── INFRASTRUCTURE DATA ───────────
const infraDB = {
  "Saudi Arabia": {
    ports: [
      { name: "Ras Tanura Oil Terminal", type: "Oil Export", capacity: "6.5 Mbpd capacity", status: "HALTED", note: "Loadings halted after drone strike Monday. Shahed-136 intercepted, debris caused fire. World's largest offshore oil loading facility." },
      { name: "King Abdulaziz Port, Dammam", type: "Commercial", capacity: "1.8M TEU/yr", status: "OPERATIONAL", note: "Enhanced security. Congestion building from rerouted cargo. Primary East coast commercial port." },
      { name: "Jubail Commercial Port", type: "Industrial/Commercial", capacity: "Key petrochemical hub", status: "OPERATIONAL", note: "Adjacent to Royal Commission industrial city. Co-located with desalination." },
      { name: "Jubail Industrial Port", type: "Industrial", capacity: "Petrochemical export", status: "OPERATIONAL", note: "SABIC and Aramco petrochemical exports. Feedstock from Eastern Province." },
      { name: "Jeddah Islamic Port", type: "Commercial", capacity: "7.86M TEU, largest Red Sea", status: "OPERATIONAL", note: "Outside Gulf. Seeing massive surge in diverted shipping. Primary food import point." },
      { name: "Yanbu Commercial Port", type: "Oil/Commercial", capacity: "East-West pipeline terminus", status: "OPERATIONAL", note: "Critical Hormuz bypass terminus. Pipeline pushing max 5 Mbpd." },
      { name: "Yanbu Industrial Port", type: "Industrial/Oil Export", capacity: "Refinery + petrochemical", status: "OPERATIONAL", note: "YASREF and Yanbu refinery exports route. Red Sea coast." },
      { name: "King Fahd Industrial Port (Jubail)", type: "Industrial", capacity: "Heavy industrial", status: "OPERATIONAL", note: "Serves Royal Commission industries. Largest ME industrial zone." },
      { name: "Jizan Port", type: "Commercial/Oil", capacity: "400K bpd refinery port", status: "OPERATIONAL", note: "Southwest coast. Near Yemen border. Jizan refinery port." },
      { name: "Ras Al-Khair Port", type: "Industrial/Mining", capacity: "Mining + industrial", status: "OPERATIONAL", note: "Ma'aden phosphate and aluminum export. Adjacent to mega desal." },
    ],
    airports: [
      { name: "King Khalid Intl (Riyadh)", code: "RUH", status: "RESTRICTED", note: "Military flights only. Commercial suspended. Intercepted missiles nearby." },
      { name: "King Abdulaziz Intl (Jeddah)", code: "JED", status: "OPERATIONAL", note: "Only major Saudi airport still taking commercial flights. Severely overloaded." },
      { name: "King Fahd Intl (Dammam)", code: "DMM", status: "CLOSED", note: "Eastern Province. Too close to conflict zone. All flights diverted." },
      { name: "Prince Mohammad bin Abdulaziz (Medina)", code: "MED", status: "OPERATIONAL", note: "Western coast. Limited commercial. Taking some diverted traffic." },
      { name: "Abha Regional Airport", code: "AHB", status: "OPERATIONAL", note: "Southwest highlands. Outside threat radius. Limited capacity." },
      { name: "Tabuk Regional Airport", code: "TUU", status: "OPERATIONAL", note: "Northwest. Near NEOM. Some military activity." },
      { name: "Ta'if Regional Airport", code: "TIF", status: "OPERATIONAL", note: "Near Jeddah. Overflow capacity for JED." },
      { name: "Prince Sultan Air Base (Al Kharj)", code: "Military", status: "ACTIVE", note: "Key military base south of Riyadh. US presence. Potential target." },
    ],
    power: [
      { name: "Shoaiba Power & Desal Complex", type: "Oil/Gas Steam", capacity: "5.6 GW", status: "OPERATIONAL", note: "Red Sea coast south of Jeddah. Outside direct threat zone. Largest single-site." },
      { name: "PP14 Riyadh (Dhuruma)", type: "Gas CCGT", capacity: "1.8 GW", status: "OPERATIONAL", note: "Interior Riyadh. SEC-operated. Buffer from coast." },
      { name: "PP13 Riyadh", type: "Gas CCGT", capacity: "1.8 GW", status: "OPERATIONAL", note: "South Riyadh IPP. ACWA Power operated." },
      { name: "PP12 Riyadh (Qassim)", type: "Gas", capacity: "1.8 GW", status: "OPERATIONAL", note: "Central region. Feeds Riyadh and Qassim load." },
      { name: "PP11 Riyadh", type: "Gas CCGT", capacity: "1.8 GW", status: "OPERATIONAL", note: "Riyadh periphery. Key baseload." },
      { name: "Rabigh IPP", type: "Oil Steam", capacity: "1.2 GW", status: "OPERATIONAL", note: "Red Sea coast. Oil-fired. ACWA Power." },
      { name: "Rabigh 2 IPP", type: "Oil/Gas", capacity: "0.6 GW", status: "OPERATIONAL", note: "Expansion phase. Red Sea coast." },
      { name: "Jubail Power Plant (SEC)", type: "Gas/Oil Steam", capacity: "2.8 GW", status: "AT RISK", note: "Eastern Province. Near oil facilities already hit. Critical for industrial zone." },
      { name: "Ghazlan Power Plant", type: "Oil/Gas Steam", capacity: "2.4 GW", status: "AT RISK", note: "Eastern Province coast. South of Dammam. SEC-operated." },
      { name: "Qurayyah CCGT", type: "Gas CCGT", capacity: "3.9 GW", status: "AT RISK", note: "Eastern Province. One of world's largest CCGT plants. Near conflict zone." },
      { name: "Fadhili Cogeneration", type: "Gas Cogen", capacity: "1.5 GW", status: "AT RISK", note: "Eastern Province. Co-located with Aramco gas processing." },
      { name: "Shuqaiq Steam Power", type: "Oil Steam", capacity: "0.85 GW", status: "OPERATIONAL", note: "Southwest Red Sea coast. Remote from Gulf." },
      { name: "Layla Power Plant", type: "Gas", capacity: "0.3 GW", status: "OPERATIONAL", note: "Central Saudi. Small interior plant." },
      { name: "Tabarjal Power Plant", type: "Gas", capacity: "0.2 GW", status: "OPERATIONAL", note: "Northern Saudi. Al Jawf region." },
      { name: "Sakaka Solar PV", type: "Solar", capacity: "0.3 GW", status: "OPERATIONAL", note: "First utility-scale solar. Al Jouf. Zero fuel dependency." },
      { name: "Sudair Solar PV", type: "Solar", capacity: "1.5 GW", status: "OPERATIONAL", note: "Largest in Saudi. ACWA Power. Central region. No fuel risk." },
      { name: "Shuaibah Solar PV", type: "Solar", capacity: "0.6 GW", status: "OPERATIONAL", note: "Near Jeddah. Red Sea coast. Contributing to western grid." },
      { name: "Dumat Al Jandal Wind", type: "Wind", capacity: "0.4 GW", status: "OPERATIONAL", note: "First wind farm. Northern Saudi. No fuel dependency." },
      { name: "Yanbu Power Plant (SEC)", type: "Oil/Gas Steam", capacity: "1.8 GW", status: "OPERATIONAL", note: "Red Sea coast. Feeds Yanbu and Medina load centers." },
    ],
    desal: [
      { name: "Ras Al-Khair SWRO + MSF", capacity: "1.036M m³/day", status: "OPERATIONAL", note: "World's largest hybrid desal. Eastern Province. High-value target. Feeds Riyadh." },
      { name: "Jubail Desal (Marafiq Phase I+II)", capacity: "800K m³/day", status: "OPERATIONAL", note: "Adjacent to industrial zone. 500km pipeline to Riyadh. If cut, capital loses water." },
      { name: "Jubail RO Plant (SWCC)", capacity: "400K m³/day", status: "OPERATIONAL", note: "Newer RO addition. More energy-efficient. Eastern Province." },
      { name: "Shoaiba Desal (Phase I, II, III)", capacity: "880K m³/day", status: "OPERATIONAL", note: "Red Sea coast. Feeds Jeddah, Makkah, Taif. Lower threat." },
      { name: "Jeddah RO (SWCC)", capacity: "240K m³/day", status: "OPERATIONAL", note: "Supplementary to Shoaiba. Jeddah demand growing." },
      { name: "Yanbu Desal (Phase I+II)", capacity: "128K m³/day", status: "OPERATIONAL", note: "Feeds Medina via pipeline. Red Sea coast." },
      { name: "Shuqaiq Desal (Phase I+II+III)", capacity: "450K m³/day", status: "OPERATIONAL", note: "Southwest coast. Newest expansion. Feeds Asir and Jizan." },
      { name: "Haql Desal", capacity: "30K m³/day", status: "OPERATIONAL", note: "Northwest Red Sea. Small. Local supply." },
      { name: "Rabigh RO", capacity: "600K m³/day", status: "OPERATIONAL", note: "Major new SWCC plant. Red Sea. Feeds western region." },
      { name: "Al Khobar Desal (SWCC)", capacity: "180K m³/day", status: "AT RISK", note: "Eastern Province. Near Dammam. Feeds local demand." },
    ],
    energy: [
      { name: "East-West Pipeline (Petroline)", type: "Pipeline", capacity: "5 Mbpd to Yanbu", status: "CRITICAL ASSET", note: "Only Hormuz bypass for Saudi oil. Running at max. 1,200 km across the Kingdom." },
      { name: "Abqaiq Processing Plant", type: "Processing", capacity: "7 Mbpd (world's largest)", status: "AT RISK", note: "Eastern Province. Previously attacked 2019 (Houthi). Hardened since but prime target." },
      { name: "Ras Tanura Refinery", type: "Refinery", capacity: "550K bpd", status: "HALTED", note: "Shut down Monday as precaution after Shahed-136 drone strike. Fire contained. Aramco assessing damage." },
      { name: "SATORP Jubail Refinery", type: "Refinery", capacity: "400K bpd", status: "OPERATIONAL", note: "Aramco-TotalEnergies JV. Full-conversion. Domestic supply priority." },
      { name: "YASREF Yanbu Refinery", type: "Refinery", capacity: "400K bpd", status: "OPERATIONAL", note: "Red Sea. Aramco-Sinopec JV. Export + domestic." },
      { name: "Riyadh Refinery", type: "Refinery", capacity: "120K bpd", status: "OPERATIONAL", note: "Oldest. Interior. Feeds central region fuel." },
      { name: "Jeddah Refinery", type: "Refinery", capacity: "80K bpd", status: "OPERATIONAL", note: "Being phased out. Still providing some local fuel." },
      { name: "Jizan Refinery (JAZAN IGCC)", type: "Refinery + Power", capacity: "400K bpd + 3.8 GW", status: "OPERATIONAL", note: "Southwest coast. Newest mega refinery. Gasification-to-power." },
      { name: "Master Gas System", type: "Gas Network", capacity: "9.6 Bcf/day capacity", status: "AT RISK", note: "Backbone of Saudi gas distribution. Eastern Province origination. If disrupted, western power affected." },
      { name: "Shaybah NGL Facility", type: "Processing", capacity: "1 Mbpd NGL", status: "OPERATIONAL", note: "Deep Rub al Khali. Remote. Previously droned 2019 (minor)." },
      { name: "Hawiyah NGL Plant", type: "Processing", capacity: "4.4 Bcf/day gas processing", status: "AT RISK", note: "Central Province. Feeds Master Gas System." },
    ],
  },
  UAE: {
    ports: [
      { name: "Jebel Ali Port (DP World)", type: "Commercial/Free Zone", capacity: "16.1M TEU, 9th globally", status: "HALTED", note: "Fire from debris. DP World suspended all ops. 36% of Dubai GDP. 120+ berths." },
      { name: "Khalifa Port (Abu Dhabi)", type: "Commercial/Industrial", capacity: "5M TEU capacity", status: "REDUCED", note: "Operating at ~40%. KIZAD industrial zone co-located. Enhanced security." },
      { name: "Fujairah Port", type: "Oil/Bunkering", capacity: "2nd largest bunkering hub globally", status: "AT RISK", note: "Outside Hormuz but near conflict. ADCOP pipeline terminus. Insurance surging." },
      { name: "Fujairah Oil Terminal (FOIC)", type: "Oil Storage", capacity: "42M bbl storage", status: "AT RISK", note: "World's 3rd largest oil storage hub. Strategic reserve." },
      { name: "Port Rashid (Dubai)", type: "Commercial/Cruise", capacity: "Cruise + limited cargo", status: "CLOSED", note: "Near Burj Al Arab. Security perimeter. Historically first major Dubai port." },
      { name: "Khor Fakkan Port", type: "Container", capacity: "3.2M TEU", status: "REDUCED", note: "East coast (outside Hormuz). Taking diverted cargo. Sharjah operated." },
      { name: "Hamriyah Port (Sharjah)", type: "Industrial/Free Zone", capacity: "Industrial cargo", status: "REDUCED", note: "Free zone port. Industrial area nearby was hit." },
      { name: "Mina Zayed (Abu Dhabi)", type: "Commercial/Cruise", capacity: "Legacy port", status: "CLOSED", note: "Near city center. Security perimeter. Operations suspended." },
      { name: "Mina Saqr (RAK)", type: "Bulk/Aggregate", capacity: "Largest bulk port in ME", status: "REDUCED", note: "Rock and aggregate exports. Al Hamra RAK area was hit." },
      { name: "Jebel Dhanna Oil Terminal", type: "Oil Export", capacity: "ADNOC offshore loading", status: "AT RISK", note: "Western Abu Dhabi. Offshore oil loading. Gulf-facing." },
      { name: "Das Island Terminal", type: "Oil/Gas Export", capacity: "ADNOC offshore hub", status: "AT RISK", note: "Offshore Abu Dhabi. Major crude and LNG loading point." },
    ],
    airports: [
      { name: "Dubai Intl (DXB)", code: "DXB", status: "CLOSED", note: "Terminal 3 struck. World's busiest for intl pax (87M/yr). Thousands stranded." },
      { name: "Abu Dhabi Intl (Zayed)", code: "AUH", status: "CLOSED", note: "1 killed in strike. New Midfield Terminal just opened. All flights suspended." },
      { name: "Al Maktoum Intl (DWC)", code: "DWC", status: "CLOSED", note: "Southern Dubai. Within missile range. Was planned as world's largest airport." },
      { name: "Sharjah Intl (SHJ)", code: "SHJ", status: "CLOSED", note: "Industrial area nearby hit. Low-cost carrier hub. All flights suspended." },
      { name: "Fujairah Intl", code: "FJR", status: "RESTRICTED", note: "Military coordination use only. East coast. Potential evac staging." },
      { name: "Ras Al Khaimah Intl", code: "RKT", status: "CLOSED", note: "Al Hamra area hit nearby. Small airport, all ops suspended." },
      { name: "Al Dhafra Air Base", code: "Military", status: "ACTIVE", note: "Major US/French military base. Western Abu Dhabi. Key strike platform. High-value target." },
      { name: "Al Minhad Air Base", code: "Military", status: "ACTIVE", note: "Dubai. Allied coalition base. Australian/Canadian/NZ presence." },
    ],
    power: [
      { name: "Jebel Ali Power & Desal (M, K, L stations)", type: "Gas CCGT + Steam", capacity: "8.7 GW total", status: "AT RISK", note: "DEWA complex near port fire. Largest UAE generation site. Operating in contingency." },
      { name: "Hassyan Clean Energy (Phase I+II)", type: "Gas CCGT (converted from coal)", capacity: "2.4 GW", status: "AT RISK", note: "Near Jebel Ali. Emergency protocols activated. ACWA/Harbin JV." },
      { name: "Barakah Nuclear (Units 1-4)", type: "Nuclear", capacity: "5.6 GW", status: "OPERATIONAL", note: "~6% of UAE power. IAEA monitoring. Hardened. Western Abu Dhabi (Ruwais area)." },
      { name: "Taweelah A1 IWPP", type: "Gas CCGT + Desal", capacity: "1.6 GW", status: "OPERATIONAL", note: "Abu Dhabi. TAQA operated. Full output." },
      { name: "Taweelah B IWPP", type: "Gas CCGT + Desal", capacity: "0.8 GW", status: "OPERATIONAL", note: "Abu Dhabi. Adjacent to A1." },
      { name: "Taweelah RO + Power", type: "Gas + RO", capacity: "0.7 GW", status: "OPERATIONAL", note: "ACWA Power. Co-located with world's largest RO plant." },
      { name: "Shuweihat S1 IWPP", type: "Gas CCGT", capacity: "1.6 GW", status: "OPERATIONAL", note: "Western Abu Dhabi. TAQA/GDF Suez. Lower risk zone." },
      { name: "Shuweihat S2 IWPP", type: "Gas CCGT", capacity: "1.6 GW", status: "OPERATIONAL", note: "Adjacent to S1. Full baseload." },
      { name: "Shuweihat S3 IWPP", type: "Gas CCGT", capacity: "1.6 GW", status: "OPERATIONAL", note: "Newest Shuweihat block. ADWEA." },
      { name: "Umm Al Nar Power & Desal", type: "Gas Steam", capacity: "1.1 GW", status: "OPERATIONAL", note: "Abu Dhabi island. Aging but critical for local load." },
      { name: "Fujairah F1 IPP", type: "Gas CCGT", capacity: "0.6 GW", status: "OPERATIONAL", note: "East coast. Outside Hormuz. FEWA operated." },
      { name: "Fujairah F2 IPP", type: "Gas CCGT", capacity: "0.6 GW", status: "OPERATIONAL", note: "Adjacent to F1. Expansion." },
      { name: "Fujairah F3 IPP", type: "Gas CCGT", capacity: "0.95 GW", status: "OPERATIONAL", note: "Newest east coast plant. EWEC contract. Strategic backup." },
      { name: "Mirfa IWPP", type: "Gas CCGT", capacity: "1.6 GW", status: "OPERATIONAL", note: "Western Abu Dhabi coast. Engie/TAQA. Lower risk." },
      { name: "Al Ain Power Plant (TRANSCO)", type: "Gas", capacity: "0.3 GW", status: "OPERATIONAL", note: "Interior. Feeds Al Ain city. Small." },
      { name: "Noor Abu Dhabi Solar", type: "Solar PV", capacity: "1.18 GW", status: "OPERATIONAL", note: "Sweihan. World's largest single-site solar at commissioning. Zero fuel risk." },
      { name: "Al Dhafra Solar PV", type: "Solar PV", capacity: "2.0 GW", status: "OPERATIONAL", note: "World's largest single-site solar now. Western AD. TAQA/Masdar. No fuel." },
      { name: "Mohammed bin Rashid Solar Park", type: "Solar PV + CSP", capacity: "2.6 GW (rising to 5 GW)", status: "OPERATIONAL", note: "Dubai. DEWA. Phases I-V. CSP tower + PV. Southern Dubai." },
    ],
    desal: [
      { name: "Taweelah RO Plant (IWP)", capacity: "909K m³/day", status: "OPERATIONAL", note: "World's largest RO plant. ACWA Power. Critical for Abu Dhabi." },
      { name: "Jebel Ali Desal (DEWA M/K/L)", capacity: "2.1M m³/day combined MSF", status: "AT RISK", note: "Adjacent to port fire. Running emergency mode. Largest MSF complex." },
      { name: "Umm Al Nar Desal", capacity: "394K m³/day", status: "OPERATIONAL", note: "Abu Dhabi island. Aging MSF facility." },
      { name: "Fujairah Desal (F1/F2/F3 + RO)", capacity: "590K m³/day combined", status: "OPERATIONAL", note: "East coast outside Hormuz. Strategic reserve importance rising." },
      { name: "Shuweihat Desal (S1/S2)", capacity: "450K m³/day", status: "OPERATIONAL", note: "Western Abu Dhabi. Co-located with power." },
      { name: "Mirfa Desal", capacity: "140K m³/day", status: "OPERATIONAL", note: "Western Abu Dhabi. Engie operated." },
      { name: "Taweelah A1/B Desal (MSF)", capacity: "385K m³/day", status: "OPERATIONAL", note: "Abu Dhabi. Legacy MSF alongside newer RO." },
      { name: "Hassyan IWP (Seawater RO)", capacity: "590K m³/day", status: "AT RISK", note: "Newest major desal. Near Jebel Ali. Emergency protocols." },
      { name: "Layyah RO Plant", capacity: "182K m³/day", status: "OPERATIONAL", note: "FEWA. Sharjah/Northern Emirates supply." },
    ],
    energy: [
      { name: "ADCOP Pipeline to Fujairah", type: "Oil Pipeline", capacity: "1.5 Mbpd", status: "CRITICAL ASSET", note: "Bypasses Hormuz. Running max capacity. 360 km from Habshan to Fujairah." },
      { name: "Ruwais Refinery (ADNOC)", type: "Refinery", capacity: "922K bpd", status: "OPERATIONAL", note: "Largest in Middle East. Western Abu Dhabi. Full domestic priority. Expansion to 1.4M planned." },
      { name: "Jebel Ali Refinery (ENOC)", type: "Refinery", capacity: "210K bpd", status: "REDUCED", note: "Near port fire. Reduced ops. Dubai fuel supply." },
      { name: "Fujairah Refinery (Ecomar)", type: "Refinery", capacity: "82K bpd", status: "OPERATIONAL", note: "East coast. Small but outside Hormuz." },
      { name: "Dolphin Gas Pipeline (from Qatar)", type: "Subsea Gas Pipeline", capacity: "3.2 Bcf/day", status: "AT RISK", note: "Subsea Gulf crossing. ~30% of UAE gas. Single point of failure. No redundancy." },
      { name: "Habshan Gas Processing", type: "Gas Processing", capacity: "3.5 Bcf/day", status: "OPERATIONAL", note: "ADNOC. Onshore Abu Dhabi. Feeds domestic grid + ADCOP." },
      { name: "Bab Gas Processing", type: "Gas Processing", capacity: "1.3 Bcf/day", status: "OPERATIONAL", note: "ADNOC. Oldest gas complex. Interior Abu Dhabi." },
      { name: "Umm Shaif/Nasr Offshore", type: "Offshore Oil/Gas", capacity: "Key offshore fields", status: "AT RISK", note: "Gulf-facing offshore platforms. Within potential strike range." },
      { name: "ADNOC Strategic Oil Storage (Fujairah)", type: "Strategic Reserve", capacity: "42M bbl (shared FOIC)", status: "OPERATIONAL", note: "Underground caverns at Al Ruwais. Emergency reserve." },
    ],
  },
  Qatar: {
    ports: [
      { name: "Hamad Port (Doha)", type: "Commercial", capacity: "7.5M TEU capacity", status: "REDUCED", note: "Operating but shipping severely reduced. Insurance pulled for Gulf routes. Opened 2017." },
      { name: "Ras Laffan Industrial Port", type: "LNG/Industrial", capacity: "World's largest LNG port", status: "OPERATIONAL", note: "LNG loaded but tankers cannot transit Hormuz. Fleet anchoring offshore." },
      { name: "Mesaieed Industrial Port", type: "Industrial/Oil", capacity: "Petrochemical hub", status: "STRUCK", note: "Drone hit power plant water tank. QatarEnergy production halted. QAPCO, QChem co-located." },
      { name: "Al Ruwais Port", type: "Fishing/Small Craft", capacity: "Northern port", status: "OPERATIONAL", note: "Limited commercial use. Fishing fleet." },
      { name: "Doha Port (legacy)", type: "Legacy/Dhow", capacity: "Decommissioned for containers", status: "CLOSED", note: "Replaced by Hamad Port. Dhow traffic only." },
    ],
    airports: [
      { name: "Hamad International Airport (DOH)", code: "DOH", status: "CLOSED", note: "World's best airport (2024 Skytrax). All flights suspended. Missiles intercepted over Doha." },
      { name: "Al-Udeid Air Base", code: "Military", status: "TARGETED", note: "Largest US military base in ME (~10,000 personnel). CENTCOM forward HQ. Primary Iranian target. 30km from Doha." },
      { name: "Doha International (Old Airport)", code: "DIA", status: "CLOSED", note: "Decommissioned for passenger use 2014. Emergency military backup potential." },
    ],
    power: [
      { name: "Umm Al Houl IWPP", type: "Gas CCGT + Desal", capacity: "2.52 GW", status: "OPERATIONAL", note: "Newest mega plant. Southern Doha. Also powers largest desal. K-Electric/Qatar Holding." },
      { name: "Ras Laffan Power Complex (RLPC)", type: "Gas CCGT", capacity: "2.73 GW", status: "OPERATIONAL", note: "Co-located with LNG. Gas self-sufficient from North Field." },
      { name: "Ras Abu Fontas B2 (Facility D)", type: "Gas Steam + Desal", capacity: "1.03 GW", status: "OPERATIONAL", note: "Legacy plant near old airport. Within strike range. Feeds Doha base load." },
      { name: "Ras Abu Fontas A (RAF-A1/A2/A3)", type: "Gas Steam + Desal", capacity: "0.95 GW combined", status: "OPERATIONAL", note: "Oldest plants. Co-located with critical desal. Southern coast." },
      { name: "Mesaieed Power Station", type: "Gas CCGT", capacity: "2.0 GW", status: "OPERATIONAL", note: "Industrial zone. Powers petrochemical complex. Gas from North Field." },
      { name: "Facility E (Ras Abu Fontas)", type: "Gas CCGT", capacity: "0.57 GW", status: "OPERATIONAL", note: "Expansion plant. KAHRAMAA operated. Near RAF complex." },
      { name: "Ras Laffan C IWPP", type: "Gas CCGT + Desal", capacity: "1.03 GW", status: "OPERATIONAL", note: "Q-Power. North Field adjacent. Co-located desal." },
      { name: "Duhail Power Plant", type: "Gas GT", capacity: "0.6 GW", status: "OPERATIONAL", note: "Near Doha. Peaking/reserve plant. KAHRAMAA." },
      { name: "Al Kharsaah Solar PV", type: "Solar PV", capacity: "0.8 GW", status: "OPERATIONAL", note: "Qatar's first utility-scale solar. Siraj Energy/TotalEnergies. ~10% of peak demand." },
    ],
    desal: [
      { name: "Umm Al Houl Desal (SWRO + MSF)", capacity: "621K m³/day", status: "OPERATIONAL", note: "Largest in Qatar. Powers ~40% of water. Southern Doha. SWRO + MSF hybrid." },
      { name: "Ras Abu Fontas A2 Desal", capacity: "164K m³/day", status: "OPERATIONAL", note: "Legacy MSF. Near airport. Critical redundancy." },
      { name: "Ras Abu Fontas A3 Desal", capacity: "136K m³/day", status: "OPERATIONAL", note: "MSF expansion. KAHRAMAA operated." },
      { name: "Ras Abu Fontas B2 Desal", capacity: "245K m³/day", status: "OPERATIONAL", note: "Larger MSF unit. Feeds Doha metro." },
      { name: "Ras Laffan Desal (RLPC)", capacity: "160K m³/day", status: "OPERATIONAL", note: "Feeds northern industrial city. Co-located with LNG ops." },
      { name: "Ras Laffan C Desal", capacity: "126K m³/day", status: "OPERATIONAL", note: "Supplementary to main Ras Laffan desal." },
      { name: "Facility E RO Desal", capacity: "59K m³/day", status: "OPERATIONAL", note: "Smaller RO supplement at RAF complex." },
      { name: "Qatar Emergency Water Storage", capacity: "7-day strategic reserve target", status: "AT RISK", note: "Lusail mega-reservoir + distributed tanks. As of 2026, actual reserve ~1.5 days." },
    ],
    energy: [
      { name: "North Field (QatarEnergy)", type: "Gas Field", capacity: "Rising to 142 Mtpa LNG by 2030", status: "PRODUCING", note: "World's largest non-associated gas field. Shared with Iran's South Pars. Production stable." },
      { name: "North Field East Expansion (NFE)", type: "LNG Expansion", capacity: "+32 Mtpa", status: "UNDER CONSTRUCTION", note: "4 new mega-trains. Completion 2026-27. $28.75B investment at risk." },
      { name: "North Field South Expansion (NFS)", type: "LNG Expansion", capacity: "+16 Mtpa", status: "UNDER CONSTRUCTION", note: "2 additional trains. Completion 2028. $10B+." },
      { name: "Ras Laffan LNG Complex (Qatargas/RasGas)", type: "LNG Trains", capacity: "77 Mtpa (14 trains)", status: "HALTED", note: "Drone strike on facility. QatarEnergy suspended ALL LNG production. ~20% of global LNG offline. European gas +45%." },
      { name: "Ras Laffan Condensate Refinery", type: "Refinery", capacity: "146K bpd", status: "OPERATIONAL", note: "Condensate splitter. Running for domestic jet fuel and naphtha." },
      { name: "Laffan Refinery 1 + 2", type: "Condensate Refinery", capacity: "292K bpd combined", status: "OPERATIONAL", note: "QatarEnergy + international partners. Full domestic priority." },
      { name: "Mesaieed NGL Complex", type: "Gas Processing", capacity: "NGL extraction", status: "OPERATIONAL", note: "Ethane, propane, butane extraction. Feeds QAPCO." },
      { name: "Dolphin Pipeline (to UAE/Oman)", type: "Subsea Gas Pipeline", capacity: "3.2 Bcf/day export", status: "AT RISK", note: "Subsea Gulf crossing. If severed, UAE loses ~30% gas, Oman loses minor import." },
      { name: "Barzan Gas Project", type: "Gas Processing", capacity: "1.4 Bcf/day", status: "OPERATIONAL", note: "Domestic gas supply project. Feeds power sector." },
    ],
  },
  Kuwait: {
    ports: [
      { name: "Mina Al-Ahmadi", type: "Oil Export", capacity: "Largest oil terminal, ~1.5 Mbpd throughput", status: "STRANDED", note: "Tankers loaded but cannot depart through Hormuz. KPC operated." },
      { name: "Mina Abdullah", type: "Oil/Industrial", capacity: "Refinery port + LPG", status: "OPERATIONAL", note: "Adjacent to MAA refinery. Running for domestic fuel production." },
      { name: "Shuwaikh Port", type: "Commercial", capacity: "Main import port", status: "REDUCED", note: "Cargo ships avoiding Gulf. Food and goods imports dropping sharply." },
      { name: "Shuaiba Port", type: "Industrial/Commercial", capacity: "Industrial cargo", status: "REDUCED", note: "Lower commercial activity. Adjacent to Shuaiba industrial area." },
      { name: "Doha Port (Kuwait)", type: "Naval/Government", capacity: "Kuwait Naval Base", status: "AT RISK", note: "Naval base drone intercepted here. Military target." },
      { name: "Mina Az-Zour Port", type: "LNG Import/Industrial", capacity: "LNG regasification", status: "AT RISK", note: "Al-Zour LNG import terminal. Critical for gas supply. Gulf-facing." },
      { name: "Bubiyan Island Port (Mubarak al-Kabeer)", type: "Future mega-port", capacity: "Under construction", status: "HALTED", note: "Northern Kuwait. Near Iraqi/Iranian waters. Construction suspended." },
    ],
    airports: [
      { name: "Kuwait International Airport", code: "KWI", status: "STRUCK", note: "Drone hit Saturday, minor worker injuries, terminal material damage per DGCA. All commercial flights suspended." },
      { name: "Ali Al Salem Air Base", code: "Military", status: "DAMAGED", note: "Runway 'sustained extensive damage' per Italian Deputy PM Tajani. US-used. Primary target. Debris fell near base." },
      { name: "Ahmad Al Jaber Air Base", code: "Military", status: "ACTIVE", note: "Kuwait Air Force. Southern Kuwait. Operational for defense sorties." },
    ],
    power: [
      { name: "Sabiya Power & Desal", type: "Gas/Oil Steam + CCGT", capacity: "5.3 GW", status: "STRAINED", note: "Largest plant. Phases I-III. Northern Kuwait, near border. Pre-war failures. MEW operated." },
      { name: "Az-Zour South IWPP (Phase I)", type: "Gas CCGT + Desal", capacity: "1.54 GW", status: "AT RISK", note: "Newest plant. Gas-dependent. Coastal. KIPIC/Engie/KDIPA." },
      { name: "Az-Zour North Power & Desal", type: "Gas/Oil Steam", capacity: "4.7 GW", status: "STRAINED", note: "Second largest. Southern Kuwait. Multiple phases since 1970s. Aging." },
      { name: "Doha East Power & Desal", type: "Gas/Oil Steam", capacity: "1.16 GW", status: "STRAINED", note: "Kuwait City. Oldest operational plant. Repeated failures 2024-25. MEW." },
      { name: "Doha West Power & Desal", type: "Gas/Oil Steam", capacity: "1.24 GW", status: "STRAINED", note: "Adjacent to Doha East. Also aging. City center location." },
      { name: "Shuaiba South Power & Desal", type: "Gas/Oil Steam", capacity: "1.14 GW", status: "OPERATIONAL", note: "Southern Kuwait. Lower direct threat." },
      { name: "Shuaiba North Power & Desal", type: "Oil/Gas Steam", capacity: "0.89 GW", status: "OPERATIONAL", note: "Adjacent to South. Aging infrastructure." },
      { name: "Subiya CCGT (New Phase)", type: "Gas CCGT", capacity: "0.9 GW", status: "STRAINED", note: "Expansion of Sabiya complex. Also experiencing grid strain." },
      { name: "Nuwaiseeb (Az-Zour South Phase II)", type: "Gas CCGT", capacity: "0.9 GW (planned)", status: "DELAYED", note: "Under development. Would add to southern capacity. Construction disrupted." },
      { name: "Shagaya Renewable Park", type: "Solar PV + CSP + Wind", capacity: "0.07 GW (Phase I)", status: "OPERATIONAL", note: "Pilot renewable. Tiny contribution. Western desert. Zero fuel risk." },
    ],
    desal: [
      { name: "Az-Zour South SWRO", capacity: "486K m³/day", status: "AT RISK", note: "Newest and largest. Gas supply is vulnerability. SWRO technology." },
      { name: "Az-Zour North Desal (MSF)", capacity: "454K m³/day", status: "STRAINED", note: "Multiple MSF stages. Southern Kuwait. Aging." },
      { name: "Sabiya Desal (MSF)", capacity: "300K m³/day", status: "STRAINED", note: "Northern Kuwait. Co-located with power. Gas-dependent." },
      { name: "Doha East Desal", capacity: "116K m³/day", status: "STRAINED", note: "Old MSF units. Center of Kuwait City. Maintenance issues." },
      { name: "Doha West Desal", capacity: "184K m³/day", status: "STRAINED", note: "MSF. Adjacent to East. Also aging." },
      { name: "Shuwaikh Desal", capacity: "80K m³/day (reduced)", status: "OPERATIONAL", note: "Legacy facility. Supplementary only. Cannot replace main plants." },
      { name: "Shuaiba South Desal", capacity: "136K m³/day", status: "OPERATIONAL", note: "Southern. Co-located with power. Older MSF units." },
      { name: "Shuaiba North Desal", capacity: "68K m³/day", status: "OPERATIONAL", note: "Small MSF supplement. Aging." },
    ],
    energy: [
      { name: "Mina Al-Ahmadi Refinery (MAA)", type: "Refinery", capacity: "466K bpd", status: "OPERATIONAL", note: "Largest and oldest. KNPC. Running for domestic supply." },
      { name: "Mina Abdullah Refinery (MAB)", type: "Refinery", capacity: "270K bpd", status: "OPERATIONAL", note: "KNPC. Recently upgraded. Full domestic priority." },
      { name: "Al-Zour Refinery (New)", type: "Refinery", capacity: "615K bpd", status: "OPERATIONAL", note: "Newest mega-refinery. KIPIC. Came fully online 2023. Full domestic priority." },
      { name: "Az-Zour LNG Import Terminal", type: "LNG Regasification", capacity: "3 Bcm/yr", status: "AT RISK", note: "Critical gas import infrastructure. Gulf-facing. If hit, power grid collapses." },
      { name: "Burgan Oil Field", type: "Oil Field", capacity: "1.7 Mbpd", status: "PRODUCING", note: "World's 2nd largest. Southern Kuwait. Production continues, export blocked." },
      { name: "Northern Oil Fields (Ratqa/Sabriyah)", type: "Oil Field", capacity: "0.6 Mbpd combined", status: "AT RISK", note: "Near Iraqi border. Heavy oil. KOC operated." },
      { name: "Kuwait Gas Import Pipeline", type: "Gas Pipeline", capacity: "Limited import volume", status: "AT RISK", note: "Kuwait is net gas importer. Any cut collapses power grid within days." },
      { name: "KPC Strategic Oil Storage", type: "Strategic Reserve", capacity: "~10M bbl", status: "OPERATIONAL", note: "Domestic buffer for refinery feed. Limited duration." },
    ],
  },
  Oman: {
    ports: [
      { name: "Port Sultan Qaboos (Muscat)", type: "Commercial/Cruise", capacity: "Main commercial port", status: "OPERATIONAL", note: "Gulf of Oman coast. Insurance surcharges but still operating." },
      { name: "Port of Duqm", type: "Industrial/Naval", capacity: "Mega industrial zone + drydock", status: "STRUCK", note: "2 drone strikes Sunday (Oman News Agency). 1 expat worker injured. Was intended Hormuz bypass for region. Oman Drydock co-located." },
      { name: "Sohar Port & Free Zone", type: "Industrial/Commercial", capacity: "Major industrial hub", status: "OPERATIONAL", note: "Northern coast. Refinery, aluminum smelter, petrochemicals co-located." },
      { name: "Salalah Port", type: "Container/Transship", capacity: "5M TEU, top 30 globally", status: "OPERATIONAL", note: "Southern coast (Arabian Sea). Far from conflict. Insurance stable. APM Terminals." },
      { name: "Mina Al Fahal", type: "Oil Export", capacity: "Main crude oil terminal", status: "OPERATIONAL", note: "Muscat area. Gulf of Oman. OQ operated. Primary export point." },
      { name: "Khasab Port", type: "Commercial/Fishing", capacity: "Small commercial", status: "REDUCED", note: "Musandam Peninsula. Inside Strait of Hormuz. Reduced activity." },
      { name: "Suwaiq Port", type: "Fishing/Commercial", capacity: "Small coastal", status: "OPERATIONAL", note: "Batinah coast. Local trade." },
      { name: "Shinas Port", type: "Commercial", capacity: "Northern Batinah", status: "OPERATIONAL", note: "Near UAE border. Small commercial traffic." },
    ],
    airports: [
      { name: "Muscat International Airport", code: "MCT", status: "RESTRICTED", note: "Limited commercial flights. Military priority. Some evacuation flights." },
      { name: "Salalah Airport", code: "SLL", status: "OPERATIONAL", note: "Southern Oman. Outside conflict radius. Potential regional evac hub." },
      { name: "Duqm Airport", code: "DQM", status: "RESTRICTED", note: "Military use. Adjacent to damaged port. UK/US have used for logistics." },
      { name: "Suhar Airport", code: "OHS", status: "OPERATIONAL", note: "Northern Oman. Small. Some commercial potential as overflow." },
      { name: "Khasab Airport", code: "KHS", status: "RESTRICTED", note: "Musandam exclave. Inside Strait zone. Military coordination." },
      { name: "Thumrait Air Base", code: "Military", status: "ACTIVE", note: "Southern interior. US/UK logistics staging. Far from Gulf. Strategic depth." },
      { name: "Masirah Air Base", code: "Military", status: "ACTIVE", note: "Island off eastern coast. RAF/US use. Indian Ocean. Remote." },
    ],
    power: [
      { name: "Barka I IWPP", type: "Gas CCGT + Desal", capacity: "0.69 GW", status: "OPERATIONAL", note: "Northern coast. First IPP in Oman. AES/OETC." },
      { name: "Barka II IWPP", type: "Gas CCGT", capacity: "0.68 GW", status: "OPERATIONAL", note: "Adjacent expansion. Mitsui/ACWA." },
      { name: "Barka III IPP", type: "Gas CCGT", capacity: "0.74 GW", status: "OPERATIONAL", note: "Newest Barka block. OPWP contracted." },
      { name: "Barka IV IPP (Sohar 3)", type: "Gas CCGT", capacity: "0.75 GW", status: "OPERATIONAL", note: "Sometimes listed as Sohar 3. Northern grid expansion." },
      { name: "Sohar I IPP", type: "Gas CCGT + Desal", capacity: "0.6 GW", status: "OPERATIONAL", note: "Industrial zone. Co-located with refinery/smelter." },
      { name: "Sohar II IPP", type: "Gas CCGT", capacity: "0.75 GW", status: "OPERATIONAL", note: "Expansion for Sohar Free Zone demand." },
      { name: "Sur IPP", type: "Gas CCGT + Desal", capacity: "0.75 GW", status: "OPERATIONAL", note: "Eastern Oman coast. Al Sharqiyah region." },
      { name: "Al Kamil IPP", type: "Gas CCGT", capacity: "0.28 GW", status: "OPERATIONAL", note: "Interior eastern Oman. Small." },
      { name: "Wadi Al Jizzi Power", type: "Gas GT", capacity: "0.27 GW", status: "OPERATIONAL", note: "Northern interior. Near Sohar. Peaking." },
      { name: "Manah Power Plant", type: "Gas GT", capacity: "0.27 GW", status: "OPERATIONAL", note: "Interior Dakhliyah region." },
      { name: "Ibri Solar PV", type: "Solar", capacity: "0.5 GW", status: "OPERATIONAL", note: "Interior desert. Zero fuel dependency. ACWA/Sweihan." },
      { name: "Ibri II Solar PV", type: "Solar", capacity: "0.5 GW", status: "OPERATIONAL", note: "Expansion adjacent to Ibri I." },
      { name: "Amin Solar PV", type: "Solar", capacity: "0.1 GW", status: "OPERATIONAL", note: "PDO/Marubeni. Interior. Oilfield power support." },
      { name: "Salalah IWPP", type: "Gas CCGT + Desal", capacity: "0.45 GW", status: "OPERATIONAL", note: "Southern grid independent from main interconnected system. Safe zone." },
      { name: "Salalah II IPP", type: "Gas CCGT", capacity: "0.45 GW", status: "OPERATIONAL", note: "Dhofar grid expansion. Arabian Sea coast." },
      { name: "Dhofar Wind Farm", type: "Wind", capacity: "0.05 GW", status: "OPERATIONAL", note: "Southern Oman. Masdar/OPWP. Monsoon winds." },
      { name: "PDO Amal/Nimr Solar", type: "Solar Steam", capacity: "1.0 GW thermal", status: "OPERATIONAL", note: "Oilfield EOR thermal solar. Not electric but reduces gas burn for oil extraction." },
    ],
    desal: [
      { name: "Barka I Desal (MSF)", capacity: "91K m³/day", status: "OPERATIONAL", note: "Northern coast. Co-located with power." },
      { name: "Barka II Desal (MED)", capacity: "120K m³/day", status: "OPERATIONAL", note: "Multi-effect distillation. Adjacent to Barka I." },
      { name: "Barka V IWP (RO)", capacity: "281K m³/day", status: "OPERATIONAL", note: "Major SWRO. Newest addition. ACWA/Veolia." },
      { name: "Sohar I Desal (MSF)", capacity: "150K m³/day", status: "OPERATIONAL", note: "Industrial and residential supply." },
      { name: "Sur Desal (MSF)", capacity: "80K m³/day", status: "OPERATIONAL", note: "Eastern coast. Local supply." },
      { name: "Ghubrah I Desal (MSF)", capacity: "191K m³/day", status: "OPERATIONAL", note: "Muscat. Feeds capital. Aging plant." },
      { name: "Ghubrah II IWP (RO)", capacity: "300K m³/day", status: "OPERATIONAL", note: "Major new SWRO serving Muscat. OPWP contracted." },
      { name: "Salalah Desal", capacity: "68K m³/day", status: "OPERATIONAL", note: "Southern grid. Independent supply." },
      { name: "Qurayyat Desal (RO)", capacity: "200K m³/day", status: "OPERATIONAL", note: "South of Muscat. ACWA Power. Major new plant." },
      { name: "Sharqiyah IWP (RO)", capacity: "80K m³/day", status: "OPERATIONAL", note: "Eastern region supplementary." },
    ],
    energy: [
      { name: "Sohar Refinery (OQ)", type: "Refinery", capacity: "198K bpd", status: "OPERATIONAL", note: "Running full for domestic. OQ/Oman Oil." },
      { name: "Duqm Refinery (OQ-Kuwait Petroleum)", type: "Refinery", capacity: "230K bpd", status: "REDUCED", note: "Near damaged port. Operating with security concerns. JV with Kuwait." },
      { name: "Mina Al Fahal Refinery (OQ)", type: "Refinery", capacity: "106K bpd", status: "OPERATIONAL", note: "Muscat area. Oldest refinery. Domestic fuel." },
      { name: "Oman LNG (Qalhat)", type: "LNG", capacity: "10.4 Mtpa (3 trains)", status: "OPERATIONAL", note: "Qalhat, Sur coast. Gulf of Oman. Exporting via non-Hormuz route." },
      { name: "Oman-UAE Gas Pipeline", type: "Gas Pipeline", capacity: "Limited volume", status: "OPERATIONAL", note: "Oman is gas self-sufficient. Minor surplus capacity." },
      { name: "Yibal Gas Field (PDO)", type: "Gas Field", capacity: "Largest gas field", status: "PRODUCING", note: "Interior. PDO operated. Feeds domestic power." },
      { name: "Khazzan Tight Gas (bp)", type: "Gas Field", capacity: "1.5 Bcf/day", status: "PRODUCING", note: "bp operated. Block 61. Massive tight gas. Interior Oman." },
      { name: "Rabab Harweel Gas (PDO)", type: "Gas Field", capacity: "0.5 Bcf/day", status: "PRODUCING", note: "Southern interior. PDO. Feeds Salalah + export." },
      { name: "Fahud Oil Field (PDO)", type: "Oil Field", capacity: "Major production", status: "PRODUCING", note: "Interior. PDO operated. Oman's most prolific." },
    ],
  },
  Bahrain: {
    ports: [
      { name: "Khalifa bin Salman Port", type: "Commercial", capacity: "1.1M TEU, main import port", status: "REDUCED", note: "Shipping avoiding Gulf. Import disruptions building. APM Terminals operated." },
      { name: "Mina Salman", type: "Naval/Legacy Commercial", capacity: "5th Fleet adjacent", status: "STRUCK", note: "5th Fleet HQ hit by drone (radar dome). Juffair area evacuated, declared 'no longer safe.' Smoke visible." },
      { name: "Bahrain LNG Import Terminal", type: "LNG Regasification", capacity: "0.8 Bcf/day", status: "AT RISK", note: "FSRU-based. Gulf-facing. Critical supplementary gas source. Teekay/Samsung." },
      { name: "BAPCO Sitra Oil Terminal", type: "Oil Export/Import", capacity: "Refinery marine terminal", status: "OPERATIONAL", note: "Crude import and product export for BAPCO refinery." },
      { name: "ALBA Port (Aluminum)", type: "Industrial", capacity: "Aluminum export", status: "REDUCED", note: "Aluminum Bahrain. One of world's largest smelters. Export disrupted." },
    ],
    airports: [
      { name: "Bahrain International Airport", code: "BAH", status: "STRUCK", note: "Drone hit Sunday, material damage per Interior Ministry. All flights suspended. New terminal opened 2021." },
      { name: "Isa Air Base (Sheikh Isa)", code: "Military", status: "ACTIVE", note: "Bahrain Defense Force. Southern island. Also hosts US assets. Potential target." },
      { name: "Muharraq Airfield", code: "Military/Legacy", status: "ACTIVE", note: "Adjacent to BAH. Military operations. 5th Fleet air component." },
    ],
    power: [
      { name: "Al Dur IWPP Phase I", type: "Gas CCGT + Desal", capacity: "1.23 GW", status: "OPERATIONAL", note: "Southern Bahrain. GDF Suez/APICORP. Gas supply barely meets demand." },
      { name: "Al Dur IWPP Phase II", type: "Gas CCGT + Desal", capacity: "0.94 GW", status: "OPERATIONAL", note: "Expansion. EWA/ENGIE. Commissioned 2022. Still reliant on tight gas supply." },
      { name: "Al Hidd Power & Desal", type: "Gas Steam + CCGT + Desal", capacity: "1.0 GW", status: "OPERATIONAL", note: "Eastern coast. Combined power-desal. GE turbines." },
      { name: "Al Ezzel Power", type: "Gas CCGT", capacity: "0.96 GW", status: "OPERATIONAL", note: "Adjacent to ALBA smelter. Feeds industrial load. GDF/Sumitomo." },
      { name: "Riffa Power Station", type: "Gas GT", capacity: "0.53 GW", status: "OPERATIONAL", note: "Central Bahrain. Peaking capacity. EWA operated." },
      { name: "Sitra Power Station", type: "Gas GT/Steam", capacity: "0.42 GW", status: "OPERATIONAL", note: "Near BAPCO refinery. Cogeneration. Aging." },
      { name: "ALBA Captive Power (Block 3/4)", type: "Gas CCGT", capacity: "1.8 GW", status: "OPERATIONAL", note: "Dedicated to ALBA aluminum smelter. Largest single industrial load in Bahrain." },
      { name: "BAPCO Refinery Captive Power", type: "Gas Cogen", capacity: "0.3 GW", status: "OPERATIONAL", note: "Self-generation for refinery operations." },
    ],
    desal: [
      { name: "Al Dur Phase I Desal (MSF)", capacity: "218K m³/day", status: "OPERATIONAL", note: "Southern Bahrain. MSF technology. If hit, major water loss." },
      { name: "Al Dur Phase II Desal (RO)", capacity: "146K m³/day", status: "OPERATIONAL", note: "Newer SWRO addition. More efficient." },
      { name: "Al Hidd Desal (MSF + RO)", capacity: "273K m³/day", status: "OPERATIONAL", note: "Eastern coast. Combined MSF + RO. Critical for Muharraq/Manama." },
      { name: "Sitra Desal", capacity: "45K m³/day", status: "OPERATIONAL", note: "Small supplementary. Near refinery." },
      { name: "Ras Abu Jarjur Groundwater", capacity: "~50K m³/day (declining)", status: "DEPLETING", note: "Legacy wellfield. Severe salinization. Not reliable long-term backup." },
      { name: "Addur Emergency SWRO", capacity: "45K m³/day", status: "OPERATIONAL", note: "Small emergency supplement. EWA." },
    ],
    energy: [
      { name: "BAPCO Refinery (Sitra)", type: "Refinery", capacity: "267K bpd", status: "OPERATIONAL", note: "Only refinery. Modernization completed 2024. Running full for domestic." },
      { name: "Bahrain Field (BAPCO)", type: "Oil Field", capacity: "~45K bpd + gas", status: "PRODUCING", note: "Discovered 1932. First Gulf oil. Declining but still producing." },
      { name: "Bahrain Gas (Khuff)", type: "Gas Field", capacity: "~1.5 Bcf/day", status: "STRAINED", note: "Deeper gas reservoirs. Production barely meets demand. No surplus." },
      { name: "Bahrain LNG Import (FSRU)", type: "LNG Regasification", capacity: "0.8 Bcf/day", status: "AT RISK", note: "Floating regasification. Gulf-facing. Critical gas supplement since 2019." },
      { name: "ALBA Aluminum Smelter", type: "Industrial", capacity: "1.56 Mtpa aluminum", status: "AT RISK", note: "One of world's largest smelters. 12% of GDP. Massive power consumer. Any power cut = pot line freeze." },
      { name: "King Fahd Causeway", type: "Road/Bridge Link", capacity: "To Saudi Arabia, 25km", status: "OPERATIONAL", note: "Only land exit from island. Evacuation route. Supply corridor. Potential bottleneck." },
      { name: "Saudi-Bahrain Gas Pipeline (proposed)", type: "Pipeline", capacity: "Not yet built", status: "NOT AVAILABLE", note: "Long-discussed gas interconnect to Saudi. Never completed. Would have been critical now." },
    ],
  },
};

// ─────────── NEXUS RISKS ───────────
const nexusRisks = [
  {
    icon: "⛽", title: "Hormuz Closure → Dual Revenue-Import Blockade",
    severity: "CRITICAL", color: C.red,
    mechanism: "A single chokepoint controls both the outflow of oil/LNG revenue and the inflow of food, medicine, and goods. Closure means governments simultaneously lose income and the ability to buy essentials. No GCC state can sustain both shocks beyond 4-6 weeks.",
    affected: ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman", "Bahrain"],
    chain: ["Hormuz closed", "Oil/LNG exports trapped", "Revenue collapse", "Food/goods imports blocked", "Rationing + fiscal crisis"],
  },
  {
    icon: "💧", title: "Gas Supply → Power Grid → Desalination → Water Crisis",
    severity: "CRITICAL", color: C.red,
    mechanism: "Kuwait, UAE, and Bahrain import gas or run on razor-thin domestic supply. Gas powers 94-99% of electricity, and electricity powers desalination, which provides 42-99% of drinking water. A single failure anywhere in this chain triggers a water emergency within 1-2 days. Kuwait has 1 day of reserves. Qatar has 1.5 days.",
    affected: ["Kuwait", "UAE", "Bahrain", "Qatar"],
    chain: ["Gas disrupted (pipeline/import)", "Power plants lose fuel", "Desalination stops", "Water reserves depleted (1-2 days)", "Humanitarian crisis"],
  },
  {
    icon: "🚢", title: "Port/Airport Strikes → Supply Chain Severance → Civilian Shortages",
    severity: "CRITICAL", color: C.red,
    mechanism: "GCC states import 80-90% of food by sea and air. Jebel Ali (halted), DXB (closed), Kuwait airport (damaged), Bahrain airport (struck). When both maritime and aviation routes are simultaneously disrupted, there is no alternative delivery mechanism for an import-dependent population of 60M+ people.",
    affected: ["UAE", "Kuwait", "Bahrain", "Qatar"],
    chain: ["Ports/airports struck", "Shipping halted + airspace closed", "Import pipeline severed", "Food/medicine stockpiles deplete", "Civilian shortages in 2-3 weeks"],
  },
  {
    icon: "🏃", title: "Expat Confidence Collapse → Capital Flight → Economic Spiral",
    severity: "HIGH", color: C.orange,
    mechanism: "The UAE (88% expat), Qatar (85%), Kuwait (70%) built their economies on the premise of safety and stability. Visible destruction of Burj Al Arab, DXB, and residential areas shatters that premise. Expats cannot leave (airspace closed) but will not stay. When airspace reopens, mass departures trigger real estate crashes, banking withdrawals, and a self-reinforcing economic contraction.",
    affected: ["UAE", "Qatar", "Kuwait", "Bahrain"],
    chain: ["Iconic landmarks hit", "Safety narrative destroyed", "Expats signal departure", "Airspace reopens → mass exodus", "Real estate crash + capital flight"],
  },
  {
    icon: "🎯", title: "US Base Proximity → Escalation Magnet → Civilian Collateral",
    severity: "HIGH", color: C.orange,
    mechanism: "Al-Udeid (Qatar), 5th Fleet HQ (Bahrain), and multiple bases across the Gulf make host nations co-belligerents in Iran's targeting calculus. These bases sit within or adjacent to dense civilian populations. Qatar's Al-Udeid is 30km from central Doha. Bahrain's 5th Fleet is inside Manama. Iran has demonstrated willingness to strike near both, with civilian casualties already occurring.",
    affected: ["Qatar", "Bahrain", "Kuwait"],
    chain: ["US bases used for strikes", "Iran targets bases", "Misses/debris hit civilians", "Host nation becomes primary target", "Escalation beyond host's control"],
  },
  {
    icon: "📋", title: "Insurance Withdrawal → Maritime Freeze → Bypass Routes Fail",
    severity: "HIGH", color: C.orange,
    mechanism: "Lloyd's and major insurers have cancelled coverage for Gulf-transiting vessels. This affects not just Hormuz but the entire Arabian Gulf, Gulf of Oman, and northern Arabian Sea. Even Oman's Duqm port (outside Hormuz, intended as a bypass) was struck by a drone, causing premiums for alternative routes to surge. When insurance markets freeze, shipping stops regardless of whether routes are physically open.",
    affected: ["All GCC", "Oman", "UAE"],
    chain: ["Tankers/ships struck", "Insurers cancel Gulf coverage", "Carriers refuse sailings", "Even bypass routes uninsurable", "Total maritime freeze"],
  },
  {
    icon: "📡", title: "Submarine Cables + Telco Infra → Data/Comms Blackout → Financial Isolation",
    severity: "HIGH", color: C.orange,
    mechanism: "GCC internet connectivity depends on submarine fiber optic cables transiting the Strait of Hormuz and Red Sea (FLAG, EIG, AAE-1, IMEWE, Gulf Bridge International). Multiple cables pass through or near active conflict zones. Iran demonstrated internet shutdown capability domestically (connectivity fell to 4% per NetBlocks). Physical cable damage from anchored ships, naval mines, or deliberate sabotage could sever Gulf states from global internet backbone. Financial systems (SWIFT, interbank transfers, stock exchanges) depend on this connectivity. Emirates NBD, QNB, FAB all rely on real-time data links.",
    affected: ["UAE", "Qatar", "Bahrain", "Kuwait", "Oman"],
    chain: ["Submarine cables in conflict zone", "Physical damage or sabotage", "Internet/data connectivity severed", "Financial systems go offline", "Banking + trade settlement freeze"],
  },
];

// ─────────── COUNTRY DATA ───────────
const countries = [
  {
    name: "Saudi Arabia", pop: 36.9, oilProd: 9.0, oilExport: 6.3, gasSelf: false,
    gasNote: "Burns oil for 39% of electricity. 300k bbl/day for desalination alone.",
    foodImport: 85, desalPct: 70, elecPeakGW: 72.9, elecGas: 61, elecOil: 39, waterDays: 2,
    preWar: { food: 40, water: 50, electricity: 35, chokepoint: 30, fiscal: 25, infra: 15, military: 20 },
    wartime: { food: 72, water: 78, electricity: 62, chokepoint: 88, fiscal: 55, infra: 48, military: 52 },
    warStatus: "UNDER ATTACK", warDetail: "Day 4: US Embassy in Riyadh hit by 2 drones (limited fire, minor damage per Saudi MOD/CNN). 8 drones intercepted near Riyadh and Al-Kharj (Saudi MOD Tuesday). Trump vowed revenge. Ras Tanura refinery SHUT DOWN Monday after Shahed-136 drone strike (Aramco halted ops per Bloomberg/SPA). Prince Sultan Air Base targeted (intercepted). No comprehensive interception figures released by Saudi MOD. Saudi source warned retaliatory strikes on Iranian oil facilities if 'concerted' Aramco attacks continue (AFP). Kingdom summoned Iranian envoy.",
    infraHits: ["US Embassy Riyadh (2 drones hit Tuesday, limited fire, minor damage)", "Ras Tanura Refinery (SHUT DOWN, Shahed-136 drone, fire contained)", "Ras Tanura Oil Terminal (loadings halted)", "Prince Sultan Air Base, Al Kharj (missiles intercepted)", "King Khalid Intl Airport, Riyadh (targeted per AFP)", "Eastern Province oil facilities (intercepted drones)", "Juaymah LPG facility (operational disruption last week)"],
    keyRisk: "Only GCC state with Red Sea access. East-West pipeline (5 Mbpd) becomes critical if Hormuz stays closed. Burns 1/3 of oil production domestically. Largest food importer in region by volume.",
    altRoute: { text: "East-West Pipeline to Yanbu (Red Sea), 5 Mbpd. Only GCC state with Red Sea access.", viability: "PARTIAL" },
    kpis: [
      { label: "US Embassy", value: "HIT", sub: "2 drones, fire Tuesday", color: C.red },
      { label: "Ras Tanura", value: "SHUT DOWN", sub: "550K bpd offline", color: C.red },
      { label: "Hormuz Bypass", value: "5 Mbpd", sub: "E-W Pipeline maxed", color: C.amber },
      { label: "East Airports", value: "CLOSED", sub: "DMM, RUH restricted", color: C.red },
      { label: "Jeddah Port", value: "SURGING", sub: "Red Sea diverted cargo", color: C.green },
      { label: "Oil Price", value: "$80+/bbl", sub: "Brent surging ~10%", color: C.orange },
    ],
    scenarios: [
      { name: "Hormuz closure 2+ weeks", sev: 75, impact: "Oil revenue drops ~60%. East-West Pipeline maxed at 5 Mbpd. Fiscal breakeven breach." },
      { name: "Strike on Jubail desalination", sev: 95, impact: "90% of Riyadh water cut. Evacuation within 7 days per leaked US cables." },
      { name: "Oil spike to $130/bbl", sev: 25, impact: "Massive fiscal windfall IF exports reach market via Yanbu. Incentive to keep conflict contained." },
      { name: "Prolonged conflict (30+ days)", sev: 70, impact: "Vision 2030 freezes. FDI collapses. Tourism halted. Expat exodus begins." },
    ],
  },
  {
    name: "UAE", pop: 10.1, oilProd: 3.4, oilExport: 2.6, gasSelf: false,
    gasNote: "Imports ~30% of gas from Qatar via Dolphin pipeline. Barakah nuclear provides ~6% of power.",
    foodImport: 85, desalPct: 42, elecPeakGW: 34.0, elecGas: 94, elecOil: 0, waterDays: 2,
    preWar: { food: 35, water: 30, electricity: 20, chokepoint: 45, fiscal: 20, infra: 10, military: 15 },
    wartime: { food: 82, water: 75, electricity: 68, chokepoint: 95, infra: 88, fiscal: 72, military: 65 },
    warStatus: "UNDER ATTACK", warDetail: "Heaviest hit GCC state. UAE MOD cumulative totals (CNN Tuesday): 182 ballistic missiles detected (169 intercepted, 13 fell in sea), 689 drones detected (645 intercepted, 44 landed in country), 8 cruise missiles destroyed. 3 killed (Pakistani, Nepalese, Bangladeshi nationals). 68+ injured. Day 3-4: Al Salam Naval Base Abu Dhabi hit by 2 drones (warehouse fire). Musaffah fuel tank terminal struck (fire contained). ICAD warehouse damaged. Al Hamra RAK damaged. Earlier: Jebel Ali port fire. Burj Al Arab facade fire. DXB T3 struck. Zayed Airport (1 killed, 7 wounded). Recalled ambassadors to Iran AND Israel. US State Dept urged all citizens to depart ME immediately. Remote work mandated.",
    infraHits: ["DXB Terminal 3 (drone strike Saturday)", "Jebel Ali Port (fire from debris, ops halted)", "Burj Al Arab facade (drone debris fire, contained)", "Abu Dhabi Zayed Airport (1 killed, 7 injured)", "Al Salam Naval Base, Abu Dhabi (2 drones Sunday, warehouse fire)", "Al Dhafra Air Base area (smoke reported Saturday)", "Musaffah fuel tank terminal (drone strike Monday, fire contained)", "ICAD industrial, Abu Dhabi (drone debris Monday)", "Etihad Towers, Abu Dhabi (debris, woman + child minor injuries)", "Al Hamra Village, Ras Al Khaimah (intercepted drone damage Monday)", "Sharjah industrial area (struck Saturday)", "Dubai residential areas (debris from interceptions)", "Hamriyah Free Zone, Sharjah (near industrial hits)", "Palm Jumeirah area (blast debris visible)"],
    keyRisk: "88% expat population. Jebel Ali + free zone = 36% of Dubai GDP. All 5 airports closed. Dolphin pipeline from Qatar is a single point of failure for 30% of gas supply.",
    altRoute: { text: "ADCOP pipeline to Fujairah (outside Hormuz), 1.5 Mbpd. Fujairah still near conflict zone.", viability: "LIMITED" },
    kpis: [
      { label: "Jebel Ali", value: "HALTED", sub: "36% Dubai GDP", color: C.red },
      { label: "DXB", value: "CLOSED", sub: "T3 struck Saturday", color: C.red },
      { label: "Intercepted", value: "879+", sub: "182 BM + 8 CM + 689 UAV", color: C.red },
      { label: "Dolphin Gas", value: "AT RISK", sub: "30% of gas supply", color: C.orange },
      { label: "Casualties", value: "3 + 68", sub: "Dead + injured", color: C.red },
      { label: "Drones landed", value: "44", sub: "Inside UAE territory", color: C.red },
    ],
    scenarios: [
      { name: "Jebel Ali closed 1+ week", sev: 92, impact: "36% of Dubai GDP disrupted. Supply chain collapse. Container rerouting adds weeks." },
      { name: "Airspace stays closed", sev: 88, impact: "Emirates/Etihad grounded. Tourism (15% GDP) collapses. Tens of thousands stranded." },
      { name: "Expat confidence collapse", sev: 85, impact: "88% expat pop. Mass departures when airspace opens. Real estate crash. Safe haven brand destroyed." },
      { name: "Dolphin pipeline disrupted", sev: 90, impact: "Gas from Qatar cut. 94% electricity gas-powered. Barakah only 6%. Rolling blackouts within days." },
    ],
  },
  {
    name: "Qatar", pop: 2.7, oilProd: 1.3, oilExport: 0.5, gasSelf: true,
    gasNote: "World's 3rd largest gas reserves. LNG output rising to 142 Mtpa by 2030. North Field is crown jewel.",
    foodImport: 90, desalPct: 99, elecPeakGW: 9.81, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 50, water: 55, electricity: 15, chokepoint: 55, fiscal: 15, infra: 10, military: 25 },
    wartime: { food: 90, water: 88, electricity: 52, chokepoint: 95, infra: 70, fiscal: 45, military: 55 },
    warStatus: "UNDER ATTACK", warDetail: "MAJOR ESCALATION: Qatar Emiri Air Force shot down 2 Iranian Su-24 Fencer bombers (first air-to-air combat of conflict, Qatar MOD). Also intercepted 7 ballistic missiles and 5 drones on Day 3 alone. QatarEnergy HALTED ALL LNG PRODUCTION after Iranian drones struck Ras Laffan Industrial City and Mesaieed Industrial City (~20% of global LNG offline, CNBC/AFP/NGI). European gas prices surged 45%. No casualties at energy sites. Earlier: 65 missiles + 12 drones Saturday. Al-Udeid breached (2 missiles + 1 drone). Hamad Airport targeted. Doha industrial district struck. 16 injured total. FM Majed Al Ansari: Qatar 'not engaging with Iran at the moment.'",
    infraHits: ["Ras Laffan Industrial City (drone strike, LNG production halted)", "Mesaieed Industrial City (drone strike, power plant water tank hit)", "Al-Udeid Air Base (2 missiles + 1 drone reached, minor damage)", "Hamad International Airport (targeted, intercepted per FM)", "2 Iranian Su-24 Fencer bombers SHOT DOWN by QEAF", "Doha industrial district (struck, smoke rising)", "Southern Doha residential areas (shrapnel, debris falling)", "7 ballistic missiles intercepted Day 3", "5 drones neutralized by QEAF + Navy Day 3"],
    keyRisk: "99% desalinated water. 90% food imported. Hormuz closure traps ALL LNG exports and severs food imports simultaneously. 1.5 days of water reserves. Al-Udeid makes Qatar a priority target.",
    altRoute: { text: "No pipeline bypass. 100% of LNG transits Hormuz. $80B North Field expansion at risk.", viability: "NONE" },
    kpis: [
      { label: "LNG", value: "ALL HALTED", sub: "20% global supply offline", color: C.red },
      { label: "Su-24s", value: "2 SHOT DOWN", sub: "First air-to-air combat", color: C.red },
      { label: "Ras Laffan", value: "STRUCK", sub: "Drone hit, production stopped", color: C.red },
      { label: "Al-Udeid", value: "BREACHED", sub: "2 missiles + 1 drone hit", color: C.red },
      { label: "Intercepted", value: "89+", sub: "65 BM + 12 UAV Sat + 12 Day3", color: C.red },
      { label: "Water", value: "1.5 DAYS", sub: "99% desalinated", color: C.red },
    ],
    scenarios: [
      { name: "Hormuz traps LNG fleet", sev: 95, impact: "World's largest LNG exporter frozen. Entire export revenue halted. Asian buyers scramble." },
      { name: "Al-Udeid escalation", sev: 80, impact: "US ops from base make Qatar primary target. Civilian Doha 30km away at extreme risk." },
      { name: "Food imports severed", sev: 75, impact: "90% food via Hormuz. 300k MT rice silos tested. Rationing within 2-3 weeks." },
      { name: "Mediation role collapses", sev: 60, impact: "Diplomatic bridge to Iran destroyed. Post-war influence diminished." },
    ],
  },
  {
    name: "Kuwait", pop: 4.9, oilProd: 2.7, oilExport: 1.9, gasSelf: false,
    gasNote: "Net gas importer. Repeated power cuts 2024-2025 in peacetime. Grid already failing before war.",
    foodImport: 90, desalPct: 90, elecPeakGW: 17.64, elecGas: 99, elecOil: 1, waterDays: 1,
    preWar: { food: 48, water: 62, electricity: 55, chokepoint: 60, fiscal: 30, infra: 20, military: 30 },
    wartime: { food: 88, water: 92, electricity: 90, chokepoint: 95, infra: 72, fiscal: 68, military: 62 },
    warStatus: "UNDER ATTACK", warDetail: "Kuwait intercepted 178 ballistic missiles and 384 drones (KUNA Tuesday, up from 97+283 Monday). 1 Kuwaiti civilian killed, 32 wounded (MOH). 3 US soldiers KIA by Iranian attacks (CENTCOM). 3 US F-15E Strike Eagles shot down by Kuwaiti air defenses in friendly fire incident (CENTCOM confirmed, all 6 crew ejected safely, Kuwait acknowledged). Ali Al Salem Air Base runway 'sustained extensive damage' (Italian Deputy PM). Kuwait Airport struck Saturday. Day 3-4: smoke near US embassy, drones intercepted over Rumaithiya/Salwa residential areas (KUNA). Debris fell at Mina Al-Ahmadi refinery (2 workers minor injuries). Kuwaiti air defenses intercepted 'hostile aerial targets at dawn' over central parts (Army statement Tuesday).",
    infraHits: ["Ali Al Salem Air Base (runway extensively damaged, Italian FM)", "Kuwait International Airport (drone strike, terminal damage)", "US Embassy area (Day 3-4, smoke rising, drones intercepted)", "Mina Al-Ahmadi Refinery (debris fell Monday, 2 workers injured)", "3 US F-15E Strike Eagles (shot down by Kuwaiti friendly fire, crews safe)", "Rumaithiya neighborhood (drones intercepted overhead)", "Salwa neighborhood (drones intercepted overhead)", "Air defense activated nationwide, sirens continuous Day 4"],
    keyRisk: "Most structurally vulnerable GCC state. 90% desal, 90% food import, net gas importer, 1 day water reserves. Power grid was already failing in peacetime (2024-25 blackouts).",
    altRoute: { text: "No alternative routes. Fully landlocked to the Gulf. 100% Hormuz dependent.", viability: "NONE" },
    kpis: [
      { label: "Intercepted", value: "562", sub: "178 BM + 384 drones", color: C.red },
      { label: "Killed", value: "1 + 3 US", sub: "Civilian + US soldiers KIA", color: C.red },
      { label: "F-15Es", value: "3 DOWN", sub: "Friendly fire, crews safe", color: C.orange },
      { label: "Water", value: "1 DAY", sub: "Lowest in GCC", color: C.red },
      { label: "Airport", value: "HIT", sub: "Drone, terminal damage", color: C.red },
      { label: "Injured", value: "32 + 5 US", sub: "Civilian + US seriously", color: C.red },
    ],
    scenarios: [
      { name: "Gas imports disrupted", sev: 95, impact: "99% gas-fired power. No surplus. Grid collapse in days. Desal stops. 1 day water." },
      { name: "Summer peak + conflict", sev: 92, impact: "17.64 GW peak demand. Already had peacetime blackouts. Grid failure near-certain." },
      { name: "Food chain severed", sev: 88, impact: "90% food imported via Hormuz. 4.9M people face rationing in under 2 weeks." },
      { name: "Oil exports stranded", sev: 85, impact: "1.9 Mbpd stranded. Just passed debt law 2025. Limited borrowing headroom." },
    ],
  },
  {
    name: "Oman", pop: 5.2, oilProd: 1.1, oilExport: 0.8, gasSelf: true,
    gasNote: "Slight gas surplus. Port of Duqm on Indian Ocean was the Hormuz alternative until it was struck.",
    foodImport: 80, desalPct: 86, elecPeakGW: 8.4, elecGas: 99, elecOil: 0, waterDays: 1.5,
    preWar: { food: 35, water: 40, electricity: 25, chokepoint: 20, fiscal: 35, infra: 10, military: 20 },
    wartime: { food: 75, water: 80, electricity: 55, chokepoint: 65, infra: 55, fiscal: 65, military: 58 },
    warStatus: "TARGETED", warDetail: "Only GCC state not struck on Day 1. Port of Duqm hit by 2 drones Sunday (1 expat worker injured per Oman News Agency). 3 oil tankers attacked near Strait of Hormuz, Iran claimed responsibility (Bloomberg). Oil tanker struck off northern coast near Khasab was 'set ablaze.' Day 3: oil tanker MKD VYOM attacked by explosive-laden boat 52nm off Muscat, fire and engine-room explosion killed at least 1 crew member (Oman Maritime Security Centre). GCC condemned attacks on Oman as particularly egregious given its mediator role. FM Badr Al Busaidi: Geneva talks made 'genuine progress toward unprecedented agreement' and 'the door to diplomacy remains open.'",
    infraHits: ["Port of Duqm (2 drones Sunday, 1 worker injured per ONA)", "Oil tanker ablaze off northern coast near Khasab", "Tanker MKD VYOM (explosive boat attack 52nm off Muscat, 1 killed Monday)", "3 tankers attacked near Hormuz (Iran claimed responsibility)", "Muscat airport restricted (military priority)", "Maritime approaches elevated risk zone"],
    keyRisk: "Duqm was the strategic Hormuz alternative for the region. Its targeting changes the entire bypass calculus. FM's rebuke of the US signals diplomatic fracture. Salalah port on the Arabian Sea remains furthest from conflict.",
    altRoute: { text: "Duqm on Indian Ocean (outside Hormuz). Struck once but partially viable. Salalah further south, still operational.", viability: "PARTIAL" },
    kpis: [
      { label: "Duqm Port", value: "DAMAGED", sub: "Bypass strategy hit", color: C.orange },
      { label: "Salalah", value: "OPERATIONAL", sub: "Far from conflict", color: C.green },
      { label: "Gas", value: "SELF-SUFF", sub: "Slight surplus", color: C.green },
      { label: "Muscat Air", value: "RESTRICTED", sub: "Limited flights", color: C.amber },
      { label: "Tankers", value: "STRUCK", sub: "Offshore hit", color: C.orange },
      { label: "Diplomacy", value: "FRACTURED", sub: "FM rebuke of US", color: C.orange },
    ],
    scenarios: [
      { name: "Duqm as bypass route", sev: 40, impact: "Could still bypass Hormuz. But struck once, insurance uncertain. Salalah is safer." },
      { name: "Mediator credibility gone", sev: 70, impact: "Unique position with Iran erased. Post-war influence shifts to others." },
      { name: "Tanker attacks off coast", sev: 75, impact: "Even outside Hormuz, shipping insurance surges. Maritime economy hit." },
      { name: "Fiscal strain", sev: 60, impact: "Gas self-sufficient but limited reserves. Prices help only if exports flow." },
    ],
  },
  {
    name: "Bahrain", pop: 1.5, oilProd: 0.2, oilExport: 0.04, gasSelf: false,
    gasNote: "Gas production barely meets demand. No import pipeline. Hosts US 5th Fleet. Most exposed militarily.",
    foodImport: 85, desalPct: 60, elecPeakGW: 3.8, elecGas: 99, elecOil: 0, waterDays: 1,
    preWar: { food: 42, water: 38, electricity: 35, chokepoint: 55, fiscal: 48, infra: 15, military: 30 },
    wartime: { food: 85, water: 82, electricity: 78, chokepoint: 95, infra: 82, fiscal: 80, military: 85 },
    warStatus: "UNDER ATTACK", warDetail: "Bahrain Defense Force intercepted 70 missiles and 76 drones (BDF Tuesday, up from 45+9). Attacks include Shahed-136 type. 5th Fleet HQ struck (drone hit radar dome). Shahed-136 slammed into Hoora residential tower, setting it ablaze. Era View tower heavy drone damage. Breaker tower fire. Crowne Plaza Hotel hit Sunday. Airport struck Sunday (material damage). Seef commercial district damaged. UKMTO reported vessel struck by 2 unknown projectiles at Bahrain port, sparking fire (1 killed). NAVCENT concluded Juffair 'no longer safe,' ordered full evacuation. 2 DoD employees injured. Military family departure authorized. Bridge closed. Sirens sounding Day 4.",
    infraHits: ["US 5th Fleet HQ, Juffair (drone hit radar dome)", "Hoora residential tower (Shahed-136 direct hit, ablaze)", "Era View residential tower (direct drone strike, heavy damage)", "Breaker residential tower (fire, under investigation)", "Crowne Plaza Hotel, Manama (struck Sunday)", "Bahrain Intl Airport (drone, material damage Sunday)", "Seef commercial district (building damaged)", "Salman Industrial City (debris killed 1 worker Monday)", "Multiple residential buildings (civil defense deployed)", "Juffair base area (evacuated, 'no longer safe')"],
    keyRisk: "Smallest, most exposed. 5th Fleet HQ makes it a primary target. Entire country is a small island with 1.5M people and nowhere to shelter. 1 day water reserves. Gas barely meets demand with zero import capacity.",
    altRoute: { text: "Negligible oil exports. King Fahd Causeway to Saudi Arabia is only land exit.", viability: "N/A" },
    kpis: [
      { label: "5th Fleet", value: "HIT", sub: "Juffair evacuated", color: C.red },
      { label: "Intercepted", value: "146", sub: "70 missiles + 76 drones", color: C.red },
      { label: "Casualties", value: "2 DEAD", sub: "Worker + port vessel crew", color: C.red },
      { label: "Causeway", value: "CLOSED", sub: "Bridge shut, trapped", color: C.red },
      { label: "Residential", value: "3+ TOWERS", sub: "Direct drone hits", color: C.red },
      { label: "Airport", value: "STRUCK", sub: "Flights suspended", color: C.red },
    ],
    scenarios: [
      { name: "5th Fleet escalation", sev: 92, impact: "Primary US naval HQ draws maximum Iranian fire. 1.5M on small island, nowhere to go." },
      { name: "Residential casualties", sev: 88, impact: "Drone in apartment sets precedent. Any miss hits civilians. Instability risk." },
      { name: "Fiscal collapse", sev: 78, impact: "0.04 Mbpd exports. Oil funds 1/3 of revenue. Needs Saudi/GCC financial lifeline." },
      { name: "Water + power failure", sev: 90, impact: "Gas barely meets demand. 1 day reserves. Any infra hit cascades within hours." },
    ],
  },
];

// ─────────── UI COMPONENTS ───────────
const useIsMobile = () => {
  const [m, setM] = useState(typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
};

const Pulse = ({ color, size = 8 }) => (<span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: color, boxShadow: `0 0 ${size}px ${color}`, animation: "pulse 2s infinite", flexShrink: 0 }} />);

const Badge = ({ score, small }) => { const col = riskColor(score); return (<span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "1px 6px" : "2px 10px", borderRadius: 16, fontSize: small ? 9 : 11, fontWeight: 700, color: col, border: `1px solid ${col}30`, background: `${col}12`, whiteSpace: "nowrap", flexShrink: 0 }}><Pulse color={col} size={small ? 4 : 6} />{riskLabel(score)} {score}</span>); };

const StatusBadge = ({ status }) => { const col = status === "UNDER ATTACK" ? C.red : C.orange; return (<span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, fontSize: 9, fontWeight: 800, color: col, background: `${col}15`, border: `1px solid ${col}30`, whiteSpace: "nowrap", flexShrink: 0 }}><Pulse color={col} size={5} />{status}</span>); };

const Card = ({ children, style = {}, glow }) => (<div style={{ background: C.card, border: `1px solid ${glow ? `${C.red}30` : C.border}`, borderRadius: 10, padding: 16, ...(glow ? { boxShadow: "0 0 16px rgba(185,28,28,0.06)" } : {}), ...style }}>{children}</div>);

const Ttl = ({ children, sub, warning }) => (<div style={{ marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}><h3 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: warning ? C.red : C.amber, letterSpacing: "0.07em", textTransform: "uppercase" }}>{children}</h3>{warning && <Pulse color={C.red} size={5} />}</div>{sub && <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{sub}</p>}</div>);

const MiniBar = ({ value, max = 100, color, label }) => (<div style={{ marginBottom: 7 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}><span style={{ fontSize: 10, color: C.muted }}>{label}</span><span style={{ fontSize: 10, fontWeight: 700, color }}>{value}%</span></div><div style={{ height: 3, background: "#1a2332", borderRadius: 2 }}><div style={{ height: 3, borderRadius: 2, background: color, width: `${Math.min((value / max) * 100, 100)}%`, transition: "width 0.5s" }} /></div></div>);

const statusColor = (s) => {
  if (["HALTED", "CLOSED", "STRANDED", "DAMAGED", "STRUCK"].includes(s)) return C.red;
  if (["AT RISK", "STRAINED", "REDUCED", "RESTRICTED", "DEPLETING"].includes(s)) return C.orange;
  if (["CRITICAL ASSET", "PRODUCING"].includes(s)) return C.amber;
  return C.green;
};

// ─────────── WAR BANNER ───────────
const WarBanner = ({ mobile }) => (<div style={{ background: "linear-gradient(90deg,rgba(185,28,28,0.06),transparent,rgba(185,28,28,0.06))", border: `1px solid ${C.red}20`, borderRadius: 8, padding: mobile ? "10px 12px" : "12px 18px", marginBottom: 16, display: "flex", alignItems: mobile ? "flex-start" : "center", justifyContent: "space-between", gap: 10, flexDirection: mobile ? "column" : "row" }}><div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}><Pulse color={C.red} size={10} /><div><span style={{ fontSize: mobile ? 11 : 13, fontWeight: 800, color: C.red }}>ACTIVE CONFLICT: OPERATION EPIC FURY</span><p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted, lineHeight: 1.4 }}>US-Israel strikes on Iran began Feb 28. Khamenei killed. Iran retaliating across all 6 GCC states for a third consecutive day. Hormuz de facto closed. 150+ tankers anchored. 3 tankers struck. Attacks continuing in Dubai, Doha, Kuwait on Day 3.</p></div></div><div style={{ textAlign: mobile ? "left" : "right", flexShrink: 0 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.red, fontFamily: "monospace" }}>DAY {CONFLICT_META.dayCount()}</div><div style={{ fontSize: 9, color: C.muted }}>Conflict ongoing</div></div></div>);

// ─────────── CONTEXT-AWARE KPI STRIP ───────────
const KPIStrip = ({ mobile, country }) => {
  const gccKpis = [
    { label: "Hormuz", value: "CLOSED", sub: "IRGC declared full blockade", color: C.red },
    { label: "Brent", value: "$80+/bbl", sub: "Analysts project $80-100+", color: C.orange },
    { label: "States Hit", value: "6 / 6", sub: "All GCC targeted, Day 4", color: C.red },
    { label: "Projectiles", value: "1,800+", sub: "Verified BM + CM + drones + jets", color: C.red },
    { label: "Dead", value: "6 + 6 US", sub: "GCC civilians + US KIA", color: C.red },
    { label: "LNG", value: "OFFLINE", sub: "Qatar halted all production", color: C.red },
  ];
  const kpis = country ? country.kpis : gccKpis;
  return (<div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>{kpis.map((k) => (<Card key={k.label} glow={k.color === C.red} style={{ padding: "8px 10px", borderTop: `2px solid ${k.color}` }}><div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{k.label}</div><div style={{ fontSize: mobile ? 12 : 14, fontWeight: 800, color: k.color, fontFamily: "monospace", lineHeight: 1.2 }}>{k.value}</div><div style={{ fontSize: 8, color: C.dim, marginTop: 1 }}>{k.sub}</div></Card>))}</div>);
};

// ─────────── OVERVIEW COMPONENTS ───────────
const Heatmap = ({ onSelect, selected, mobile }) => {
  const metrics = ["food", "water", "electricity", "chokepoint", "infra", "fiscal", "military"];
  return (<Card style={mobile ? {} : { gridColumn: "span 2" }}><Ttl warning sub="Tap a country for deep dive">Wartime Risk</Ttl><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{countries.map((c) => { const comp = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length); return (<div key={c.name} onClick={() => onSelect(c)} style={{ padding: "10px 12px", borderRadius: 8, background: C.cardAlt, border: `1px solid ${selected?.name === c.name ? CC[c.name] : C.border}`, cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: CC[c.name], flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 700, color: CC[c.name] }}>{c.name}</span></div><StatusBadge status={c.warStatus} /></div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 4 }}><div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{metrics.map((m) => (<span key={m} style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: `${riskColor(c.wartime[m])}12`, color: riskColor(c.wartime[m]), fontWeight: 600 }}>{m.slice(0, 4)} {c.wartime[m]}</span>))}</div><Badge score={comp} small /></div></div>); })}</div></Card>);
};

const InfraTracker = ({ mobile }) => (<Card glow style={mobile ? {} : { gridColumn: "span 2" }}><Ttl warning sub="Confirmed hits, first 48 hours">Infrastructure Damage</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>{countries.map((c) => (<div key={c.name} style={{ padding: 10, borderRadius: 6, background: C.cardAlt, border: `1px solid ${c.warStatus === "UNDER ATTACK" ? C.red : C.orange}15` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: CC[c.name] }}>{c.name}</span><StatusBadge status={c.warStatus} /></div><div style={{ maxHeight: 90, overflowY: "auto" }}>{c.infraHits.map((h, i) => (<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 3 }}><span style={{ color: C.red, fontSize: 6, marginTop: 4, flexShrink: 0 }}>●</span><span style={{ fontSize: 10, color: C.text, lineHeight: 1.3 }}>{h}</span></div>))}</div></div>))}</div></Card>);

// ─────────── NEXUS PANEL ───────────
const NexusPanel = ({ mobile }) => {
  const [expanded, setExpanded] = useState(null);
  return (<Card style={mobile ? {} : { gridColumn: "span 2" }}><Ttl sub="How the war cascades across interconnected systems">Cascading Nexus Risks</Ttl>{nexusRisks.map((n, i) => (<div key={i} onClick={() => setExpanded(expanded === i ? null : i)} style={{ padding: "10px 12px", borderRadius: 6, background: `${n.color}05`, border: `1px solid ${n.color}15`, marginBottom: 8, cursor: "pointer" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        <span style={{ fontSize: 14 }}>{n.icon}</span>
        <div>
          <span style={{ fontSize: 10, fontWeight: 700, color: n.color, textTransform: "uppercase", lineHeight: 1.3, display: "block" }}>{n.title}</span>
          <span style={{ fontSize: 9, color: C.muted }}>{n.severity}</span>
        </div>
      </div>
      <span style={{ fontSize: 10, color: C.dim, flexShrink: 0 }}>{expanded === i ? "▲" : "▼"}</span>
    </div>
    {expanded === i && (<div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${n.color}12` }}>
      <p style={{ margin: "0 0 8px", fontSize: 10, color: C.text, lineHeight: 1.5 }}>{n.mechanism}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>{n.chain.map((step, si) => (<span key={si} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${n.color}10`, color: n.color, fontWeight: 600 }}>{step}</span>{si < n.chain.length - 1 && <span style={{ color: C.dim, fontSize: 9 }}>→</span>}</span>))}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{n.affected.map((a) => (<span key={a} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 2, background: `${CC[a] || C.muted}15`, color: CC[a] || C.muted, fontWeight: 600 }}>{a === "All GCC" ? "All GCC" : a.replace("Saudi Arabia", "KSA")}</span>))}</div>
    </div>)}
  </div>))}</Card>);
};

// ─────────── HORMUZ & SUPPLY ───────────
const HormuzPanel = ({ mobile }) => (<Card glow><Ttl warning sub="IRGC formally declared blockade Mar 2">Strait of Hormuz</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>{[{ l: "Normal transit", v: "20M bbl/d", c: C.muted },{ l: "Traffic drop", v: "~70%+", c: C.red },{ l: "Tankers anchored", v: "150+", c: C.orange },{ l: "Tankers struck", v: "5+ (incl Athe Nova)", c: C.red },{ l: "Insurance", v: "WITHDRAWN", c: C.red },{ l: "All major carriers", v: "SUSPENDED", c: C.red }].map((r) => (<div key={r.l} style={{ padding: "5px 7px", background: C.cardAlt, borderRadius: 4 }}><div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase" }}>{r.l}</div><div style={{ fontSize: 11, fontWeight: 700, color: r.c, fontFamily: "monospace" }}>{r.v}</div></div>))}</div><div style={{ padding: 8, background: `${C.red}06`, borderRadius: 5, border: `1px solid ${C.red}12` }}><p style={{ margin: 0, fontSize: 10, color: C.text, lineHeight: 1.5 }}>⚠️ IRGC Brig. Gen. Jabbari declared Hormuz CLOSED: "Anyone who wants to pass, our self-sacrificing heroes will set those ships on fire. Not a single drop of oil will leave." Tankers Athe Nova (Honduran-flagged, struck by 2 IRGC drones) and MKD VYOM (explosive boat attack, 1 killed) confirmed hit. Maersk, MSC, CMA CGM, Hapag-Lloyd ALL suspended. 77M bbl oil loaded on trapped tankers (Kpler). Brent $80+, analysts project $80-100+ sustained.</p></div></Card>);

const ExportRoutes = ({ mobile }) => (<Card style={mobile ? {} : { gridColumn: "span 2" }}><Ttl sub="Hormuz bypass options by country">Export Alternatives</Ttl><div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: 8 }}>{countries.map((c) => { const vCol = c.altRoute.viability === "NONE" ? C.red : c.altRoute.viability === "PARTIAL" ? C.amber : c.altRoute.viability === "N/A" ? C.dim : C.orange; return (<div key={c.name} style={{ padding: 10, borderRadius: 6, background: C.cardAlt, border: `1px solid ${vCol}18` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: CC[c.name] }}>{c.name}</span><span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: `${vCol}15`, color: vCol, fontWeight: 700 }}>{c.altRoute.viability}</span></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.4 }}>{c.altRoute.text}</p></div>); })}</div></Card>);

// ─────────── INFRASTRUCTURE DEEP DIVE ───────────
const InfraSection = ({ title, items, icon }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
      <span style={{ fontSize: 9, color: C.dim }}>({items.length})</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {items.map((item, i) => {
        const sc = statusColor(item.status);
        return (
          <div key={i} style={{ padding: "8px 10px", borderRadius: 5, background: C.cardAlt, borderLeft: `3px solid ${sc}`, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.text }}>{item.name}</span>
                {item.type && <span style={{ fontSize: 8, color: C.dim, marginLeft: 6 }}>{item.type}</span>}
                {item.code && <span style={{ fontSize: 8, color: C.dim, marginLeft: 6 }}>{item.code}</span>}
                {item.capacity && <span style={{ fontSize: 8, color: C.dim, marginLeft: 6 }}>{item.capacity}</span>}
              </div>
              <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: `${sc}15`, color: sc, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0 }}>{item.status}</span>
            </div>
            <p style={{ margin: 0, fontSize: 9, color: C.muted, lineHeight: 1.35 }}>{item.note}</p>
          </div>
        );
      })}
    </div>
  </div>
);

const InfraDeepDive = ({ country, mobile }) => {
  const infra = infraDB[country.name];
  if (!infra) return null;
  const allItems = [...(infra.ports||[]), ...(infra.airports||[]), ...(infra.power||[]), ...(infra.desal||[]), ...(infra.energy||[])];
  const critical = allItems.filter(i => ["HALTED","CLOSED","STRANDED","DAMAGED","STRUCK"].includes(i.status)).length;
  const atRisk = allItems.filter(i => ["AT RISK","STRAINED","REDUCED","RESTRICTED","DEPLETING"].includes(i.status)).length;
  const operational = allItems.filter(i => !["HALTED","CLOSED","STRANDED","DAMAGED","STRUCK","AT RISK","STRAINED","REDUCED","RESTRICTED","DEPLETING"].includes(i.status)).length;

  return (
    <Card glow={critical > 0}>
      <Ttl warning={critical > 0} sub={`${allItems.length} facilities tracked across 5 categories`}>
        Critical Infrastructure Status
      </Ttl>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
        <div style={{ padding: "6px 8px", borderRadius: 5, background: `${C.red}08`, border: `1px solid ${C.red}15`, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.red, fontFamily: "monospace" }}>{critical}</div>
          <div style={{ fontSize: 8, color: C.red, textTransform: "uppercase", fontWeight: 600 }}>Damaged/Closed</div>
        </div>
        <div style={{ padding: "6px 8px", borderRadius: 5, background: `${C.orange}08`, border: `1px solid ${C.orange}15`, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.orange, fontFamily: "monospace" }}>{atRisk}</div>
          <div style={{ fontSize: 8, color: C.orange, textTransform: "uppercase", fontWeight: 600 }}>At Risk/Strained</div>
        </div>
        <div style={{ padding: "6px 8px", borderRadius: 5, background: `${C.green}08`, border: `1px solid ${C.green}15`, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.green, fontFamily: "monospace" }}>{operational}</div>
          <div style={{ fontSize: 8, color: C.green, textTransform: "uppercase", fontWeight: 600 }}>Operational</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div>
          {infra.ports && <InfraSection title="Ports & Terminals" items={infra.ports} icon="🚢" />}
          {infra.airports && <InfraSection title="Airports" items={infra.airports} icon="✈️" />}
          {infra.desal && <InfraSection title="Desalination Plants" items={infra.desal} icon="💧" />}
        </div>
        <div>
          {infra.power && <InfraSection title="Power Generation" items={infra.power} icon="⚡" />}
          {infra.energy && <InfraSection title="Pipelines, Refineries & Energy" items={infra.energy} icon="🛢️" />}
        </div>
      </div>
    </Card>
  );
};

// ─────────── COUNTRY DEEP DIVE ───────────
const CountryDeepDive = ({ country: c, mobile }) => {
  const metricLabels = { food: "Food", water: "Water", electricity: "Power", chokepoint: "Chokepoint", fiscal: "Fiscal", infra: "Infra", military: "Military" };
  const radarData = Object.keys(c.wartime).map((k) => ({ metric: metricLabels[k] || k, war: c.wartime[k], pre: c.preWar[k] || 0 }));
  const comp = Math.round(Object.values(c.wartime).reduce((a, b) => a + b, 0) / Object.values(c.wartime).length);
  return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Card glow={c.warStatus === "UNDER ATTACK"}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: CC[c.name] }}>{c.name}</h2>
        <StatusBadge status={c.warStatus} /><Badge score={comp} />
      </div>
      <p style={{ margin: "0 0 8px", fontSize: 11, color: C.muted }}>Pop {c.pop}M · Oil {c.oilProd} Mbpd · Export {c.oilExport} Mbpd · Peak {c.elecPeakGW} GW</p>
      <div style={{ padding: 10, background: `${C.red}05`, borderRadius: 6, border: `1px solid ${C.red}12` }}>
        <p style={{ margin: 0, fontSize: 11, color: C.text, lineHeight: 1.6 }}>{c.warDetail}</p>
      </div>
    </Card>

    <InfraDeepDive country={c} mobile={mobile} />

    <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
      <Card>
        <Ttl sub="Pre-war (dashed) vs wartime (filled)">Risk Radar</Ttl>
        <ResponsiveContainer width="100%" height={mobile ? 220 : 250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={C.border} /><PolarAngleAxis dataKey="metric" tick={{ fill: C.muted, fontSize: mobile ? 8 : 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Wartime" dataKey="war" stroke={C.red} fill={C.red} fillOpacity={0.2} strokeWidth={2} />
            <Radar name="Pre-war" dataKey="pre" stroke={C.amber} fill="none" strokeWidth={1} strokeDasharray="4 4" />
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

// ─────────── MAIN APP ───────────
// ─────────── LIVE INTEL TAB ───────────
const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
const CORS_PROXIES = ["https://corsproxy.io/?", "https://api.allorigins.win/raw?url="];

const FEEDS = [
  // Tier 1: Major global outlets
  { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml", icon: "🟣", cat: "Global" },
  { name: "CNN World", url: "http://rss.cnn.com/rss/cnn_world.rss", icon: "🔴", cat: "Global" },
  { name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml", icon: "🔵", cat: "Global" },
  { name: "Sky News", url: "https://feeds.skynews.com/feeds/rss/world.xml", icon: "🟡", cat: "Global" },
  // Tier 2: Quality press
  { name: "NYT Middle East", url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml", icon: "⚫", cat: "Press" },
  { name: "WSJ World", url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml", icon: "🟤", cat: "Press" },
  { name: "FT World", url: "https://www.ft.com/world?format=rss", icon: "🩷", cat: "Press" },
  { name: "Middle East Eye", url: "https://www.middleeasteye.net/rss", icon: "🟠", cat: "Regional" },
  // Tier 3: Regional outlets
  { name: "The National", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/category/news/?outputType=xml", icon: "🟤", cat: "Regional" },
  { name: "Arab News", url: "https://www.arabnews.com/rss.xml", icon: "🟢", cat: "Regional" },
  // Tier 4: Sector-specific
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100727362", icon: "🟠", cat: "Markets" },
  { name: "OilPrice", url: "https://oilprice.com/rss/main", icon: "🛢️", cat: "Energy" },
  { name: "gCaptain", url: "https://gcaptain.com/feed/", icon: "🚢", cat: "Maritime" },
  { name: "Breaking Defense", url: "https://breakingdefense.com/feed/", icon: "🔴", cat: "Defense" },
];

const GULF_KEYWORDS = ["iran","gulf","hormuz","saudi","uae","emirates","qatar","kuwait","bahrain","oman","irgc","strait","oil","lng","drone","missile","tehran","riyadh","aramco","opec","crude","tanker","navy","centcom","hezbollah","houthi","brent","refinery","pipeline","blockade","abu dhabi","doha","manama","muscat","jebel ali"];

const fetchRSS = async (feed) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`${RSS_PROXY}${encodeURIComponent(feed.url)}`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error("rss2json fail");
    const d = await r.json();
    if (d.status !== "ok" || !d.items) throw new Error("bad response");
    return d.items.map((it) => ({
      title: it.title || "", link: it.link || "", pubDate: it.pubDate || "", source: feed.name, icon: feed.icon,
      desc: (it.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    }));
  } catch {
    clearTimeout(timer);
    const ctrl2 = new AbortController();
    const timer2 = setTimeout(() => ctrl2.abort(), 8000);
    try {
      const proxy = CORS_PROXIES[Math.floor(Math.random() * CORS_PROXIES.length)];
      const r2 = await fetch(`${proxy}${encodeURIComponent(feed.url)}`, { signal: ctrl2.signal });
      clearTimeout(timer2);
      const txt = await r2.text();
      const doc = new DOMParser().parseFromString(txt, "text/xml");
      const items = [...doc.querySelectorAll("item")].slice(0, 15);
      return items.map((it) => ({
        title: it.querySelector("title")?.textContent || "", link: it.querySelector("link")?.textContent || "",
        pubDate: it.querySelector("pubDate")?.textContent || "", source: feed.name, icon: feed.icon,
        desc: (it.querySelector("description")?.textContent || "").replace(/<[^>]*>/g, "").slice(0, 200),
      }));
    } catch { clearTimeout(timer2); return []; }
  }
};

const fetchGDELT = async () => {
  // Use Google News RSS as wire service (GDELT requires backend proxy for CORS)
  const queries = [
    { q: "Iran+Gulf+war+missile+drone", label: "Iran Conflict" },
    { q: "Hormuz+oil+tanker+blockade", label: "Hormuz / Energy" },
    { q: "Saudi+UAE+Qatar+Kuwait+Bahrain+military+Iran", label: "GCC Military" },
  ];
  const all = [];
  for (const qr of queries) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${qr.q}&hl=en-US&gl=US&ceid=US:en`)}`;
      const r = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const d = await r.json();
      if (d.status === "ok" && d.items) {
        all.push(...d.items.map((it) => {
          const titleParts = (it.title || "").split(" - ");
          const source = titleParts.length > 1 ? titleParts.pop().trim() : "Google News";
          const title = titleParts.join(" - ");
          return { title, link: it.link || "", pubDate: it.pubDate || "", source, icon: "📡",
            desc: `${qr.label} | via ${source}`, isGdelt: true };
        }));
      }
    } catch { clearTimeout(timer); }
  }
  // Deduplicate by title
  const seen = new Set(); const deduped = [];
  all.forEach((it) => { const k = it.title.toLowerCase().slice(0, 50); if (!seen.has(k)) { seen.add(k); deduped.push(it); } });
  return deduped.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
};

const fetchCommodities = async () => {
  const out = { usdsar: 3.75, usdaed: 3.6725, usdqar: 3.64, usdkwd: 0.307, usdbhd: 0.376, usdomr: 0.385, usdeur: 0.854, usdgbp: 0.747, updated: null, live: false };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { signal: ctrl.signal });
    const d = await r.json();
    clearTimeout(timer);
    if (d.result === "success" && d.rates) {
      out.usdsar = d.rates.SAR || out.usdsar; out.usdaed = d.rates.AED || out.usdaed;
      out.usdqar = d.rates.QAR || out.usdqar; out.usdkwd = d.rates.KWD || out.usdkwd;
      out.usdbhd = d.rates.BHD || out.usdbhd; out.usdomr = d.rates.OMR || out.usdomr;
      out.usdeur = d.rates.EUR || out.usdeur; out.usdgbp = d.rates.GBP || out.usdgbp;
      out.usdrub = d.rates.RUB; out.usdcny = d.rates.CNY; out.usdinr = d.rates.INR;
      out.live = true;
    }
  } catch { clearTimeout(timer); }
  out.updated = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return out;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr); const now = new Date(); const mins = Math.floor((now - d) / 60000);
    if (mins < 1) return "just now"; if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ""; }
};

const isGulfRelated = (item) => {
  const text = `${item.title} ${item.desc}`.toLowerCase();
  return GULF_KEYWORDS.some((kw) => text.includes(kw));
};

const LiveFeed = ({ mobile, refreshKey }) => {
  const [news, setNews] = useState([]);
  const [gdelt, setGdelt] = useState([]);
  const [fx, setFx] = useState({ usdsar: 3.75, usdaed: 3.6725, usdqar: 3.64, usdkwd: 0.307, usdbhd: 0.376, usdomr: 0.385, usdeur: 0.854, usdgbp: 0.747, live: false, updated: null });
  const [loading, setLoading] = useState(true);
  const [feedStatus, setFeedStatus] = useState({});
  const [filter, setFilter] = useState("gulf");
  const [subTab, setSubTab] = useState("news");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const status = {};
      const allItems = [];
      // Fetch RSS feeds with Promise.allSettled for resilience
      const promises = FEEDS.map(async (f) => {
        try {
          const items = await fetchRSS(f);
          status[f.name] = { ok: items.length > 0, count: items.length };
          return items;
        } catch { status[f.name] = { ok: false, count: 0 }; return []; }
      });
      const results = await Promise.allSettled(promises);
      results.forEach((r) => { if (r.status === "fulfilled") allItems.push(...r.value); });
      // Show news immediately, don't wait for GDELT/FX
      if (!cancelled) {
        const sorted = allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        const deduped = []; const seen = new Set();
        sorted.forEach((it) => { const k = it.title.toLowerCase().slice(0, 50); if (!seen.has(k)) { seen.add(k); deduped.push(it); } });
        setNews(deduped);
        setFeedStatus(status);
        setLoading(false);
      }
      // Fetch GDELT and FX in background (non-blocking)
      try { const g = await fetchGDELT(); if (!cancelled) setGdelt(g); } catch {}
      try { const f = await fetchCommodities(); if (!cancelled) setFx(f); } catch {}
    };
    load();
    const interval = setInterval(load, 300000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [refreshKey]);

  const sourceFiltered = sourceFilter === "all" ? news : news.filter((n) => n.source === sourceFilter);
  const filtered = filter === "gulf" ? sourceFiltered.filter(isGulfRelated) : sourceFiltered;

  const feedOk = Object.values(feedStatus).filter((s) => s.ok).length;
  const feedTotal = Object.keys(feedStatus).length;
  const CATS = [...new Set(FEEDS.map((f) => f.cat))];

  const FXPanel = () => (
    <div style={{ display: "grid", gridTemplateColumns: mobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
      {[
        { l: "Brent Crude", v: "$80+/bbl", c: C.red, note: "Analysts: $80-100+" },
        { l: "EU Gas (TTF)", v: "€46+/MWh", c: C.red, note: "+45% after Qatar halt" },
        { l: "Gold", v: "$2,900+", c: C.amber, note: "Safe haven surge" },
        { l: "VIX", v: "28+", c: C.orange, note: "Fear gauge elevated" },
        { l: "USD/SAR", v: fx.usdsar?.toFixed(4), c: C.blue, note: "Pegged 3.75" },
        { l: "USD/AED", v: fx.usdaed?.toFixed(4), c: C.blue, note: "Pegged 3.6725" },
        { l: "USD/KWD", v: fx.usdkwd?.toFixed(4), c: C.blue, note: "Managed float" },
        { l: "USD/QAR", v: fx.usdqar?.toFixed(3), c: C.blue, note: "Pegged 3.64" },
        { l: "USD/BHD", v: fx.usdbhd?.toFixed(4), c: C.blue, note: "Pegged 0.376" },
        { l: "USD/OMR", v: fx.usdomr?.toFixed(4), c: C.blue, note: "Pegged 0.385" },
        { l: "USD/EUR", v: fx.usdeur?.toFixed(4), c: C.muted, note: "Benchmark" },
        { l: "USD/GBP", v: fx.usdgbp?.toFixed(4), c: C.muted, note: "Benchmark" },
      ].map((r) => (
        <div key={r.l} style={{ padding: "6px 8px", background: C.cardAlt, borderRadius: 5, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{r.l}</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: r.c, fontFamily: "monospace" }}>{r.v || "..."}</div>
          <div style={{ fontSize: 8, color: C.dim }}>{r.note}</div>
        </div>
      ))}
      {fx.live && <div style={{ gridColumn: "1 / -1", fontSize: 8, color: C.green, textAlign: "right", fontFamily: "monospace" }}>● FX rates live from ExchangeRate API</div>}
    </div>
  );

  const NewsItem = ({ item }) => (
    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "8px 10px", borderRadius: 5, background: C.cardAlt, border: `1px solid ${C.border}`, marginBottom: 5, textDecoration: "none", transition: "border-color 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = `${C.red}40`} onMouseLeave={(e) => e.currentTarget.style.borderColor = C.border}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.35, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {GULF_KEYWORDS.some((kw) => item.title.toLowerCase().includes(kw)) && <span style={{ color: C.red, marginRight: 4 }}>●</span>}
            {item.title}
          </div>
          {item.desc && <p style={{ margin: 0, fontSize: 9, color: C.dim, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</p>}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 8, color: C.muted }}>{item.icon} {item.source}</div>
          <div style={{ fontSize: 8, color: C.dim, marginTop: 1 }}>{timeAgo(item.pubDate)}</div>
        </div>
      </div>
    </a>
  );

  return (<>
    {/* Breaking news ticker bar */}
    {!loading && news.length > 0 && (
      <div style={{ marginBottom: 10, padding: "5px 0", background: `${C.red}08`, borderRadius: 5, border: `1px solid ${C.red}15`, overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, padding: "2px 10px", background: C.red, color: "#fff", fontSize: 8, fontWeight: 800, letterSpacing: 0.8, borderRadius: "3px 0 0 3px", marginRight: 8, textTransform: "uppercase" }}>LIVE</div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ display: "flex", gap: 50, animation: `ticker ${Math.max(news.filter(isGulfRelated).length * 4, 40)}s linear infinite`, whiteSpace: "nowrap" }}>
              {news.filter(isGulfRelated).slice(0, 15).concat(news.filter(isGulfRelated).slice(0, 15)).map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none", flexShrink: 0 }}>
                  <span style={{ color: C.red, fontSize: 6 }}>●</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{item.title}</span>
                  <span style={{ fontSize: 8, color: C.dim, fontStyle: "italic" }}>{item.source}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[{ k: "news", l: "Live News" }, { k: "gdelt", l: "News Wire" }, { k: "markets", l: "Markets & FX" }].map((t) => (
          <button key={t.k} onClick={() => setSubTab(t.k)} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${subTab === t.k ? C.red : C.border}`, background: subTab === t.k ? `${C.red}12` : C.card, color: subTab === t.k ? C.red : C.muted, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>{t.l}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {subTab === "news" && (
          <div style={{ display: "flex", gap: 3 }}>
            {[{ k: "gulf", l: "Gulf Only" }, { k: "all", l: "All News" }].map((f) => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{ padding: "3px 8px", borderRadius: 3, border: "none", background: filter === f.k ? `${C.amber}20` : "transparent", color: filter === f.k ? C.amber : C.dim, fontSize: 9, fontWeight: 600, cursor: "pointer" }}>{f.l}</button>
            ))}
          </div>
        )}
        <span style={{ fontSize: 8, color: loading ? C.amber : C.green, fontFamily: "monospace" }}>
          {loading ? "⟳ FETCHING..." : `● ${feedOk}/${feedTotal} feeds live`}
        </span>
      </div>
    </div>

    {subTab === "markets" && (
      <Card><Ttl warning sub={fx.updated ? `FX rates updated ${fx.updated}` : "Loading..."}>Live Markets & FX</Ttl>
        <FXPanel />
        <div style={{ padding: 8, background: `${C.amber}06`, borderRadius: 5, border: `1px solid ${C.amber}12` }}>
          <p style={{ margin: 0, fontSize: 10, color: C.text, lineHeight: 1.5 }}>
            ⚡ Gulf currency pegs are holding but under pressure. 77M barrels of crude stuck on tankers in the Gulf (Kpler). Saudi E-W Pipeline running at max 5 Mbpd capacity to bypass Hormuz. European gas prices +45% after QatarEnergy halted all LNG production. Marine insurance WITHDRAWN for all Gulf-transiting vessels. Oil analysts project $80-100+ sustained if Hormuz remains closed beyond 1 week. JPMorgan's Dimon warned of elevated cyber and terror attack risk on financial institutions globally.
          </p>
        </div>
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8 }}>
          {[
            { title: "Oil Market", items: ["Brent $80+, spike from $72 Friday", "77M bbl trapped on Gulf tankers", "Ras Tanura 550K bpd OFFLINE", "Saudi E-W Pipeline at max 5 Mbpd", "Analysts: $90-100 if >1 week closure"] },
            { title: "Gas / LNG", items: ["Qatar LNG 100% HALTED (77 Mtpa)", "~20% of global LNG supply offline", "EU TTF gas +45% to €46/MWh", "Asian spot LNG premiums surging", "Ras Laffan + Mesaieed both struck"] },
            { title: "Shipping", items: ["Hormuz formally CLOSED by IRGC", "150+ tankers anchored, waiting", "Maersk/MSC/CMA CGM ALL suspended", "Insurance WITHDRAWN for Gulf", "War-risk premiums surged ~50%"] },
            { title: "Financial", items: ["Gulf exchanges volatile", "Dimon: banks may be cyber targets", "SWIFT connectivity at risk", "GCC FX pegs holding (for now)", "E3 threatening Iranian oil strikes"] },
          ].map((s) => (
            <div key={s.title} style={{ padding: 10, background: C.cardAlt, borderRadius: 6, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 6 }}>{s.title}</div>
              {s.items.map((it, i) => <div key={i} style={{ fontSize: 9, color: it.includes("OFFLINE") || it.includes("HALTED") || it.includes("CLOSED") || it.includes("WITHDRAWN") ? C.red : C.muted, lineHeight: 1.7, paddingLeft: 8, borderLeft: `2px solid ${C.border}` }}>{it}</div>)}
            </div>
          ))}
        </div>
      </Card>
    )}

    {subTab === "news" && (
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "2fr 1fr", gap: 12 }}>
        <Card>
          <Ttl warning sub={`${filtered.length} articles | auto-refresh 5min`}>
            {sourceFilter !== "all" ? sourceFilter : filter === "gulf" ? "Gulf Conflict Wire" : "Global News Wire"}
          </Ttl>
          {/* Source channel tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
            <button onClick={() => setSourceFilter("all")}
              style={{ padding: "3px 8px", borderRadius: 3, border: `1px solid ${sourceFilter === "all" ? C.amber : C.border}`, background: sourceFilter === "all" ? `${C.amber}15` : "transparent", color: sourceFilter === "all" ? C.amber : C.dim, fontSize: 9, fontWeight: 700, cursor: "pointer" }}>
              ALL ({news.length})
            </button>
            {CATS.map((cat) => {
              const catFeeds = FEEDS.filter((f) => f.cat === cat);
              const catCount = news.filter((n) => catFeeds.some((f) => f.name === n.source)).length;
              if (catCount === 0 && !catFeeds.some((f) => feedStatus[f.name]?.ok)) return null;
              return (
                <span key={cat} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 7, color: C.dim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, padding: "3px 3px 3px 6px" }}>{cat}</span>
                  {catFeeds.map((f) => {
                    const s = feedStatus[f.name];
                    const count = news.filter((n) => n.source === f.name).length;
                    const active = sourceFilter === f.name;
                    const failed = s && !s.ok;
                    return (
                      <button key={f.name} onClick={() => setSourceFilter(active ? "all" : f.name)}
                        style={{ padding: "3px 6px", borderRadius: 3, border: `1px solid ${active ? C.blue : failed ? `${C.red}30` : C.border}`,
                          background: active ? `${C.blue}15` : failed ? `${C.red}06` : "transparent",
                          color: active ? C.blue : failed ? `${C.red}80` : C.muted,
                          fontSize: 8, fontWeight: 600, cursor: failed ? "default" : "pointer", opacity: failed ? 0.6 : 1,
                          textDecoration: failed ? "line-through" : "none", whiteSpace: "nowrap" }}>
                        {f.icon} {f.name.replace(" World", "").replace(" Middle East", "")} {failed ? "✗" : count > 0 ? `(${count})` : ""}
                      </button>
                    );
                  })}
                </span>
              );
            })}
          </div>
          {loading && <div style={{ textAlign: "center", padding: 30, color: C.muted }}><div style={{ fontSize: 20, animation: "pulse 1.5s infinite" }}>⟳</div><p style={{ fontSize: 10, marginTop: 8 }}>Fetching from {FEEDS.length} RSS sources...</p></div>}
          <div style={{ maxHeight: mobile ? 500 : 650, overflowY: "auto" }}>
            {filtered.slice(0, 60).map((item, i) => <NewsItem key={`${item.source}-${i}`} item={item} />)}
            {!loading && filtered.length === 0 && <p style={{ fontSize: 10, color: C.dim, textAlign: "center", padding: 20 }}>No articles matched{sourceFilter !== "all" ? ` from ${sourceFilter}` : ""}{filter === "gulf" ? " with Gulf keywords" : ""}. Try "All News" or a different source.</p>}
          </div>
        </Card>
        <div>
          <Card>
            <Ttl sub="Source health">Feed Status</Ttl>
            {FEEDS.map((f) => {
              const s = feedStatus[f.name];
              return (<div key={f.name} onClick={() => s?.ok && setSourceFilter(sourceFilter === f.name ? "all" : f.name)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${C.border}08`, cursor: s?.ok ? "pointer" : "default", opacity: sourceFilter !== "all" && sourceFilter !== f.name ? 0.4 : 1, transition: "opacity 0.15s" }}>
                <span style={{ fontSize: 10, color: C.text }}>{f.icon} {f.name} <span style={{ fontSize: 7, color: C.dim }}>({f.cat})</span></span>
                <span style={{ fontSize: 9, fontFamily: "monospace", color: s?.ok ? C.green : s ? C.red : C.dim }}>
                  {s?.ok ? `✓ ${s.count}` : s ? "✗ FAIL" : "..."}
                </span>
              </div>);
            })}
          </Card>
          <Card style={{ marginTop: 10 }}>
            <Ttl sub="Top mentioned terms">Keyword Heatmap</Ttl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(() => {
                const counts = {};
                filtered.slice(0, 40).forEach((it) => {
                  const text = `${it.title} ${it.desc}`.toLowerCase();
                  GULF_KEYWORDS.forEach((kw) => { if (text.includes(kw)) counts[kw] = (counts[kw] || 0) + 1; });
                });
                return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([kw, ct]) => {
                  const intensity = Math.min(ct / 8, 1);
                  return (<span key={kw} style={{ padding: "2px 6px", borderRadius: 3, fontSize: 9, fontWeight: 600, background: `rgba(239,68,68,${0.08 + intensity * 0.25})`, color: intensity > 0.5 ? C.red : C.muted, border: `1px solid rgba(239,68,68,${0.1 + intensity * 0.2})` }}>{kw} ({ct})</span>);
                });
              })()}
            </div>
          </Card>
        </div>
      </div>
    )}

    {subTab === "gdelt" && (
      <Card>
        <Ttl warning sub={`${gdelt.length} articles from Google News wire (live)`}>News Wire Feed</Ttl>
        <p style={{ margin: "0 0 8px", fontSize: 9, color: C.dim, lineHeight: 1.4 }}>
          Real-time aggregated headlines from Google News, filtered for Iran conflict, Hormuz/energy, and GCC military developments. Sources include NYT, BBC, Reuters, CNN, Al Jazeera, Forbes, and 100+ outlets.
        </p>
        {/* Scrolling ticker */}
        {gdelt.length > 0 && (
          <div style={{ overflow: "hidden", marginBottom: 10, padding: "6px 0", borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, position: "relative" }}>
            <div style={{ display: "flex", gap: 40, animation: `ticker ${Math.max(gdelt.length * 3, 30)}s linear infinite`, whiteSpace: "nowrap" }}>
              {gdelt.slice(0, 20).concat(gdelt.slice(0, 20)).map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", flexShrink: 0 }}>
                  {isGulfRelated(item) && <span style={{ color: C.red, fontSize: 8 }}>●</span>}
                  <span style={{ fontSize: 10, fontWeight: 600, color: C.text }}>{item.title}</span>
                  <span style={{ fontSize: 8, color: C.dim }}>{item.source} · {timeAgo(item.pubDate)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {loading && <div style={{ textAlign: "center", padding: 30, color: C.muted }}><div style={{ fontSize: 20, animation: "pulse 1.5s infinite" }}>⟳</div></div>}
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 8, maxHeight: mobile ? 500 : 600, overflowY: "auto" }}>
          {gdelt.slice(0, 30).map((item, i) => <NewsItem key={`wire-${i}`} item={item} />)}
          {!loading && gdelt.length === 0 && <p style={{ fontSize: 10, color: C.dim, textAlign: "center", padding: 20, gridColumn: "1 / -1" }}>Wire feed loading... This may take a moment on first load.</p>}
        </div>
      </Card>
    )}
  </>);
};

export default function App() {
  const mobile = useIsMobile();
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [pwShake, setPwShake] = useState(false);

  const handleLogin = () => {
    if (pw === "OW2026") {
      setAuthed(true);
      setPwErr(false);
    } else {
      setPwErr(true);
      setPwShake(true);
      setTimeout(() => setPwShake(false), 500);
    }
  };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: 20 }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        <div style={{ width: "100%", maxWidth: 380, animation: "fadeIn 0.4s ease-out", ...(pwShake ? { animation: "shake 0.4s ease-out" } : {}) }}>
          <div style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "36px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div>
              <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: -0.3 }}>GCC Resource Risk Dashboard</h1>
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 3, background: `${C.red}20`, color: C.red, fontWeight: 800 }}>RESTRICTED</span>
                <span style={{ fontSize: 8, padding: "2px 7px", borderRadius: 3, background: `${C.amber}15`, color: C.amber, fontWeight: 800 }}>⚠ WARTIME</span>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 10, color: C.dim, lineHeight: 1.4 }}>Enter credentials to access the live situation dashboard</p>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Access Code</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setPwErr(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter password"
                autoFocus
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 6, fontSize: 13, fontFamily: "monospace",
                  background: C.cardAlt, color: C.text, border: `1px solid ${pwErr ? C.red : C.border}`,
                  outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
                }}
              />
              {pwErr && (
                <div style={{ marginTop: 6, fontSize: 10, color: C.red, display: "flex", alignItems: "center", gap: 4 }}>
                  <span>✗</span> Incorrect password
                </div>
              )}
            </div>

            {/* Login button */}
            <button onClick={handleLogin}
              style={{
                width: "100%", padding: "10px 0", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
                background: pw.length > 0 ? C.red : `${C.red}40`, color: pw.length > 0 ? "#fff" : `${C.text}60`,
                cursor: pw.length > 0 ? "pointer" : "default", transition: "background 0.2s, color 0.2s",
                letterSpacing: 0.3,
              }}>
              Access Dashboard →
            </button>

            {/* Admin message */}
            <div style={{ marginTop: 20, padding: "10px 12px", background: `${C.amber}08`, borderRadius: 6, border: `1px solid ${C.amber}12`, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
                Don't have access? Reach out to admin for the password.
              </p>
            </div>
          </div>


        </div>
      </div>
    );
  }

  const tabs = [
    { key: "overview", label: mobile ? "Overview" : "Situation Overview" },
    { key: "supply", label: mobile ? "Hormuz" : "Supply Chain & Hormuz" },
    { key: "live", label: mobile ? "Live" : "Live Intel Feed" },
    { key: "country", label: selected ? (mobile ? selected.name : `Deep Dive: ${selected.name}`) : "Select Country" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", padding: mobile ? "10px" : "18px 24px", maxWidth: 1400, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", marginBottom: 10, flexDirection: mobile ? "column" : "row", gap: 6 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: mobile ? 15 : 18, fontWeight: 800, color: C.text }}>GCC Resource Risk Dashboard</h1>
            <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 3, background: `${C.red}20`, color: C.red, fontWeight: 800 }}>⚠ WARTIME</span>
          </div>
          <p style={{ margin: "1px 0 0", fontSize: 10, color: C.muted }}>Iran Conflict Day 4 | Oil, Gas, Food, Water, Power, Telecom, Infrastructure</p>
        </div>
        <button onClick={() => setLastRefresh(new Date())} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.cardAlt, color: C.amber, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
          ↻ {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </button>
      </div>

      <WarBanner mobile={mobile} />
      <KPIStrip mobile={mobile} country={tab === "country" ? selected : null} />

      <div style={{ display: "flex", gap: 2, marginBottom: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 6, overflowX: "auto" }}>
        {tabs.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} style={{ padding: mobile ? "6px 10px" : "6px 14px", borderRadius: "4px 4px 0 0", border: "none", background: tab === t.key ? `${C.red}12` : "transparent", color: tab === t.key ? C.red : C.muted, fontSize: mobile ? 10 : 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, borderBottom: tab === t.key ? `2px solid ${C.red}` : "2px solid transparent" }}>{t.label}</button>))}
      </div>

      {tab === "overview" && (<div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 12 }}>
        <Heatmap onSelect={(c) => { setSelected(c); setTab("country"); }} selected={selected} mobile={mobile} />
        <InfraTracker mobile={mobile} />
        <NexusPanel mobile={mobile} />
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
        <Card><Ttl warning sub="Route disruptions">Supply Chain</Ttl>{[{ r: "Strait of Hormuz", s: "CLOSED", d: "IRGC Brig. Gen. Jabbari declared full blockade. 'Not a drop of oil will leave.' Tankers Athe Nova + MKD VYOM struck.", sev: 99 },{ r: "Bab al-Mandab", s: "SUSPENDED", d: "Houthis announced resumption of Red Sea attacks. Maersk/CMA CGM rerouting Cape of Good Hope.", sev: 90 },{ r: "Jebel Ali Port", s: "HALTED", d: "Fire from debris. DP World suspended all operations.", sev: 90 },{ r: "Gulf Airspace", s: "CLOSED", d: "All Gulf hub airports shut. Thousands stranded regionally.", sev: 92 },{ r: "Qatar LNG", s: "ALL HALTED", d: "Ras Laffan + Mesaieed struck by drones. QatarEnergy halted 100% of LNG production. ~20% global LNG offline.", sev: 97 }].map((r) => (<div key={r.r} style={{ padding: "8px 10px", borderRadius: 5, background: `${riskColor(r.sev)}05`, border: `1px solid ${riskColor(r.sev)}12`, marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{r.r}</span><span style={{ fontSize: 9, fontWeight: 800, color: riskColor(r.sev), fontFamily: "monospace", flexShrink: 0 }}>{r.s}</span></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{r.d}</p></div>))}</Card>
        <Card><Ttl warning sub="Connectivity and communications risks">Telecom & Data Infrastructure</Ttl>{[{ r: "Submarine Cables (FLAG/EIG/AAE-1/IMEWE/GBI)", s: "AT RISK", d: "Multiple fiber optic cables transit Strait of Hormuz and Red Sea. Physical damage from anchored ships, mines, or sabotage could sever Gulf from global internet backbone.", sev: 82 },{ r: "UAE Internet (du/Etisalat/e&)", s: "DEGRADED", d: "Increased latency reported. DXB and Fujairah are major cable landing stations. Data center operations strained by power instability near Jebel Ali.", sev: 70 },{ r: "Bahrain (Batelco/AWS)", s: "AT RISK", d: "Bahrain hosts AWS Middle East region and multiple cable landing points. 5th Fleet area evacuation puts nearby data center ops at risk. Small island, limited redundancy.", sev: 78 },{ r: "Qatar (Ooredoo)", s: "STRAINED", d: "Power supply disruption from Ras Laffan/Mesaieed strikes could cascade to data centers. FLAG Europe-Asia cable lands in Qatar. Single-country cable path.", sev: 72 },{ r: "Financial Systems (SWIFT/Trading)", s: "VULNERABLE", d: "Gulf stock exchanges, SWIFT interbank transfers, and real-time settlement depend on submarine cable connectivity. Dubai DIFX, Abu Dhabi ADX, Qatar QSE all at risk of trading halts if connectivity severed.", sev: 80 },{ r: "Mobile Networks (All GCC)", s: "STRAINED", d: "Cell towers near strike zones damaged or operating on backup power. Surge in emergency calls overwhelming networks. Satellite backup limited. Iran demonstrated domestic internet shutdown (4% connectivity per NetBlocks).", sev: 68 }].map((r) => (<div key={r.r} style={{ padding: "8px 10px", borderRadius: 5, background: `${riskColor(r.sev)}05`, border: `1px solid ${riskColor(r.sev)}12`, marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3, gap: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{r.r}</span><span style={{ fontSize: 9, fontWeight: 800, color: riskColor(r.sev), fontFamily: "monospace", flexShrink: 0 }}>{r.s}</span></div><p style={{ margin: 0, fontSize: 10, color: C.muted, lineHeight: 1.3 }}>{r.d}</p></div>))}</Card>
        <ExportRoutes mobile={mobile} />
      </div>)}

      {tab === "live" && <LiveFeed mobile={mobile} refreshKey={lastRefresh} />}

      {tab === "country" && selected && <CountryDeepDive country={selected} mobile={mobile} />}
      {tab === "country" && !selected && (<Card style={{ textAlign: "center", padding: 32 }}><p style={{ fontSize: 12, color: C.muted }}>Tap a country in <span style={{ color: C.red, cursor: "pointer" }} onClick={() => setTab("overview")}>Overview</span> for deep dive.</p></Card>)}

      <div style={{ marginTop: 18, padding: "12px 0", borderTop: `1px solid ${C.border}` }}>
        <p style={{ margin: 0, fontSize: 8, color: C.dim, lineHeight: 1.5 }}>Sources: Atlantic Council, CSIS, Al Jazeera, CNBC, Reuters, Breaking Defense, Fortune, Euronews, The National, MEE, FDD, Kpler, gCaptain (Mar 2, 2026). Pre-war baselines from DNV ETO 2026, OPEC ASB 2025, World Bank, WEF, Strategy&. Infrastructure data from DEWA, ADWEC, KAHRAMAA, MEW Kuwait, OPWP Oman, EWA Bahrain, SEC Saudi Arabia. Not financial or military advice.</p>
      </div>
    </div>
  );
}
