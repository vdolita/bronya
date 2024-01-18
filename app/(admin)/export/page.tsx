import ExportActivationRecord from "./components/activation-record"
import ExportLicense from "./components/license"

export default function ExportPage() {
  return (
    <div className="h-full">
      <div className="pt-48 flex justify-center items-center divide-x">
        <div className="pr-5">
          <ExportLicense />
        </div>
        <div className="pl-5">
          <ExportActivationRecord />
        </div>
      </div>
    </div>
  )
}
