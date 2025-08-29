import type { Metadata } from "next";
import ContactContainer from "@/components/static/contactContainer";

export const metadata: Metadata = {
  title: "ارتباط با ما",
  description: "ارتباط با ما",
};
const ContactPage = () => {
  return (
    <section>
      <ContactContainer />
    </section>
  );
};

export default ContactPage;
