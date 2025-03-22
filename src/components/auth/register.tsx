"use client";
import React from "react";
import AuthForm from "./ui/form";
import InputField from "./ui/input-field";
import SubmitButton from "./ui/submit-button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "./schema/register";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type RegisterFormData = {
  email: string;
  password: string;
  name?: string;
};

const Register = () => {
  const {
    formState: { errors, isLoading },
    register,
    handleSubmit,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const router = useRouter();

  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/auth/login");
      }
      toast.info(JSON.stringify(await res.json()));
    } catch (error) {
      toast.error(JSON.stringify(error));
    }
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
        <SubmitButton isLoading={isLoading} />
      </AuthForm>
    </div>
  );
};

export default Register;
