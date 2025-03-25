"use client";
import { EmailData, fetchEmails } from "@/action/gmail/fetch-mails";
import React, { useEffect, useState } from "react";
import Card from "./card";

const Email = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);

  const fetchData = async () => {
    const res = await fetchEmails();
    setEmails(res);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full h-screen text-background dark:text-foreground overflow-y-scroll text-wrap p-2">
      {emails?.map((email) => (
        <Card {...email} key={email.id} />
      ))}

      <button onClick={fetchData}>Fetch Data</button>
    </div>
  );
};

export default Email;
