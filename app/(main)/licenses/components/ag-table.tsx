import CopyTip from "@/app/components/copy";
import { License } from "@/schemas";
import { formatDateTime } from "@/utils/time";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import { useMemo } from "react";

const AgTable = ({ data }: { data: License[] }) => {
  const columnDefs = useMemo<ColDef<License>[]>(
    () => [
      { headerName: "Key", field: "key", cellRenderer: renUuidCell },
      { headerName: "App", field: "app" },
      { headerName: "Duration", field: "duration" },
      { headerName: "Total Act", field: "totalActCount" },
      { headerName: "Balance Act", field: "balanceActCount" },
      { headerName: "Status", field: "status" },
      {
        headerName: "Created At",
        field: "createdAt",
        valueFormatter: (params) => formatDateTime(params.value),
      },
      {
        headerName: "Valid From",
        field: "validFrom",
        valueFormatter: (params) => formatDateTime(params.value),
      },
      { headerName: "Remarks", field: "remarks" },
      // { headerName: "Labels", field: "labels" },
      { headerName: "Rolling Days", field: "rollingDays" },
    ],
    []
  );

  return (
    <div className="ag-theme-quartz h-full">
      <AgGridReact
        autoSizeStrategy={{ type: "fitCellContents", colIds: ["key"] }}
        columnDefs={columnDefs}
        rowData={data}
      />
    </div>
  );
};

function renUuidCell({ value }: { value: string }) {
  return (
    <div className="flex items-center justify-between space-x-1">
      <span className="shrink">{value}</span>
      <div className="shrink-0">
        <CopyTip value={value} />
      </div>
    </div>
  );
}

export default AgTable;
