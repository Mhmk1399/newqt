import AboutUs from "@/components/static/aboutUs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "درباره ما",
  description: "درباره ما",
};
const About = () => {
  return (
    <section className="flex flex-col">
      <AboutUs />
    </section>
  );
};

export default About;
