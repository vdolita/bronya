"use client";

import { LCS_ACTIVE, LCS_DISABLED, License, LicenseStatus } from "@/schemas";
import { Label } from "@/sdui/ui/label";
import { Switch } from "@/sdui/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const StatusCol: ColumnDef<License> = {
  accessorKey: "status",
  header: "Status",
  cell: ({ getValue, row, table, column: { id } }) => {
    const initialValue = getValue<LicenseStatus>();
    const index = row.index;

    const [value, setValue] = useState(initialValue);
    const checked = value === LCS_ACTIVE;

    function toggleStatus(checked: boolean) {
      const newVal = checked ? LCS_ACTIVE : LCS_DISABLED;
      setValue(newVal);

      const onRowChange = table.options.meta?.onRowChange;

      if (onRowChange) {
        onRowChange(index, { [id]: newVal });
      }
    }

    useEffect(() => {
      if (initialValue != value) {
        setValue(initialValue);
      }
    }, [initialValue]);

    return (
      <div className="flex items-center space-x-2">
        <Label className="w-16" htmlFor={`lcs-status-cell${index}`}>
          {value}
        </Label>
        <Switch
          id={`lcs-status-cell${index}`}
          checked={checked}
          onCheckedChange={toggleStatus}
        />
      </div>
    );
  },
};

export default StatusCol;
