"use client";

import { LCS_ACTIVE, LCS_DISABLED, License, LicenseStatus } from "@/schemas";
import { Label } from "@/sdui/ui/label";
import { Switch } from "@/sdui/ui/switch";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useEffect, useState, useTransition } from "react";

const StatusCol: ColumnDef<License> = {
  accessorKey: "status",
  header: "Status",
  cell: (props) => <StatusCell {...props} />,
};

const StatusCell = ({
  getValue,
  row,
  table,
  column: { id },
}: CellContext<License, unknown>) => {
  const initialValue = getValue<LicenseStatus>();
  const index = row.index;

  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  const checked = value === LCS_ACTIVE;

  function toggleStatus(checked: boolean) {
    const newVal = checked ? LCS_ACTIVE : LCS_DISABLED;
    const onRowChange = table.options.meta?.onRowChange;

    if (onRowChange) {
      startTransition(async () => {
        const isSuccess = await onRowChange(index, { [id]: newVal });
        if (isSuccess) {
          setValue(newVal);
        }
      });
    }
  }

  useEffect(() => {
    if (initialValue != value) {
      setValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  return (
    <div className="flex items-center space-x-2">
      <Label className="w-16" htmlFor={`lcs-status-cell${index}`}>
        {value}
      </Label>
      <Switch
        id={`lcs-status-cell${index}`}
        checked={checked}
        disabled={isPending}
        onCheckedChange={toggleStatus}
      />
    </div>
  );
};

export default StatusCol;
