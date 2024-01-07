"use client";

import AppSelect from "@/app/components/app-select";
import CreateAppDialog from "@/app/components/create-app-dialog";
import CreateLicenseDialog from "@/app/components/create-lcs-dialog";
import DatePicker from "@/app/components/date-picker";
import { License, licenseSchema } from "@/schemas";
import { Label } from "@/sdui/ui/label";
import { SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { DataTable } from "./data-table";

const PAGE_SIZE = 10;

const LicenseTable = () => {
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
    if (preData && !preData.lastKey) return null;

    const url = new URL("/api/admin/license", window?.location.origin);
    url.searchParams.set("app", app);
    url.searchParams.set("pageSize", PAGE_SIZE.toString());

    if (createdAt) url.searchParams.set("createdAt", createdAt.toISOString());
    if (preData?.lastKey) url.searchParams.set("lastKey", preData.lastKey);

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
    fetchLicenses,
    {
      fallbackData: [],
    }
  );
  const licenses = useMemo(
    () => data?.flatMap((d) => d.licenses) ?? [],
    [data]
  );
  const hadMore = useMemo(
    () => data && data.length > 0 && data[data.length - 1].lastKey != null,
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
          loadMore={handleLoadMore}
          hadMore={hadMore}
          onRowChange={handleRowChange}
          loading={isLoading}
          sorting={sortingState}
          onSortingChange={setSortingState}
        />
        {/* <AgTable data={licenses} /> */}
      </div>
    </div>
  );
};

async function fetchLicenses(url: string) {
  const response = await fetch(url);
  const resData = await response.json();

  let resLastKey: string | null = null;
  let licenses: License[] = [];

  if (resData.success) {
    resLastKey = resData.lastKey ?? null;

    for (const item of resData.data) {
      const lcs = licenseSchema.parse(item);
      licenses.push(lcs);
    }
  }

  return { licenses: licenses, lastKey: resLastKey };
}

async function updateLicense(
  key: string,
  license: Partial<Pick<License, "status" | "remarks" | "labels">>
) {
  const response = await fetch("/api/admin/license", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      ...license,
    }),
  });
  const res = await response.json();
  return !!res?.success;
}

export default LicenseTable;
