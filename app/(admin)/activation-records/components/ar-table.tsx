"use client";

import { fetchActRecords } from "@/app/_fetcher/act-records";
import AppSelect from "@/components/app-select";
import { DataTable } from "@/components/data-table";
import DatePicker from "@/components/date-picker";
import { Label } from "@/sdui/ui/label";
import { SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import columns from "./columns";

const PAGE_SIZE = 20;

type ActExp = {
  activatedAt: Date | undefined;
  expireAt: Date | undefined;
};

export default function ActRecordsTable() {
  const [app, setApp] = useState<string | undefined>();
  const [actExpAt, setActExpAt] = useState<ActExp>({
    activatedAt: undefined,
    expireAt: undefined,
  });
  const [sortingState, setSortingState] = useState<SortingState>([
    {
      id: "activatedAt",
      desc: false,
    },
    {
      id: "expireAt",
      desc: false,
    },
  ]);

  const getKey = useCallback(
    (
      page: number,
      preData: Awaited<ReturnType<typeof fetchActRecords>> | undefined
    ) => {
      if (!app) return null;
      if (preData && !preData.lastOffset) return null;

      const url = new URL(
        "/api/admin/activation-records",
        window?.location.origin
      );
      url.searchParams.set("app", app);
      url.searchParams.set("pageSize", PAGE_SIZE.toString());
      if (preData?.lastOffset) {
        url.searchParams.set("offset", preData.lastOffset.toString());
      }

      if (actExpAt.activatedAt) {
        url.searchParams.set("activatedAt", actExpAt.activatedAt.toISOString());
      } else if (actExpAt.expireAt) {
        url.searchParams.set("expireAt", actExpAt.expireAt.toISOString());
      }

      // sorting
      const actAtSort = sortingState.find((item) => item.id === "activatedAt");
      const expAtSort = sortingState.find((item) => item.id === "expireAt");

      if (actAtSort) {
        url.searchParams.set("createdAtSort", actAtSort.desc ? "desc" : "asc");
      }

      if (expAtSort) {
        url.searchParams.set("createdAtSort", expAtSort.desc ? "desc" : "asc");
      }

      return url.toString();
    },
    [actExpAt, app, sortingState]
  );

  const { data, isLoading, setSize } = useSWRInfinite(getKey, fetchActRecords);

  const actRecords = useMemo(
    () => data?.flatMap((d) => d.actRecords) ?? [],
    [data]
  );

  const hadMore = useMemo(
    () => data && data.length > 0 && data[data.length - 1].lastOffset != null,
    [data]
  );

  const handleLoadMore = useCallback(() => {
    setSize((size) => size + 1);
  }, [setSize]);

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex justify-between flex-none">
        <div className="flex space-x-6 flex-none">
          <div className="flex items-center space-x-2">
            <Label>App:</Label>
            <AppSelect value={app} onChange={setApp} />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Activated From:</Label>
            <DatePicker
              value={actExpAt.activatedAt}
              onChange={(date) =>
                setActExpAt({ activatedAt: date, expireAt: undefined })
              }
            />
          </div>
          <div className="flex items-center space-x-2">
            <Label>Expire After:</Label>
            <DatePicker
              value={actExpAt.expireAt}
              onChange={(date) =>
                setActExpAt({ activatedAt: undefined, expireAt: date })
              }
            />
          </div>
        </div>
      </div>
      <div className="grow">
        <DataTable
          data={actRecords}
          columns={columns}
          loadMore={handleLoadMore}
          hadMore={hadMore}
          loading={isLoading}
          sorting={sortingState}
          onSortingChange={setSortingState}
        />
      </div>
    </div>
  );
}
