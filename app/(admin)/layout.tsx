import Header from "../../components/header"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="flex flex-col h-full w-full">
        <div className="flex-none">
          <Header />
        </div>
        <div className="grow p-4 bg-white">{children}</div>
      </div>
    </>
  )
}
