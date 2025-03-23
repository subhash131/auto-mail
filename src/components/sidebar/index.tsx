"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React, { useLayoutEffect } from "react";
import { IoIosArrowDown, IoIosMail, IoIosSend } from "react-icons/io";
import { IoMailOpen, IoMailUnread } from "react-icons/io5";

const items = [
  {
    name: "Unread",
    route: "/email/unread",
    icon: IoMailUnread,
  },
  {
    name: "Read",
    route: "/email/read",
    icon: IoMailOpen,
  },
  {
    name: "Sent",
    route: "/email/sent",
    icon: IoIosSend,
  },
];

const Sidebar = () => {
  const toggleTheme = () => {
    const bodyClass = document.body.classList;
    if (bodyClass.contains("dark")) {
      bodyClass.remove("dark");
      window.localStorage.setItem("theme", "light");
    } else {
      bodyClass.add("dark");
      window.localStorage.setItem("theme", "dark");
    }
  };

  useLayoutEffect(() => {
    if (!window) return;
    const preTheme = window.localStorage.getItem("theme");
    if (preTheme === "dark") {
      const bodyClass = document.body.classList;
      bodyClass.add("dark");
    }
  }, []);

  return (
    <div className="w-60 text-black dark:text-white border-r p-2 h-full border-gray-300 dark:border-gray-600 text-sm">
      <div className="text-xl font-semibold px-2 flex items-center justify-between bg-[#4674FB] text-white py-1 rounded-md">
        <div className="flex items-center gap-1">
          <IoIosMail size={28} />
          Gmail
        </div>
        <div>
          <IoIosArrowDown size={28} />
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-6">
        {items.map(({ icon: Icon, name, route }) => {
          return (
            <Link
              href={route}
              key={name}
              className="flex items-center px-4 py-1.5 hover:bg-gray-300 rounded-md gap-2"
            >
              <Icon size={18} />
              {name}
            </Link>
          );
        })}
      </div>
      <div className="mt-52 w-full h-fit flex flex-col gap-1">
        <button
          onClick={toggleTheme}
          className="flex items-center px-4 py-1.5 hover:bg-gray-300 rounded-md h-fit dark:hover:bg-gray-800 cursor-pointer"
        >
          Switch theme
        </button>
        <button
          onClick={() => {
            signOut();
          }}
          className="flex items-center px-4 py-1.5 hover:bg-gray-300 rounded-md h-fit dark:hover:bg-gray-800 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
