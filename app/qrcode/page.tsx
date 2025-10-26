import QRCodeGenerator from "@/components/QRCodeGenerator";
import React from "react";

const page = () => {
  return (
    <div className="bg-[#030014]">
      <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      <QRCodeGenerator />
    </div>
  );
};

export default page;
