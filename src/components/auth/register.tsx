"use client";
import React from "react";
import AuthForm from "./ui/form";
import InputField from "./ui/input-field";
import SubmitButton from "./ui/submit-button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "./schema/register";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/action/user/register";

export type RegisterFormData = {
  email: string;
  password: string;
  name?: string;
};

const Register = () => {
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (!data.error) {
        toast.success(data.message);
        toast.success("Please check your email to verify your account.");
        router.push("/auth/login");
      } else {
        toast.error(data.error);
      }
    },
    onError: () => {
      toast.error("Failed to create account. Please try again.");
    },
  });

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    mutate(data);
  };

  return (
    <div className="h-screen flex items-center justify-center w-full bg-white text-black">
      <AuthForm
        heading="Signup with Automail"
        subheading="welcome! Please sign up to continue"
        onSubmit={onSubmit}
        handleSubmit={handleSubmit}
        footer={{
          text: "Already have an account? ",
          link: "/auth/login",
          linkText: "Login",
        }}
      >
        <InputField
          label="Email Address"
          type="email"
          error={errors.email?.message}
          register={register("email")}
        />
        <InputField
          label="Username"
          type="email"
          error={errors.name?.message}
          register={register("name")}
        />
        <InputField
          label="Password"
          type="password"
          error={errors.password?.message}
          register={register("password")}
        />
        <SubmitButton isLoading={isPending} />
      </AuthForm>
    </div>
  );
};

export default Register;
