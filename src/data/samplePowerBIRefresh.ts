import type { PowerBIRefreshExport } from "../types.js";

export const samplePowerBIRefreshPayload: PowerBIRefreshExport = {
  snapshots: [
    {
      id: "snap-exec-scorecards",
      name: "Executive scorecards and weekly board KPIs",
      scope: "WORKSPACE",
      scopePath: "/tenants/kg-prod/workspaces/executive-scorecards",
      workspace: "Executive Scorecards",
      baselineStatus: "CURRENT",
      owner: "BI Platform",
      refreshSuccessPct: 82,
      avgRefreshMinutes: 28,
      staleDatasets: 2,
      affectedReports: 11,
      collectedAt: "2026-05-30T13:00:00Z"
    },
    {
      id: "snap-finance-pack",
      name: "Finance reporting pack and month-close deck",
      scope: "WORKSPACE",
      scopePath: "/tenants/kg-prod/workspaces/finance-close",
      workspace: "Finance Close",
      baselineStatus: "STALE",
      owner: "Reporting Operations",
      refreshSuccessPct: 91,
      avgRefreshMinutes: 34,
      staleDatasets: 1,
      affectedReports: 7,
      collectedAt: "2026-05-27T08:30:00Z"
    }
  ],
  drifts: [
    {
      id: "drift-refresh-breach",
      snapshotId: "snap-exec-scorecards",
      scope: "DATASET",
      scopePath: "/tenants/kg-prod/workspaces/executive-scorecards/datasets/board_scorecard_model",
      family: "Refresh",
      status: "OPEN",
      resourceName: "board_scorecard_model",
      expectedState: "Critical executive semantic models refresh inside the published SLA window.",
      observedState: "Refresh duration and retry count both exceed the SLA before the board packet is distributed.",
      affectedReports: 6,
      changeWindowHours: 18,
      owner: "BI Platform",
      breaksGuardrail: true,
      affectsExecutiveReporting: true
    },
    {
      id: "drift-gateway-pressure",
      snapshotId: "snap-exec-scorecards",
      scope: "GATEWAY",
      scopePath: "/tenants/kg-prod/gateways/east-hybrid-gateway",
      family: "Gateway",
      status: "OPEN",
      resourceName: "east-hybrid-gateway",
      expectedState: "Gateway queue depth and connector latency stay inside the refresh envelope.",
      observedState: "Gateway saturation is delaying dataset refreshes and increasing queue contention during the executive cycle.",
      affectedReports: 9,
      changeWindowHours: 12,
      owner: "Platform Operations",
      breaksGuardrail: true,
      affectsTrust: true
    },
    {
      id: "drift-semantic-schema",
      snapshotId: "snap-finance-pack",
      scope: "DATASET",
      scopePath: "/tenants/kg-prod/workspaces/finance-close/datasets/month_close_model",
      family: "SemanticModel",
      status: "ACKNOWLEDGED",
      resourceName: "month_close_model",
      expectedState: "Semantic model lineage and measures stay aligned to the published finance-close schema.",
      observedState: "A measure dependency changed without the downstream report packet being fully revalidated.",
      affectedReports: 4,
      changeWindowHours: 29,
      owner: "Reporting Operations",
      affectsExecutiveReporting: true
    },
    {
      id: "drift-delivery-staleness",
      snapshotId: "snap-exec-scorecards",
      scope: "PIPELINE",
      scopePath: "/tenants/kg-prod/workspaces/executive-scorecards/pipelines/exec-distribution",
      family: "Delivery",
      status: "OPEN",
      resourceName: "exec-distribution",
      expectedState: "Reports distributed after refresh only when freshness and certification checks are green.",
      observedState: "Distribution packet can still send stale report URLs before the final freshness check completes.",
      affectedReports: 5,
      changeWindowHours: 14,
      owner: "RevOps Reporting",
      breaksGuardrail: true,
      affectsExecutiveReporting: true
    },
    {
      id: "drift-telemetry-gap",
      snapshotId: "snap-finance-pack",
      scope: "WORKSPACE",
      scopePath: "/tenants/kg-prod/workspaces/finance-close/telemetry/refresh-audit",
      family: "Telemetry",
      status: "OPEN",
      resourceName: "refresh-audit-feed",
      expectedState: "Refresh attempts, failures, and retries are fully captured for reporting and audit review.",
      observedState: "Telemetry partitions are missing for the last two reporting cycles, weakening refresh-trust evidence.",
      affectedReports: 7,
      changeWindowHours: 36,
      owner: "Platform Operations",
      breaksGuardrail: true,
      affectsTrust: true
    },
    {
      id: "drift-permission-gap",
      snapshotId: "snap-finance-pack",
      scope: "PIPELINE",
      scopePath: "/tenants/kg-prod/workspaces/finance-close/pipelines/month-close-handoff",
      family: "Permissions",
      status: "ACKNOWLEDGED",
      resourceName: "month-close-handoff",
      expectedState: "Workspace roles, distribution audiences, and refresh ownership stay mapped before publish.",
      observedState: "The handoff packet still depends on manual ownership confirmation for one finance distribution path.",
      affectedReports: 3,
      changeWindowHours: 31,
      owner: "Reporting Operations",
      affectsTrust: true
    }
  ]
};

