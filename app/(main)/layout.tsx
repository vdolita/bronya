import BronyaBackground from "../components/bronya-bg";
import Header from "../components/header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <BronyaBackground />
      <div className="flex flex-col h-full w-full space-y-4">
        <div className="flex-none">
          <Header />
        </div>
        <div className="grow p-4 bg-white">{children}</div>
      </div>
    </>
  );
};

export default MainLayout;
