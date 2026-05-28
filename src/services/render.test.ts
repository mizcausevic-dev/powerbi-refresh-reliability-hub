import { describe, expect, test } from "vitest";

import {
  renderDeliveryPosture,
  renderDocs,
  renderOverview,
  renderPipelineGaps,
  renderRefreshLane,
  renderSample,
  renderVerification
} from "./render.js";

describe("render surfaces", () => {
  test("overview carries the Power BI reliability framing", () => {
    expect(renderOverview()).toContain("Power BI Refresh Reliability Hub");
    expect(renderOverview()).toContain("Refreshes, gateways, and report delivery");
    expect(renderOverview()).toContain("Operator Snapshot");
  });

  test("docs route exposes the CLI and API shape", () => {
    const html = renderDocs();
    expect(html).toContain("powerbi-refresh-reliability-hub");
    expect(html).toContain("/api/pipeline-gaps");
  });

  test("refresh lane route renders the lane table", () => {
    const html = renderRefreshLane();
    expect(html).toContain("Refresh Lane");
    expect(html).toContain("Refresh reliability lane");
    expect(html).toContain("Gateway health lane");
  });

  test("pipeline gaps route includes ranked finding rows", () => {
    const html = renderPipelineGaps();
    expect(html).toContain("Pipeline Gaps");
    expect(html).toContain("refresh-sla-breach");
    expect(html).toContain("gateway-capacity-risk");
  });

  test("delivery posture route exposes packet status", () => {
    const html = renderDeliveryPosture();
    expect(html).toContain("Delivery Posture");
    expect(html).toContain("Executive scorecard refresh");
    expect(html).toContain("PBI-11");
  });

  test("verification route keeps the synthetic-data constraint visible", () => {
    const html = renderVerification();
    expect(html).toContain("Verification");
    expect(html).toContain("synthetic sample data");
    expect(html).toContain("operator-safe claims only");
  });

  test("sample route emits the JSON payload", () => {
    const json = renderSample();
    expect(json).toContain("\"summary\"");
    expect(json).toContain("\"refreshLane\"");
    expect(json).toContain("\"sample\"");
  });
});
