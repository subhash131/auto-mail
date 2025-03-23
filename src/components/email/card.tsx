import { EmailData } from "@/action/gmail/fetch-mails";
import React from "react";

const Card = ({ content, sender, subject, timestamp }: EmailData) => {
  return (
    <div className="flex flex-col w-full h-fit p-2 dark:hover:bg-[#353739] hover:bg-gray-300 rounded-md gap-1 text-sm">
      <div className="flex w-full gap-2">
        <div className="size-10 rounded-full border flex items-center justify-center">
          SD
        </div>
        <div className="">
          <p className="">{sender}</p>
          <p className="text-xs">{subject}</p>
        </div>
      </div>
      <div className="size-full">
        <p className="text-wrap">{content}</p>
      </div>
      <div>attachments</div>
    </div>
  );
};

export default Card;
