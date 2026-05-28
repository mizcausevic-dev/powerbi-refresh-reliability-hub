// SPDX-License-Identifier: AGPL-3.0-or-later

export type ScopeKind = "TENANT" | "WORKSPACE" | "DATASET" | "PIPELINE" | "GATEWAY";
export type BaselineStatus = "CURRENT" | "STALE";
export type DriftStatus = "OPEN" | "ACKNOWLEDGED" | "ROUTED";
export type AnomalyFamily =
  | "Refresh"
  | "Gateway"
  | "SemanticModel"
  | "Delivery"
  | "Telemetry"
  | "Permissions";

export interface RefreshSnapshot {
  id: string;
  name: string;
  scope: ScopeKind;
  scopePath: string;
  workspace: string;
  baselineStatus: BaselineStatus;
  owner: string;
  refreshSuccessPct: number;
  avgRefreshMinutes: number;
  staleDatasets: number;
  affectedReports: number;
  collectedAt: string;
}

export interface RefreshDrift {
  id: string;
  snapshotId: string;
  scope: ScopeKind;
  scopePath: string;
  family: AnomalyFamily;
  status: DriftStatus;
  resourceName: string;
  expectedState: string;
  observedState: string;
  affectedReports: number;
  changeWindowHours: number;
  owner: string;
  breaksGuardrail?: boolean;
  affectsExecutiveReporting?: boolean;
  affectsTrust?: boolean;
  note?: string;
}

export interface PowerBIRefreshExport {
  snapshots?: RefreshSnapshot[];
  drifts?: RefreshDrift[];
}

export type FindingSeverity = "high" | "medium" | "low" | "info";

export type FindingCode =
  | "no-current-snapshot"
  | "stale-snapshot"
  | "refresh-sla-breach"
  | "gateway-capacity-risk"
  | "semantic-model-drift"
  | "downstream-report-staleness"
  | "telemetry-gap"
  | "permission-handoff-gap"
  | "stale-remediation-window";

export interface Finding {
  code: FindingCode;
  severity: FindingSeverity;
  message: string;
  subject: string;
  subjectName?: string;
  scope?: ScopeKind;
  family?: AnomalyFamily;
  resourceName?: string;
}

export interface DriftReport {
  generatedAt: string;
  snapshots: number;
  currentSnapshots: number;
  drifts: number;
  failedRefreshPaths: number;
  deliveryRisks: number;
  remediationEscalations: number;
  findingsList: Finding[];
  ok: boolean;
}

export interface DriftOptions {
  now?: string;
  staleRemediationAfterHours?: number;
}
