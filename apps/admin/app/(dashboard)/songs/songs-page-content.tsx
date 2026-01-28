"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { SongsTable } from "@/components/songs/songs-table";
import { SongsToolbar } from "@/components/songs/songs-toolbar";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { songsApi } from "@/lib/api";
import type { SongResponseDto, PaginationMeta } from "@love-days/types";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export function SongsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL params
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [published, setPublished] = useState(
    searchParams.get("published") ?? "all",
  );
  const [sourceType, setSourceType] = useState(
    searchParams.get("sourceType") ?? "all",
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("pageSize")) || 10,
  );

  const [songs, setSongs] = useState<SongResponseDto[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  // Sync state to URL params
  const updateUrl = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== "all" && value !== 1 && value !== 10) {
          newParams.set(key, String(value));
        }
      });
      // Keep non-default pageSize in URL
      if (params.pageSize && params.pageSize !== 10) {
        newParams.set("pageSize", String(params.pageSize));
      }
      // Keep non-default page in URL
      if (params.page && params.page !== 1) {
        newParams.set("page", String(params.page));
      }
      const query = newParams.toString();
      router.replace(`/songs${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router],
  );

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await songsApi.list({
        search: debouncedSearch || undefined,
        published: published !== "all" ? published : undefined,
        sourceType: sourceType !== "all" ? sourceType : undefined,
        page,
        pageSize,
      });
      setSongs(result.data);
      setMeta(result.meta);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load songs",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, published, sourceType, page, pageSize]);

  // Fetch when params change
  useEffect(() => {
    fetchSongs();
    updateUrl({
      search: debouncedSearch,
      published,
      sourceType,
      page,
      pageSize,
    });
  }, [
    fetchSongs,
    updateUrl,
    debouncedSearch,
    published,
    sourceType,
    page,
    pageSize,
  ]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, published, sourceType]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Songs</h1>
          <p className="text-muted-foreground">Manage your music collection</p>
        </div>
        <Button onClick={() => router.push("/songs/new")}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Song
        </Button>
      </div>

      <SongsToolbar
        search={search}
        onSearchChange={setSearch}
        published={published}
        onPublishedChange={setPublished}
        sourceType={sourceType}
        onSourceTypeChange={setSourceType}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <SongsTable songs={songs} onRefresh={fetchSongs} />
          {meta.total > 0 && (
            <PaginationControls
              meta={meta}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
