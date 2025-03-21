import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/db/config";
import { signIn } from "next-auth/react";

export const POST = async (req: NextRequest) => {
  try {
    const reqBody = await req.json();
    const { email, password } = reqBody;
    await connectToDb();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please enter all fields" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User does not exists" },
        { status: 400 }
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      );
    }

    await signIn("credentials", { email, password, redirect: false });

    return NextResponse.json({ message: "Logged in!" }, { status: 200 });
  } catch (error) {
    console.error("login failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
