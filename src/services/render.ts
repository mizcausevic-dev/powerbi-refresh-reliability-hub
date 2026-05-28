// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  deliveryPosture,
  payload,
  pipelineGaps,
  refreshLane,
  summary,
  verification
} from "./powerBiRefreshReliabilityHubService.js";

function layout(title: string, active: string, body: string) {
  const nav = [
    { href: "/", label: "Overview" },
    { href: "/refresh-lane", label: "Refresh Lane" },
    { href: "/pipeline-gaps", label: "Pipeline Gaps" },
    { href: "/delivery-posture", label: "Delivery Posture" },
    { href: "/verification", label: "Verification" },
    { href: "/docs", label: "Docs" }
  ];

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root{--bg:#070a0f;--panel:#0b1220;--panel2:#0a1426;--line:rgba(120,255,170,.18);--line2:rgba(120,255,170,.10);--text:#e9f3ff;--muted:rgba(233,243,255,.72);--muted2:rgba(233,243,255,.55);--bert:#37ff8b;--bert2:#19c7ff;--warn:#ffcc66;--bad:#ff5c7a;--good:#37ff8b;--plum:#b88cff;--shadow:0 18px 60px rgba(0,0,0,.55);--mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--sans:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";}
      *{box-sizing:border-box} html,body{height:100%}
      body{margin:0;font-family:var(--sans);color:var(--text);background:radial-gradient(1200px 600px at 20% -10%, rgba(55,255,139,.18), transparent 60%),radial-gradient(900px 520px at 90% 0%, rgba(25,199,255,.16), transparent 55%),radial-gradient(1000px 600px at 50% 110%, rgba(55,255,139,.10), transparent 60%),linear-gradient(180deg,#05070c 0%,#070a0f 35%,#05070c 100%);overflow-x:hidden}
      .grid-bg{position:fixed;inset:0;pointer-events:none;opacity:.12;z-index:-1;background-image:linear-gradient(to right, rgba(55,255,139,.14) 1px, transparent 1px),linear-gradient(to bottom, rgba(55,255,139,.10) 1px, transparent 1px);background-size:46px 46px;mask-image:radial-gradient(900px 600px at 40% 10%, #000 60%, transparent 100%)}
      .wrap{max-width:1280px;margin:0 auto;padding:24px 22px 80px}
      .topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;border-bottom:1px solid var(--line2);padding-bottom:14px;margin-bottom:22px;font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--muted);text-transform:uppercase}
      .topbar .left{color:var(--bert)} .topbar .right{text-align:right;color:var(--muted)} .topbar .right div{margin-bottom:4px}
      .herorow{display:grid;grid-template-columns:1.5fr .9fr;gap:18px} @media (max-width:1000px){.herorow{grid-template-columns:1fr}}
      .hero{background:linear-gradient(180deg, rgba(11,18,32,.95), rgba(8,14,26,.92));border:1px solid var(--line);border-radius:22px;padding:28px 28px 24px;box-shadow:var(--shadow);position:relative;overflow:hidden;border-top:2px solid var(--bert2)}
      .hero h1{font-size:64px;line-height:.95;margin:0 0 18px;letter-spacing:-.5px;font-weight:800} @media (max-width:700px){.hero h1{font-size:42px}}
      .hero p{color:var(--muted);font-size:15px;line-height:1.55;max-width:680px;margin:0 0 18px}
      .chiprow,.navrow{display:flex;flex-wrap:wrap;gap:8px}.navrow{margin-top:18px}
      .meta-chip,.navchip{font-family:var(--mono);font-size:11px;color:var(--muted);padding:7px 12px;border-radius:999px;border:1px solid var(--line);background:rgba(6,10,18,.4);text-decoration:none}
      .navchip{font-size:12px;padding:10px 14px}.navchip.active{color:#071017;background:linear-gradient(135deg,var(--bert),var(--bert2));font-weight:700}
      .side{display:flex;flex-direction:column;gap:14px}
      .bluf,.corr{border-radius:14px;padding:16px 18px}
      .bluf{border:1px solid var(--warn);border-left:4px solid var(--warn);background:linear-gradient(180deg, rgba(255,204,102,.06), rgba(11,18,32,.92))}
      .corr{border:1px solid var(--bert);border-left:4px solid var(--bert);background:linear-gradient(180deg, rgba(55,255,139,.06), rgba(11,18,32,.92))}
      .bluf .lbl,.corr .lbl,.sh .note,.src .src-name,.kpi .lbl,.footer,.st{font-family:var(--mono)}
      .bluf .lbl,.corr .lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase}
      .bluf .lbl{color:var(--warn)} .corr .lbl{color:var(--bert)}
      .bluf p,.corr p,.src p{color:var(--muted);font-size:13.5px;line-height:1.55;margin:6px 0 0}
      .section{margin-top:34px}
      .sh{display:flex;justify-content:space-between;align-items:baseline;gap:14px;padding-bottom:10px;border-bottom:1px solid var(--line2);margin-bottom:14px}
      .sh h2{margin:0;font-size:24px;font-weight:600;letter-spacing:-.2px}
      .sh .note{font-size:11px;color:var(--muted2);letter-spacing:.16em;text-transform:uppercase}
      .kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:12px} @media (max-width:1100px){.kpis{grid-template-columns:repeat(3,1fr)}} @media (max-width:640px){.kpis{grid-template-columns:repeat(2,1fr)}}
      .kpi,.src,.pcard{border:1px solid var(--line);border-radius:14px;background:linear-gradient(180deg, rgba(11,18,32,.85), rgba(8,14,26,.65))}
      .kpi{padding:14px 14px 12px}.kpi .v{font-family:var(--mono);font-size:26px;font-weight:600;letter-spacing:-.5px}.kpi .lbl{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:6px}.kpi .h{font-size:12px;color:var(--muted);line-height:1.45;margin-top:8px}
      .green .v{color:var(--good)} .amber .v{color:var(--warn)} .cyan .v{color:var(--bert2)} .red .v{color:var(--bad)} .plum .v{color:var(--plum)}
      .stack{display:grid;grid-template-columns:repeat(3,1fr);gap:12px} @media (max-width:1100px){.stack{grid-template-columns:repeat(2,1fr)}} @media (max-width:640px){.stack{grid-template-columns:1fr}}
      .src{padding:16px}.src .src-name{font-size:11px;color:var(--bert);letter-spacing:.2em;text-transform:uppercase}.src .src-tit{margin:8px 0 6px;font-size:17px;font-weight:600}
      .ttbl{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:14px;overflow:hidden}
      .ttbl th,.ttbl td{padding:13px 14px;text-align:left;font-size:13.5px;vertical-align:top}
      .ttbl thead th{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted2);border-bottom:1px solid var(--line);background:rgba(11,18,32,.5)}
      .ttbl tbody tr:hover{background:rgba(55,255,139,.03)} .ttbl td,.ttbl td *{color:var(--muted)} .ttbl b{color:var(--text)}
      .board{display:grid;grid-template-columns:repeat(3,1fr);gap:14px} @media (max-width:1000px){.board{grid-template-columns:1fr}}
      .pcard{padding:18px 20px;display:flex;flex-direction:column}.pcard .ptop{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.pcard .pnum{font-family:var(--mono);font-size:22px;font-weight:600;color:var(--bert)}.pcard .ppri{font-family:var(--mono);font-size:10px;padding:5px 10px;border-radius:999px;border:1px solid var(--line);color:var(--bert);letter-spacing:.14em;background:rgba(55,255,139,.06)}.pcard h3{margin:6px 0 8px;font-size:19px;font-weight:600}.pcard .pdesc{font-size:13.5px;color:var(--muted);line-height:1.55;margin:0 0 14px}.pcard ul.check{list-style:none;padding:0;margin:0 0 14px}.pcard ul.check li{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:6px 0;font-size:13.5px;color:var(--muted);line-height:1.45}.pcard ul.check li:before{content:"";width:14px;height:14px;border:1px solid var(--line);border-radius:3px;background:rgba(6,10,18,.4);margin-top:3px}
      .st{font-size:10px;padding:4px 9px;border-radius:6px;letter-spacing:.1em;text-transform:uppercase;border:1px solid currentColor;display:inline-block}
      .st.red{color:var(--bad)} .st.yellow{color:var(--warn)} .st.green{color:var(--good)} .st.info{color:var(--bert2)}
      .footer{margin-top:30px;padding-top:14px;border-top:1px dashed var(--line2);display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--muted2);letter-spacing:.08em}
      a{color:inherit} code{font-family:var(--mono);font-size:12px;color:var(--bert2);background:rgba(25,199,255,.08);padding:1px 6px;border-radius:5px;border:1px solid rgba(25,199,255,.18)}
    </style>
  </head>
  <body>
    <div class="grid-bg"></div>
    <div class="wrap">
      <div class="topbar">
        <div class="left">Kinetic Gain · Power BI Refresh Reliability Hub</div>
        <div class="right">
          <div>synthetic refresh snapshots · delivery packets</div>
          <div>power bi · reporting ops · semantic models</div>
        </div>
      </div>
      <div class="herorow">
        <section class="hero">
          <div class="chiprow">
            <span class="meta-chip">Wave 14 · Data, Reporting &amp; FinOps Operations</span>
            <span class="meta-chip">Power BI / reporting reliability proof</span>
            <span class="meta-chip">Synthetic workspace, gateway, and dataset exports</span>
          </div>
          <h1>Refreshes, gateways, and report delivery that stay operator-readable.</h1>
          <p>This control plane turns raw Power BI refresh and delivery drift into one reporting surface: refresh-SLA breaches, gateway pressure, semantic-model drift, stale executive views, telemetry gaps, and the remediation packets needed before scorecards or finance decks slip.</p>
          <div class="navrow">
            ${nav.map((link) => `<a class="navchip${active === link.href ? " active" : ""}" href="${link.href}">${link.label}</a>`).join("")}
          </div>
        </section>
        <aside class="side">
          <div class="bluf">
            <div class="lbl">Commercial Front Door</div>
            <p><strong>Power BI refresh reliability and report-delivery operations for platform, reporting, and RevOps teams.</strong><br />Audit-safe visibility into failed refresh paths, gateway pressure, stale scorecards, and report-delivery risk without exposing live tenant credentials.</p>
          </div>
          <div class="corr">
            <div class="lbl">Proof Layer</div>
            <p><strong>Offline analyzer + CLI + dashboard surface.</strong><br />This repo reads refresh and delivery snapshots and turns them into severity, owner, and remediation packets operators can actually use.</p>
          </div>
          <div class="corr">
            <div class="lbl">Why it matters</div>
            <p>Recruiters looking for <strong>Power BI / reporting ops / Microsoft data stack / BI platform</strong> should see real refresh and delivery work: gateway pressure, semantic-model trust, and scorecard freshness.</p>
          </div>
        </aside>
      </div>
      ${body}
      <div class="footer">
        <div>powerbi-refresh-reliability-hub · synthetic sample data only</div>
        <div>routes: / · /refresh-lane · /pipeline-gaps · /delivery-posture · /verification · /docs</div>
      </div>
    </div>
  </body>
</html>`;
}

function severityClass(value: string) {
  if (value === "high" || value === "red") return "red";
  if (value === "medium" || value === "yellow") return "yellow";
  if (value === "green" || value === "low") return "green";
  return "info";
}

export function renderOverview() {
  const metrics = summary();
  return layout(
    "Power BI Refresh Reliability Hub",
    "/",
    `<section class="section">
        <div class="sh"><h2>Operator Snapshot</h2><div class="note">refreshes · gateways · semantic models · delivery</div></div>
        <div class="kpis">
          <div class="kpi cyan"><div class="v">${metrics.snapshots}</div><div class="lbl">snapshots</div><div class="h">Synthetic workspace and dataset snapshots feeding the reliability lane.</div></div>
          <div class="kpi green"><div class="v">${metrics.currentSnapshots}</div><div class="lbl">current snapshots</div><div class="h">Snapshots still fresh enough to trust for report-delivery decisions.</div></div>
          <div class="kpi plum"><div class="v">${metrics.drifts}</div><div class="lbl">drifts</div><div class="h">Open packets across refresh, gateways, semantic models, delivery, and telemetry.</div></div>
          <div class="kpi red"><div class="v">${metrics.failedRefreshPaths}</div><div class="lbl">failed paths</div><div class="h">Refresh and gateway paths still degrading the reporting window.</div></div>
          <div class="kpi amber"><div class="v">${metrics.deliveryRisks}</div><div class="lbl">delivery risks</div><div class="h">Semantic-model and stale-report conditions still weakening downstream trust.</div></div>
          <div class="kpi red"><div class="v">${metrics.remediationEscalations}</div><div class="lbl">escalations</div><div class="h">Packets still needing owner action before posture can be called healthy.</div></div>
        </div>
      </section>
      <section class="section">
        <div class="sh"><h2>Why operators care</h2><div class="note">reporting proof · recruiter signal</div></div>
        <div class="stack">
          <div class="src"><div class="src-name">containment first</div><div class="src-tit">Route the refresh issue before stale reports spread</div><p>${metrics.recommendation}</p></div>
          <div class="src"><div class="src-name">owner evidence</div><div class="src-tit">Turn refresh exports into operator proof</div><p>Every lane stays tied to owner, drift family, workspace impact, and the next concrete reliability move.</p></div>
          <div class="src"><div class="src-name">recruiter signal</div><div class="src-tit">Show real Power BI reliability depth</div><p>This is real Microsoft reporting and semantic-model proof, not generic BI dashboard copy.</p></div>
        </div>
      </section>`
  );
}

export function renderRefreshLane() {
  return layout(
    "Power BI Refresh Reliability Hub — Refresh Lane",
    "/refresh-lane",
    `<section class="section">
        <div class="sh"><h2>Refresh Lane</h2><div class="note">owner · focus · next action</div></div>
        <table class="ttbl">
          <thead><tr><th>Lane</th><th>Owner</th><th>Focus</th><th>Status</th><th>Findings</th><th>Next action</th></tr></thead>
          <tbody>
            ${refreshLane().map((lane) => `<tr><td><b>${lane.lane}</b><br />${lane.note}</td><td>${lane.owner}</td><td>${lane.focus}</td><td><span class="st ${severityClass(lane.status)}">${lane.status}</span></td><td>${lane.relatedFindings}</td><td>${lane.nextAction}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>`
  );
}

export function renderPipelineGaps() {
  return layout(
    "Power BI Refresh Reliability Hub — Pipeline Gaps",
    "/pipeline-gaps",
    `<section class="section">
        <div class="sh"><h2>Pipeline Gaps</h2><div class="note">severity · owner · resource</div></div>
        <table class="ttbl">
          <thead><tr><th>Gap</th><th>Owner</th><th>Subject</th><th>Family</th><th>Message</th></tr></thead>
          <tbody>
            ${pipelineGaps().map((finding) => `<tr><td><span class="st ${severityClass(finding.severity)}">${finding.severity}</span><br /><b>${finding.code}</b></td><td>${finding.owner}</td><td>${finding.subjectName ?? finding.subject}<br />${finding.resourceName ?? ""}</td><td>${finding.family ?? "—"}</td><td>${finding.message}</td></tr>`).join("")}
          </tbody>
        </table>
      </section>`
  );
}

export function renderDeliveryPosture() {
  return layout(
    "Power BI Refresh Reliability Hub — Delivery Posture",
    "/delivery-posture",
    `<section class="section">
        <div class="sh"><h2>Delivery Posture</h2><div class="note">packet readiness · blocker · cleanup window</div></div>
        <div class="board">
          ${deliveryPosture().map((packet) => `<article class="pcard"><div class="ptop"><div class="pnum">${packet.completenessScore}%</div><div class="ppri">${packet.owner}</div></div><h3>${packet.lane}</h3><p class="pdesc">${packet.decisionNote}</p><ul class="check"><li>${packet.blocker}</li><li>${packet.launchWindowHours} hours to the next reporting checkpoint</li><li>Status: <span class="st ${severityClass(packet.status)}">${packet.status}</span></li></ul><div><code>${packet.packetId}</code></div></article>`).join("")}
        </div>
      </section>`
  );
}

export function renderVerification() {
  return layout(
    "Power BI Refresh Reliability Hub — Verification",
    "/verification",
    `<section class="section">
        <div class="sh"><h2>Verification</h2><div class="note">operator-safe claims only</div></div>
        <div class="stack">
          ${verification().map((item, index) => `<div class="src"><div class="src-name">verification ${index + 1}</div><div class="src-tit">${item}</div><p>This surface is built to stay honest about synthetic data, offline exports, and real Power BI reporting posture.</p></div>`).join("")}
        </div>
      </section>`
  );
}

export function renderDocs() {
  return layout(
    "Power BI Refresh Reliability Hub — Docs",
    "/docs",
    `<section class="section">
        <div class="sh"><h2>Docs</h2><div class="note">routes · cli · api</div></div>
        <div class="stack">
          <div class="src"><div class="src-name">routes</div><div class="src-tit">Public control surface</div><p><code>/</code>, <code>/refresh-lane</code>, <code>/pipeline-gaps</code>, <code>/delivery-posture</code>, <code>/verification</code>, <code>/docs</code></p></div>
          <div class="src"><div class="src-name">api</div><div class="src-tit">Structured payloads</div><p><code>/api/dashboard/summary</code>, <code>/api/refresh-lane</code>, <code>/api/pipeline-gaps</code>, <code>/api/delivery-posture</code>, <code>/api/verification</code>, <code>/api/sample</code></p></div>
          <div class="src"><div class="src-name">cli</div><div class="src-tit">Offline Power BI refresh analysis</div><p><code>npx powerbi-refresh-reliability-hub fixtures/powerbi-refresh-healthy.json --format summary</code> renders the same posture the dashboard exposes.</p></div>
        </div>
      </section>`
  );
}

export function renderSample() {
  return JSON.stringify(payload(), null, 2);
}
