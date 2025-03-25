import { EmailData } from "@/action/gmail/fetch-mails";
import { formatDateTime } from "@/utils/format-date";
import React from "react";

const Card = ({
  content,
  sender,
  subject,
  timestamp,
  attachments,
}: EmailData) => {
  return (
    <div className="flex flex-col w-full h-fit p-2 dark:hover:bg-[#353739] hover:bg-gray-300 rounded-md gap-1 text-sm">
      <div className="flex w-full gap-2">
        <div className="size-10 rounded-full border flex items-center justify-center">
          SD
        </div>
        <div className="">
          <p className="">
            {sender} {formatDateTime(timestamp)}
          </p>
          <p className="text-xs">{subject}</p>
        </div>
      </div>
      <div className="size-full">
        <p className="whitespace-normal break-words">{content}</p>
      </div>
      <div>
        {attachments.map(({ filename, attachmentId }) => {
          return <div key={attachmentId}>{filename}</div>;
        })}
      </div>
    </div>
  );
};

export default Card;
