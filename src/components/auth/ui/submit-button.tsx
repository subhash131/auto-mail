"use client";
import React from "react";
import { ImSpinner } from "react-icons/im";

const SubmitButton = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <button
      type="submit"
      className="w-full bg-black text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center active:scale-95 transition-transform disabled:bg-gray-800 cursor-pointer"
      disabled={isLoading}
    >
      {isLoading ? (
        <ImSpinner className="animate-spin h-5 w-5 mr-2" />
      ) : (
        "Continue"
      )}
    </button>
  );
};

export default SubmitButton;
