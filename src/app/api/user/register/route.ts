import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/db/config";

export const POST = async (req: NextRequest) => {
  try {
    const reqBody = await req.json();
    const { username, email, password } = reqBody;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Please enter all fields" },
        { status: 400 }
      );
    }

    await connectToDb();

    const user = await User.findOne({ email });

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    await savedUser.save();

    return NextResponse.json(
      {
        message: "New user created!",
        user: {
          id: savedUser._id,
          username: savedUser.name,
          email: savedUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
