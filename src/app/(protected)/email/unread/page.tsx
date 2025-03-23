import React from "react";
import dynamic from "next/dynamic";

const Email = dynamic(() => import("@/components/email"));

const UnreadPage = () => {
  return <Email />;
};

export default UnreadPage;
