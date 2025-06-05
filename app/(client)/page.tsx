import HomeBanner from "@/app/(client)/_components/Home/Banner";
import CustomersSay from "@/app/(client)/_components/Home/CustomersSay";
import Frequently from "@/app/(client)/_components/Home/Frequently";
import HowToBook from "@/app/(client)/_components/Home/HowToBook";
import LineStyle from "@/app/(client)/_components/Home/LineStyle";
import ReadytoBook from "@/app/(client)/_components/Home/ReadytoBook ";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <HomeBanner />
      <HowToBook />
      <ReadytoBook />
      <CustomersSay />
      <LineStyle />
      <Frequently />
    </div>
  );
}
