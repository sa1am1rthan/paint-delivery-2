"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";


export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("pending"); // Default role
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!name || !email || !password) {
      setError("All fields are necessary.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "pending",
        }),
      });

      if (res.ok) {
        const form = e.target as HTMLFormElement;
        form.reset();
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "User registration failed.");
      }
    } catch (error) {
      console.error("Error during registration: ", error);
      setError("An error occurred during registration.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card style={{ padding: "10px", width: "400px" }} color="transparent" shadow={true}>
        <div className="flex items-center justify-center">
          <img src="logowh.jpg" style={{ width: "70px", marginBottom: "5px" }} alt="Logo" />
        </div>
        <Typography variant="h3" color="blue-gray" className="flex items-center justify-center mb-8">
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Name
            </Typography>
            <Input
              size="sm"
              placeholder="John Doe"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e) => setName(e.target.value)}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Email
            </Typography>
            <Input
              size="sm"
              placeholder="name@mail.com"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && (
              <Typography color="red" className="text-xs">
                {emailError}
              </Typography>
            )}
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Password
            </Typography>
            <Input
              type="password"
              size="sm"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* <Typography variant="h6" color="blue-gray" className="-mb-3">
              Role
            </Typography> */}
            {/* <Select label="Select Role" value={role} onChange={(value) => setRole(value || "driver")}>
              <Option value="driver">Driver</Option>
              <Option value="admin">Admin</Option>
            </Select> */}
          </div>
          {error && (
            <Typography color="red" className="mt-2 text-center">
              {error}
            </Typography>
          )}
          <Button type="submit" className="mt-6" fullWidth>
            Sign Up
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-gray-900">
              Sign In
            </Link>
          </Typography>
        </form>
      </Card>
    </div>
  );
}