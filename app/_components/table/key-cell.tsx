import CopyTip from "../../../components/copy"

export default function KeyCell({ value }: { value: string }) {
  return (
    <div className="flex items-center space-x-1">
      <span>{value}</span>
      <div>
        <CopyTip value={value} />
      </div>
    </div>
  )
}
