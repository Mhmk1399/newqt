import MainContainer from "@/components/static/mainPageContainer";
import SmoothScrollProvider from "@/components/static/smoothScrollProvider.tsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "خانه",
  description: "خانه",
};
const Home = () => {
  return (
    <>
      <section>
        <MainContainer />
        <SmoothScrollProvider />
      </section>
    </>
  );
};
export default Home;
