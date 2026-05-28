import { describe, expect, test } from "vitest";

import { deliveryPosture, pipelineGaps, refreshLane, summary, verification } from "./powerBiRefreshReliabilityHubService.js";

describe("powerBiRefreshReliabilityHubService", () => {
  test("summary exposes the expected operator counts", () => {
    expect(summary().snapshots).toBe(2);
    expect(summary().drifts).toBe(6);
  });

  test("refresh lane keeps four operator lanes", () => {
    expect(refreshLane()).toHaveLength(4);
    expect(refreshLane()[0]?.lane).toContain("Refresh");
  });

  test("pipeline gaps include refresh findings", () => {
    expect(pipelineGaps().some((finding) => finding.code === "refresh-sla-breach")).toBe(true);
  });

  test("delivery posture stays packet-shaped", () => {
    expect(deliveryPosture().every((packet) => typeof packet.completenessScore === "number")).toBe(true);
  });

  test("verification stays explicit about synthetic data", () => {
    expect(verification().join(" ")).toContain("synthetic");
  });
});
