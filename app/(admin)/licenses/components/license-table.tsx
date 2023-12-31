"use client";

import { fetchLicenses, updateLicense } from "@/app/_fetcher/license";
import AppSelect from "@/components/app-select";
import CreateAppDialog from "@/components/create-app-dialog";
import CreateLicenseDialog from "@/components/create-lcs-dialog";
import { DataTable } from "@/components/data-table";
import DatePicker from "@/components/date-picker";
import { License } from "@/schemas";
import { Label } from "@/sdui/ui/label";
import { SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import columns from "./columns";

const PAGE_SIZE = 10;

export default function LicenseTable() {
  const [app, setApp] = useState<string | undefined>();
  const [createdAt, setCreatedAt] = useState<Date | undefined>();
  const [sortingState, setSortingState] = useState<SortingState>([
    {
      id: "createdAt",
      desc: false,
    },
  ]);

  const getKey = (
    _: number,
    preData: Awaited<ReturnType<typeof fetchLicenses>> | undefined
  ) => {
    if (!app) return null;
    if (preData && !preData.lastOffset) return null;

    const url = new URL("/api/admin/license", window?.location.origin);
    url.searchParams.set("app", app);
    url.searchParams.set("pageSize", PAGE_SIZE.toString());

    if (createdAt) url.searchParams.set("createdAt", createdAt.toISOString());
    if (preData?.lastOffset) {
      url.searchParams.set("lastOffset", preData.lastOffset.toString());
    }

    // sorting
    const createdAtSort = sortingState.find((item) => item.id === "createdAt");
    if (createdAtSort) {
      url.searchParams.set(
        "createdAtSort",
        createdAtSort.desc ? "desc" : "asc"
      );
    }

    return url.toString();
  };

  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    getKey,
    fetchLicenses
  );
  const licenses = useMemo(
    () => data?.flatMap((d) => d.licenses) ?? [],
    [data]
  );
  const hadMore = useMemo(
    () => data && data.length > 0 && data[data.length - 1].lastOffset != null,
    [data]
  );

  const handleLoadMore = useCallback(() => {
    setSize((size) => size + 1);
  }, [setSize]);

  const handleRowChange = useCallback(
    async (index: number, row: Partial<License>) => {
      const target = licenses[index];
      return updateLicense(target.key, row);
    },
    [licenses]
  );

  // refresh when license created
  const handleLcsCreated = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between flex-none">
        <div className="flex space-x-6 flex-none">
          <div className="flex items-center space-x-2">
            <Label>App:</Label>
            <AppSelect value={app} onChange={setApp} />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Created From:</Label>
            <DatePicker value={createdAt} onChange={setCreatedAt} />
          </div>
        </div>
        <div className="flex space-x-8">
          <CreateLicenseDialog onCreated={handleLcsCreated} />
          <CreateAppDialog />
        </div>
      </div>
      <div className="grow">
        <DataTable
          data={licenses}
          columns={columns}
          loadMore={handleLoadMore}
          hadMore={hadMore}
          onRowChange={handleRowChange}
          loading={isLoading}
          sorting={sortingState}
          onSortingChange={setSortingState}
        />
      </div>
    </div>
  );
}
