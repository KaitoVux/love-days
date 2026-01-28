"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface SongsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  published: string;
  onPublishedChange: (value: string) => void;
  sourceType: string;
  onSourceTypeChange: (value: string) => void;
}

export function SongsToolbar({
  search,
  onSearchChange,
  published,
  onPublishedChange,
  sourceType,
  onSourceTypeChange,
}: SongsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or artist..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Published filter */}
      <Select value={published} onValueChange={onPublishedChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="true">Published</SelectItem>
          <SelectItem value="false">Unpublished</SelectItem>
        </SelectContent>
      </Select>

      {/* Source type filter */}
      <Select value={sourceType} onValueChange={onSourceTypeChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="youtube">YouTube</SelectItem>
          <SelectItem value="upload">Upload</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
