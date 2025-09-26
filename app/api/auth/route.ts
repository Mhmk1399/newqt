import { NextRequest, NextResponse } from "next/server";
import User from "@/models/users";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connect from "@/lib/data";
import costumer from "@/models/customersData/customers";
import CoWorker from "@/models/coWorker";

// POST - User login/signup
export async function POST(request: NextRequest) {
  try {
    await connect();
    const body = await request.json();

    const { action, phoneNumber, password, name, userType } = body;

    // Validate required fields
    if (!action || !phoneNumber || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "action, phoneNumber and password are required",
        },
        { status: 400 }
      );
    }

    if (action === "signup") {
      // Signup logic
      if (!name || !userType) {
        return NextResponse.json(
          {
            success: false,
            error: "name and userType are required for signup",
          },
          { status: 400 }
        );
      }

      // Check if user already exists in any model
      const existingUser = await User.findOne({ phoneNumber });
      const existingCustomer = await costumer.findOne({ phoneNumber });
      const existingCoWorker = await CoWorker.findOne({ phoneNumber });

      if (existingUser || existingCustomer || existingCoWorker) {
        return NextResponse.json(
          {
            success: false,
            error: "User already exists",
          },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in appropriate model (only customer or coworker allowed for signup)
      let newUser;
      if (userType === "customer") {
        newUser = new costumer({
          name,
          phoneNumber,
          password: hashedPassword,
        });
      } else if (userType === "coworker") {
        newUser = new CoWorker({
          name,
          phoneNumber,
          password: hashedPassword,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid userType. Only customer or coworker allowed for signup",
          },
          { status: 400 }
        );
      }

      await newUser.save();

      // Generate JWT token
      const tokenPayload: any = {
        userId: newUser._id,
        phoneNumber: newUser.phoneNumber,
        name: newUser.name,
        userType,
      };

      // Note: User model signup not allowed here, role field not applicable

      const userToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Signup successful",
          data: {
            userToken,
            userType,
          },
        },
        { status: 201 }
      );
    } else if (action === "login") {
      // Login logic

      // Check all three models for the phone number
      const user = await User.findOne({ phoneNumber });
      const customer = await costumer.findOne({ phoneNumber });
      const coWorker = await CoWorker.findOne({ phoneNumber });

      let foundUser = null;
      let foundUserType = null;

      if (user) {
        foundUser = user;
        foundUserType = "user";
      } else if (customer) {
        foundUser = customer;
        foundUserType = "customer";
      } else if (coWorker) {
        foundUser = coWorker;
        foundUserType = "coworker";
      }

      if (!foundUser) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials sign up please",
          },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid credentials",
          },
          { status: 401 }
        );
      }

      // Generate JWT token
      const tokenPayload: any = {
        userId: foundUser._id,
        phoneNumber: foundUser.phoneNumber,
        name: foundUser.name,
        userType: foundUserType,
      };

      // Add role field for User model users
      if (foundUserType === "user" && foundUser.role) {
        tokenPayload.role = foundUser.role;
      }

      const userToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      return NextResponse.json(
        {
          success: true,
          message: "Login successful",
          data: {
            userToken,
            userType: foundUserType,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'login' or 'signup'",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
