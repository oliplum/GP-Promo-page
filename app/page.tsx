import Header from "./components/header";
import Title from "./components/title";
import ContentArea from "./components/content";
import Footer from "./components/footer";
import Info from "./components/info";

export default function Home() {
  return (
    <>
      <div className="left"></div>
      <div>
        <div className="shadow"></div>
      </div>
        <Header />
        <Title />
        <ContentArea />
        <Footer />
        <Info />
      <div className="right"></div>
    </>
  );
}
