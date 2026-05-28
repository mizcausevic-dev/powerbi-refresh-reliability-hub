// SPDX-License-Identifier: AGPL-3.0-or-later

import { analyze } from "../analyze.js";
import { deliveryPackets, refreshLanePackets, samplePowerBIRefreshPayload } from "../data/samplePowerBIRefresh.js";
import type { Finding } from "../types.js";

const NOW = "2026-05-30T00:00:00Z";
const report = analyze(samplePowerBIRefreshPayload, {
  now: NOW,
  staleRemediationAfterHours: 24
});

function severityRank(finding: Finding): number {
  return finding.severity === "high" ? 0 : finding.severity === "medium" ? 1 : finding.severity === "low" ? 2 : 3;
}

export function summary() {
  return {
    snapshots: report.snapshots,
    currentSnapshots: report.currentSnapshots,
    drifts: report.drifts,
    failedRefreshPaths: report.failedRefreshPaths,
    deliveryRisks: report.deliveryRisks,
    remediationEscalations: report.remediationEscalations,
    highFindings: report.findingsList.filter((finding) => finding.severity === "high").length,
    recommendation:
      "Stabilize the failing refresh paths, relieve gateway pressure, revalidate semantic-model delivery, and restore refresh audit continuity before the next executive reporting cycle."
  };
}

export function refreshLane() {
  return refreshLanePackets.map((lane) => ({
    ...lane,
    relatedFindings: report.findingsList.filter((finding) => {
      if (lane.id === "refresh-reliability") {
        return finding.code === "refresh-sla-breach" || finding.code === "stale-snapshot";
      }
      if (lane.id === "gateway-health") {
        return finding.code === "gateway-capacity-risk";
      }
      if (lane.id === "delivery-confidence") {
        return finding.code === "semantic-model-drift" || finding.code === "downstream-report-staleness";
      }
      if (lane.id === "telemetry-governance") {
        return finding.code === "telemetry-gap" || finding.code === "permission-handoff-gap" || finding.code === "stale-remediation-window";
      }
      return false;
    }).length
  }));
}

export function pipelineGaps() {
  return [...report.findingsList]
    .sort((left, right) => severityRank(left) - severityRank(right))
    .map((finding) => ({
      ...finding,
      owner:
        finding.code === "refresh-sla-breach"
          ? "BI Platform"
          : finding.code === "gateway-capacity-risk" || finding.code === "telemetry-gap"
            ? "Platform Operations"
            : finding.code === "semantic-model-drift" || finding.code === "permission-handoff-gap"
              ? "Reporting Operations"
              : "RevOps Reporting"
    }));
}

export function deliveryPosture() {
  return deliveryPackets;
}

export function verification() {
  return [
    "The dashboard is backed by a real offline analyzer and CLI, not static copy alone.",
    "Refresh snapshots, semantic-model packets, and delivery drifts are synthetic sample data only; no live tenant, report, or credential secrets are published.",
    "The control plane keeps refresh reliability, gateway pressure, semantic-model trust, and downstream delivery posture visible for reporting stakeholders.",
    "This surface demonstrates Power BI refresh and report-delivery operations, not a generic BI keyword page.",
    "It complements reporting, Azure, GCP, and warehouse cost-governance proof with a concrete Microsoft BI reliability lane."
  ];
}

export function payload() {
  return {
    summary: summary(),
    refreshLane: refreshLane(),
    pipelineGaps: pipelineGaps(),
    deliveryPosture: deliveryPosture(),
    verification: verification(),
    sample: samplePowerBIRefreshPayload
  };
}
