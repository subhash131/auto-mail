"use client";
import Link from "next/link";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import InputField from "./input-field";
import { signIn } from "next-auth/react";

const AuthForm = ({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) => {
  return (
    <div className="max-w-md bg-white shadow-lg rounded-2xl p-6 border text-center text-sm w-96">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">{heading}</h1>
      <p className="text-gray-600 mb-4">{subheading}</p>

      <button
        className="w-full flex items-center justify-center bg-white border rounded-lg py-1 px-4 shadow-sm hover:bg-gray-100 text-gray-700 cursor-pointer active:scale-95 transition-transform"
        onClick={() => signIn("google")}
      >
        <FcGoogle className="mr-2 text-xl" /> Continue with Google
      </button>

      <div className="flex items-center my-4">
        <div className="flex-1 border-t"></div>
        <p className="px-4 text-gray-500 text-sm">or</p>
        <div className="flex-1 border-t"></div>
      </div>

      <form
        //   onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 text-left"
      >
        <InputField
          label="Email Address"
          type="email"
          //   error={errors.email?.message}
          //   register={login("email")}
        />
        {/* <Field
          label="Email Address"
          type="email"
          error={errors.email?.message}
          register={login("email")}
        />
        <Field
          label="Password"
          type="password"
          error={errors.password?.message}
          register={login("password")}
        />
        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center active:scale-95 transition-transform disabled:bg-gray-800"
          disabled={isPending}
        >
          {isPending ? (
            <ImSpinner className="animate-spin h-5 w-5 mr-2" />
          ) : (
            "Continue"
          )}
        </button> */}
      </form>

      <p className="text-gray-600 mt-4 text-sm">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-blue-600 font-semibold">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
