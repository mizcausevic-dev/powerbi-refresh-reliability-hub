import { deliveryPosture, pipelineGaps, summary } from "../src/services/powerBiRefreshReliabilityHubService.js";

console.log("powerbi-refresh-reliability-hub demo");
console.log(summary());
console.log(
  deliveryPosture().map((packet) => ({
    lane: packet.lane,
    owner: packet.owner,
    status: packet.status
  }))
);
console.log(pipelineGaps().slice(0, 3));
