"use client";

import { STATUS_ACT, STATUS_DISABLED, StatusEnum } from "@/meta";

import { Label } from "@/sdui/ui/label";
import { Switch } from "@/sdui/ui/switch";
import { useId, useState, useTransition } from "react";

interface StatusCellProps {
  value: StatusEnum;
  onCheckedChange?: (status: StatusEnum) => Promise<boolean>;
}

export default function StatusCell({
  value,
  onCheckedChange,
}: StatusCellProps) {
  const id = useId();
  const [ctrlVal, setCtrlVal] = useState(value);
  const [isPending, startTransition] = useTransition();

  const isChecked = ctrlVal === STATUS_ACT;

  function handleCheckedChange(checked: boolean) {
    const newVal = checked ? STATUS_ACT : STATUS_DISABLED;

    if (onCheckedChange) {
      startTransition(async () => {
        const isSuccess = await onCheckedChange(newVal);
        if (isSuccess) {
          setCtrlVal(newVal);
        }
      });
    } else {
      setCtrlVal(newVal);
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Label className="w-16" htmlFor={`status-cell-${id}`}>
        {value}
      </Label>
      <Switch
        id={`status-cell-${id}`}
        checked={isChecked}
        disabled={isPending}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  );
}
