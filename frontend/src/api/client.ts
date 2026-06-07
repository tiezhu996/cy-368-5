import { API_BASE_URL } from "../constants/app";
import type { OverviewResponse, BatchUpdateRequest, BatchUpdateResponse } from "../types";

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function batchUpdateOperations(request: BatchUpdateRequest): Promise<BatchUpdateResponse> {
  const response = await fetch(`${API_BASE_URL}/operations/batch`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Batch update request failed: ${response.status}`);
  }

  return response.json() as Promise<BatchUpdateResponse>;
}
