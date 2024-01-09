"use client";

import { License, Remarks, remarks } from "@/schemas";
import { Button } from "@/sdui/ui/button";
import { Textarea } from "@/sdui/ui/textarea";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ChangeEvent, useEffect, useState, useTransition } from "react";

const RemarkCol: ColumnDef<License> = {
  accessorKey: "remarks",
  header: "Remarks",
  cell: (props) => <RemarkCell {...props} />,
};

const RemarkCell = ({
  getValue,
  table,
  row,
  column: { id },
}: CellContext<License, unknown>) => {
  const initialValue = getValue<Remarks>();
  const index = row.index;

  const [value, setValue] = useState(initialValue);
  const [showSave, setShowSave] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const newVal = event.target.value;
    const safeVal = remarks.safeParse(newVal);

    if (!safeVal.success) {
      return;
    }

    setValue(newVal);

    if (newVal != initialValue) {
      setShowSave(true);
    } else {
      setShowSave(false);
    }
  }

  async function saveRemark() {
    const onRowChange = table.options.meta?.onRowChange;

    if (onRowChange) {
      startTransition(async () => {
        const isSuccess = await onRowChange(index, { [id]: value });
        if (isSuccess) {
          setShowSave(false);
        }
      });
    }
  }

  useEffect(() => {
    if (!showSave) {
      setValue(initialValue);
    }
  }, [initialValue, showSave]);

  return (
    <div className="flex flex-col space-y-2 items-end">
      <Textarea value={value} onChange={handleChange} />
      {showSave && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={saveRemark}
        >
          save
        </Button>
      )}
    </div>
  );
};

export default RemarkCol;
