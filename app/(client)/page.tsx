import HomeBanner from "./_components/Home/Banner";
import HowToBook from "./_components/Home/HowToBook";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <HomeBanner />
      <HowToBook />
    </div>
  );
}