export const refreshLanePackets = [
  {
    id: "refresh-reliability",
    lane: "Refresh reliability lane",
    owner: "BI Platform",
    focus: "Dataset refresh success, retry behavior, and SLA protection",
    status: "red",
    note: "Critical scorecard models are still running too close to the refresh SLA wall.",
    nextAction: "Stabilize the failing semantic models before the next executive packet leaves the workspace."
  },
  {
    id: "gateway-health",
    lane: "Gateway health lane",
    owner: "Platform Operations",
    focus: "Hybrid gateway queue depth, connector latency, and refresh throughput",
    status: "red",
    note: "Gateway contention is still weakening the refresh window for high-visibility workspaces.",
    nextAction: "Reduce queue pressure and restore headroom on the busiest gateway path."
  },
  {
    id: "delivery-confidence",
    lane: "Delivery confidence lane",
    owner: "RevOps Reporting",
    focus: "Freshness checks, report distribution sequencing, and stale-link prevention",
    status: "yellow",
    note: "Distribution confidence is recoverable, but one pipeline can still send stale executive views.",
    nextAction: "Tie distribution to the last successful freshness checkpoint."
  },
  {
    id: "telemetry-governance",
    lane: "Telemetry governance lane",
    owner: "Platform Operations",
    focus: "Refresh audit coverage, ownership evidence, and operator trust",
    status: "yellow",
    note: "Refresh evidence exists, but audit continuity and ownership handoff are still partially manual.",
    nextAction: "Restore telemetry continuity and lock the remaining ownership packet."
  }
] as const;

export const deliveryPackets = [
  {
    packetId: "PBI-11",
    lane: "Executive scorecard refresh",
    owner: "BI Platform",
    status: "red",
    completenessScore: 58,
    decisionNote: "Refresh retries and gateway delay are both active, so the executive scorecard cycle is not ready for sign-off.",
    blocker: "Semantic model refresh and gateway queue pressure both need remediation before publish.",
    launchWindowHours: 10
  },
  {
    packetId: "PBI-18",
    lane: "Board packet distribution",
    owner: "RevOps Reporting",
    status: "red",
    completenessScore: 61,
    decisionNote: "Distribution can still outrun the final freshness check on board-facing links.",
    blocker: "Freshness gate and stale-link prevention are not fully locked.",
    launchWindowHours: 12
  },
  {
    packetId: "PBI-24",
    lane: "Finance close semantic model",
    owner: "Reporting Operations",
    status: "yellow",
    completenessScore: 74,
    decisionNote: "Schema confidence can clear once the downstream measure packet is revalidated.",
    blocker: "One semantic-model dependency and one ownership handoff are still pending.",
    launchWindowHours: 18
  },
  {
    packetId: "PBI-31",
    lane: "Refresh audit restoration",
    owner: "Platform Operations",
    status: "yellow",
    completenessScore: 70,
    decisionNote: "Telemetry trust is recoverable in one cleanup cycle if the audit feed is restored now.",
    blocker: "Refresh audit partitions must replay before the next reporting review.",
    launchWindowHours: 24
  }
] as const;
