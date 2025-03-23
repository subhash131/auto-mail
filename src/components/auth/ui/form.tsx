"use client";
import Link from "next/link";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { SubmitHandler, UseFormHandleSubmit } from "react-hook-form";
import { LoginFormData } from "../login";
import { RegisterFormData } from "../register";

const AuthForm = ({
  heading,
  subheading,
  children,
  onSubmit,
  handleSubmit,
  footer,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  onSubmit: SubmitHandler<LoginFormData | RegisterFormData>;
  handleSubmit: UseFormHandleSubmit<
    RegisterFormData | LoginFormData,
    undefined
  >;
  footer: {
    text: string;
    link: string;
    linkText: string;
  };
}) => {
  return (
    <div className="max-w-md bg-white shadow-lg rounded-2xl p-6 border text-center text-sm w-96 border-gray-200">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">{heading}</h1>
      <p className="text-gray-600 mb-4">{subheading}</p>

      <button
        className="w-full flex items-center justify-center bg-white border rounded-lg py-1 px-4 shadow-sm hover:bg-gray-100 text-gray-700 cursor-pointer active:scale-95 transition-transform border-gray-200"
        onClick={() => signIn("google")}
      >
        <FcGoogle className="mr-2 text-xl" /> Continue with Google
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t"></div>
        <p className="px-4 text-gray-500 text-sm">or</p>
        <div className="flex-1 border-t"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
        {children}
      </form>

      <p className="text-gray-600 mt-4 text-sm">
        {footer.text}
        <Link href={footer.link} className="text-blue-600 font-semibold">
          {footer.linkText}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
