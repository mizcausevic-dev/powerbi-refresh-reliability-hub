import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { analyze } from "../src/analyze.js";
import { toMarkdown, toSummary } from "../src/format.js";
import type { PowerBIRefreshExport } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));
const fixture = (name: string): PowerBIRefreshExport =>
  JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as PowerBIRefreshExport;

const NOW = "2026-05-30T00:00:00Z";

describe("analyze", () => {
  it("counts snapshots and drifts", () => {
    const report = analyze(fixture("powerbi-refresh-hotspots.json"), { now: NOW });
    expect(report.snapshots).toBe(2);
    expect(report.currentSnapshots).toBe(1);
    expect(report.drifts).toBe(6);
  });

  it("flags missing current snapshots as high", () => {
    const report = analyze({ snapshots: [], drifts: [] }, { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "no-current-snapshot")?.severity).toBe("high");
  });

  it("flags refresh, gateway, semantic-model, delivery, telemetry, and permission gaps", () => {
    const report = analyze(fixture("powerbi-refresh-hotspots.json"), { now: NOW });
    expect(report.findingsList.find((finding) => finding.code === "refresh-sla-breach")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "gateway-capacity-risk")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "semantic-model-drift")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "downstream-report-staleness")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeDefined();
    expect(report.findingsList.find((finding) => finding.code === "permission-handoff-gap")).toBeDefined();
  });

  it("flags stale remediation windows", () => {
    const report = analyze(fixture("powerbi-refresh-hotspots.json"), { now: NOW, staleRemediationAfterHours: 24 });
    expect(report.findingsList.find((finding) => finding.code === "stale-remediation-window")).toBeDefined();
  });

  it("flags stale snapshots and low-severity stale remediation paths", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "snap-stale",
            name: "Legacy finance workspace",
            scope: "WORKSPACE",
            scopePath: "/tenants/kg-prod/workspaces/legacy-finance",
            workspace: "Legacy Finance",
            baselineStatus: "STALE",
            owner: "Reporting Operations",
            refreshSuccessPct: 92,
            avgRefreshMinutes: 25,
            staleDatasets: 1,
            affectedReports: 2,
            collectedAt: "2026-05-26T10:00:00Z"
          }
        ],
        drifts: [
          {
            id: "drift-slow-owner-followup",
            snapshotId: "snap-stale",
            scope: "PIPELINE",
            scopePath: "/tenants/kg-prod/workspaces/legacy-finance/pipelines/followup",
            family: "Permissions",
            status: "ROUTED",
            resourceName: "followup",
            expectedState: "Ownership packet is fully mapped before publish.",
            observedState: "Manual owner reminder still pending.",
            affectedReports: 1,
            changeWindowHours: 30,
            owner: "Reporting Operations"
          }
        ]
      },
      { now: NOW, staleRemediationAfterHours: 24 }
    );

    expect(report.findingsList.find((finding) => finding.code === "stale-snapshot")?.severity).toBe("medium");
    expect(report.findingsList.find((finding) => finding.code === "stale-remediation-window")?.severity).toBe("low");
  });

  it("does not create family findings when branch conditions are not met", () => {
    const report = analyze(
      {
        snapshots: [
          {
            id: "snap-current",
            name: "Stable workspace",
            scope: "WORKSPACE",
            scopePath: "/tenants/kg-prod/workspaces/stable",
            workspace: "Stable Workspace",
            baselineStatus: "CURRENT",
            owner: "BI Platform",
            refreshSuccessPct: 99,
            avgRefreshMinutes: 12,
            staleDatasets: 0,
            affectedReports: 3,
            collectedAt: "2026-05-30T10:00:00Z"
          }
        ],
        drifts: [
          {
            id: "drift-refresh-muted",
            snapshotId: "snap-current",
            scope: "DATASET",
            scopePath: "/tenants/kg-prod/workspaces/stable/datasets/core",
            family: "Refresh",
            status: "ROUTED",
            resourceName: "core",
            expectedState: "Refresh remains stable.",
            observedState: "Completed on schedule.",
            affectedReports: 1,
            changeWindowHours: 2,
            owner: "BI Platform",
            breaksGuardrail: false
          },
          {
            id: "drift-telemetry-muted",
            snapshotId: "snap-current",
            scope: "WORKSPACE",
            scopePath: "/tenants/kg-prod/workspaces/stable/telemetry",
            family: "Telemetry",
            status: "ROUTED",
            resourceName: "telemetry-feed",
            expectedState: "Coverage remains healthy.",
            observedState: "Healthy feed.",
            affectedReports: 1,
            changeWindowHours: 2,
            owner: "Platform Operations",
            breaksGuardrail: false
          }
        ]
      },
      { now: NOW }
    );

    expect(report.findingsList.find((finding) => finding.code === "refresh-sla-breach")).toBeUndefined();
    expect(report.findingsList.find((finding) => finding.code === "telemetry-gap")).toBeUndefined();
  });

  it("ok=true on a clean fixture", () => {
    const report = analyze(fixture("powerbi-refresh-healthy.json"), { now: NOW });
    expect(report.ok).toBe(true);
    expect(report.findingsList.filter((finding) => finding.severity === "high")).toEqual([]);
  });
});

describe("formatters", () => {
  it("toMarkdown ranks high findings first", () => {
    const markdown = toMarkdown(analyze(fixture("powerbi-refresh-hotspots.json"), { now: NOW }));
    expect(markdown).toContain("❌");
    expect(markdown.indexOf("🔴")).toBeLessThan(markdown.indexOf("🟠"));
  });

  it("toSummary emits a one-liner", () => {
    const summary = toSummary(analyze(fixture("powerbi-refresh-hotspots.json"), { now: NOW }));
    expect(summary).toMatch(/snapshots/);
    expect(summary).toMatch(/drifts/);
  });

  it("toMarkdown emits the no-findings branch when the report is clean", () => {
    const markdown = toMarkdown(analyze(fixture("powerbi-refresh-healthy.json"), { now: NOW }));
    expect(markdown).toContain("No findings.");
  });
});
