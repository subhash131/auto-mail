import React from "react";
import AuthForm from "./ui/form";

const Login = () => {
  return (
    <div className="h-screen flex items-center justify-center w-full bg-white text-black">
      <AuthForm
        heading="Signin to Automail"
        subheading="welcome back! Please sign in to continue"
      />
    </div>
  );
};

export default Login;
