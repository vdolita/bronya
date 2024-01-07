import { Button } from "@/sdui/ui/button";
import { CopyIcon } from "@radix-ui/react-icons";

const CopyTip = ({ value }: { value?: string | number }) => {
  // safe copy to clipboard
  function handleCopy() {
    if (value) {
      navigator.clipboard.writeText(value.toString());
    }
  }

  return (
    <Button
      className="h-fit w-fit p-0.5"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
    >
      <CopyIcon />
    </Button>
  );
};

export default CopyTip;
