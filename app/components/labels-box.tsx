"use client";

import { licenseLabel } from "@/schemas";
import { Button } from "@/sdui/ui/button";
import { Input } from "@/sdui/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/sdui/ui/popover";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { useCallback, useState } from "react";

interface LabelsBoxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: Set<string>;
  onChange?: (labels: Set<string>) => void;
}

const LabelsBox = ({ value, onChange, ...props }: LabelsBoxProps) => {
  const [newLabel, setNewLabel] = useState("");
  const labels = Array.from(value);

  function handleDelete(label: string) {
    const newLabels = new Set(labels);
    newLabels.delete(label);
    onChange?.(newLabels);
  }

  function handleNewLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    if (val == "") {
      setNewLabel("");
      return;
    }

    const safeData = licenseLabel.safeParse(val);

    if (safeData.success) {
      setNewLabel(safeData.data);
    }
  }

  const handleAdd = useCallback(() => {
    value.add(newLabel);
    onChange?.(value);
  }, [value, newLabel, onChange]);

  return (
    <div {...props}>
      <ul className="flex gap-2 flex-wrap">
        {labels.map((label) => (
          <li key={label}>
            <LabelBadge label={label} onDelete={handleDelete} />
          </li>
        ))}
        <li>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="rounded-full w-4 h-4"
                variant="outline"
                size="icon"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit">
              <div className="flex items-center space-x-2">
                <Input
                  value={newLabel}
                  onChange={handleNewLabelChange}
                  className="text-xs w-32 h-6 rounded-sm"
                  placeholder=""
                />
                <Button
                  onClick={handleAdd}
                  className="text-xs h-6"
                  type="submit"
                >
                  Add
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </li>
      </ul>
    </div>
  );
};

const LabelBadge = ({
  label,
  onDelete,
}: {
  label: string;
  onDelete: (lb: string) => void;
}) => {
  function handleClick() {
    onDelete(label);
  }

  return (
    <div className="flex flex-row space-x-1 bg-slate-100 rounded-sm border divide-x">
      <span className="text-xs pl-1">{label}</span>
      <span
        className="text-xs cursor-pointer hover:bg-slate-200"
        onClick={handleClick}
      >
        <Cross2Icon />
      </span>
    </div>
  );
};

export default LabelsBox;
