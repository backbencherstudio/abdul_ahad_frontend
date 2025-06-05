import HomeBanner from "./_components/Home/Banner";
import CustomersSay from "./_components/Home/CustomersSay";
import Frequently from "./_components/Home/Frequently";
import HowToBook from "./_components/Home/HowToBook";
import LineStyle from "./_components/Home/LineStyle";
import ReadytoBook from "./_components/Home/ReadytoBook ";

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
