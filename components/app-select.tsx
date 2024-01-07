"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/sdui/ui/select";
import { useControllableValue } from "ahooks";
import useSwr from "swr";
import { fetchApp } from "../app/fetcher/app";

export interface AppSelectProps {
  value?: string;
  onChange?: (app: string) => void;
}

const AppSelect = (props: AppSelectProps) => {
  const [val, setVal] = useControllableValue(props);
  const { data: apps, isLoading } = useSwr("/api/admin/app", fetchApp);

  return (
    <Select onValueChange={setVal} value={val}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={isLoading ? "Loading" : "Select an App"} />
      </SelectTrigger>
      <SelectContent>
        {apps?.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AppSelect;
