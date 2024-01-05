import { ROLlING_BIT } from "@/meta/license-flag";
import { License } from "@/schemas";
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";

const FlagCol: ColumnDef<License> = {
  accessorKey: "bitFlags",
  header: "Flags",
  cell: ({ row }) => {
    const val = row.getValue<number>("bitFlags");
    const isRolling = val & ROLlING_BIT ? true : false;

    return (
      <div className="flex flex-row">
        <div className="flex justify-center items-center space-x-1">
          <span className="text-sm text-gray-500">Rolling:</span>
          {isRolling ? (
            <CheckIcon className="w-5 h-5 text-green-500" />
          ) : (
            <Cross2Icon className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>
    );
  },
};

export default FlagCol;
