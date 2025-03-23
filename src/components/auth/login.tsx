"use client";
import React from "react";
import AuthForm from "./ui/form";
import InputField from "./ui/input-field";
import { SubmitHandler, useForm } from "react-hook-form";
import { loginSchema } from "./schema/login";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitButton from "./ui/submit-button";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const {
    formState: { errors, isLoading },
    register: login,
    handleSubmit,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/email/unread");
      }
      if (res?.error) {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center w-full bg-white text-black">
      <AuthForm
        heading="Signin to Automail"
        subheading="welcome back! Please sign in to continue"
        onSubmit={onSubmit}
        handleSubmit={handleSubmit}
        footer={{
          text: "Don't have an account? ",
          link: "/auth/register",
          linkText: "Signup",
        }}
      >
        <InputField
          label="Email Address"
          type="email"
          error={errors.email?.message}
          register={login("email")}
        />
        <InputField
          label="Password"
          type="password"
          error={errors.password?.message}
          register={login("password")}
        />
        <SubmitButton isLoading={isLoading} />
      </AuthForm>
    </div>
  );
};

export default Login;
