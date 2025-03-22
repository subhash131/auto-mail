"use client";
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register?: UseFormRegisterReturn;
}

const InputField = ({ label, error, register, ...inputProps }: FieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...register}
        {...inputProps}
        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm py-1 px-3 border outline-none"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
