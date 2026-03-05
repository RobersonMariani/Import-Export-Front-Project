import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useImportStore } from "@/stores/import";

vi.mock("@/services/importService", () => ({
  importService: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
  },
}));

import { importService } from "@/services/importService";

const mockImport = {
  id: "uuid-1",
  status: "queued" as const,
  status_label: "Na fila",
  progress: 0,
  total_records: 100,
  success_count: 0,
  failure_count: 0,
  original_filename: "test.csv",
  started_at: null,
  finished_at: null,
  processing_time_seconds: null,
  estimated_remaining_seconds: null,
  created_at: "2026-01-01T00:00:00Z",
};

describe("useImportStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("uploads CSV", async () => {
    vi.mocked(importService.create).mockResolvedValue(mockImport);

    const store = useImportStore();
    const file = new File(["content"], "test.csv", { type: "text/csv" });
    const result = await store.uploadCsv(file);

    expect(result.id).toBe("uuid-1");
    expect(importService.create).toHaveBeenCalledWith(file);
  });

  it("fetches imports", async () => {
    vi.mocked(importService.list).mockResolvedValue({
      data: [mockImport],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
    });

    const store = useImportStore();
    await store.fetchImports();

    expect(store.imports).toHaveLength(1);
  });

  it("refreshes import status", async () => {
    vi.mocked(importService.get).mockResolvedValue({
      ...mockImport,
      status: "processing" as const,
      progress: 50,
    });

    const store = useImportStore();
    await store.refreshStatus("uuid-1");

    expect(store.currentImport?.status).toBe("processing");
    expect(store.currentImport?.progress).toBe(50);
  });
});
