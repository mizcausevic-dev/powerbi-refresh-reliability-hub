import type { DriftOptions, DriftReport, Finding, PowerBIRefreshExport, RefreshSnapshot } from "./types.js";

function isCurrent(snapshot: RefreshSnapshot): boolean {
  return snapshot.baselineStatus === "CURRENT";
}

export function analyze(payload: PowerBIRefreshExport, options: DriftOptions = {}): DriftReport {
  const now = options.now ?? new Date().toISOString();
  const staleRemediationAfterHours = options.staleRemediationAfterHours ?? 24;
  const snapshots = payload.snapshots ?? [];
  const drifts = payload.drifts ?? [];
  const findingsList: Finding[] = [];

  const currentSnapshots = snapshots.filter(isCurrent).length;
  if (currentSnapshots === 0) {
    findingsList.push({
      code: "no-current-snapshot",
      severity: "high",
      message: "No current Power BI refresh snapshot is available for reliability decisions.",
      subject: "snapshot-currentness"
    });
  }

  for (const snapshot of snapshots) {
    if (snapshot.baselineStatus === "STALE") {
      findingsList.push({
        code: "stale-snapshot",
        severity: "medium",
        message: `Refresh snapshot for "${snapshot.name}" is stale and should be regenerated before certifying report freshness posture.`,
        subject: snapshot.id,
        subjectName: snapshot.scopePath,
        scope: snapshot.scope
      });
    }
  }

  for (const drift of drifts) {
    const observed = drift.observedState.toLowerCase();
    const expected = drift.expectedState.toLowerCase();

    if (drift.family === "Refresh" && (observed.includes("refresh") || observed.includes("retry") || drift.breaksGuardrail)) {
      findingsList.push({
        code: "refresh-sla-breach",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Refresh SLA pressure is active on "${drift.resourceName}" and should be contained before business-facing reports age out.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Gateway" && (observed.includes("gateway") || observed.includes("queue") || drift.breaksGuardrail)) {
      findingsList.push({
        code: "gateway-capacity-risk",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Gateway capacity is under pressure on "${drift.resourceName}" and refresh throughput should be stabilized before queue times keep compounding.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "SemanticModel" && (observed.includes("measure") || observed.includes("schema") || expected.includes("semantic model"))) {
      findingsList.push({
        code: "semantic-model-drift",
        severity: drift.affectsExecutiveReporting ? "high" : "medium",
        message: `Semantic-model drift is active on "${drift.resourceName}" and downstream report validation is no longer fully trustworthy.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Delivery" && (observed.includes("stale") || observed.includes("distribution") || drift.affectsExecutiveReporting)) {
      findingsList.push({
        code: "downstream-report-staleness",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Distribution posture is degraded on "${drift.resourceName}" and report consumers could still see stale content.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Telemetry" && (observed.includes("telemetry") || observed.includes("missing") || expected.includes("audit"))) {
      findingsList.push({
        code: "telemetry-gap",
        severity: drift.breaksGuardrail ? "high" : "medium",
        message: `Refresh telemetry coverage is broken on "${drift.resourceName}", weakening audit trust and operator evidence.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.family === "Permissions" && (observed.includes("manual") || observed.includes("ownership") || drift.affectsTrust)) {
      findingsList.push({
        code: "permission-handoff-gap",
        severity: "medium",
        message: `Ownership or permission handoff is still manual on "${drift.resourceName}", which weakens delivery confidence.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }

    if (drift.changeWindowHours > staleRemediationAfterHours) {
      findingsList.push({
        code: "stale-remediation-window",
        severity: drift.changeWindowHours > staleRemediationAfterHours * 2 ? "medium" : "low",
        message: `Drift on "${drift.scopePath}" has remained unresolved for ${drift.changeWindowHours} hours.`,
        subject: drift.id,
        subjectName: drift.scopePath,
        scope: drift.scope,
        family: drift.family,
        resourceName: drift.resourceName
      });
    }
  }

  const failedRefreshPaths = drifts.filter((drift) => drift.family === "Refresh" || drift.family === "Gateway").length;
  const deliveryRisks = drifts.filter((drift) => drift.family === "Delivery" || drift.family === "SemanticModel").length;
  const remediationEscalations = drifts.filter((drift) => drift.breaksGuardrail || drift.status !== "ROUTED").length;
  const ok = !findingsList.some((finding) => finding.severity === "high");

  return {
    generatedAt: now,
    snapshots: snapshots.length,
    currentSnapshots,
    drifts: drifts.length,
    failedRefreshPaths,
    deliveryRisks,
    remediationEscalations,
    findingsList,
    ok
  };
}
