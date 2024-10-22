"use client";

import "../style.css"
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import Image from 'next/image'; // Add this import

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      const session = await fetch('/api/auth/session').then(res => res.json());
      console.log("session", session);
      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else if (session?.user?.role === "driver") {
        router.push("/driver-map");
      } else if (session?.user?.role === "owner") {
        router.push("/owner-dashboard");
      } else if (session?.user?.role === "pending") {
        router.push("/waiting");
      } else {
        router.push("/unauthorized");
      }
    }
  };

  const handleSignupClick = () => {
    router.push('/signup');
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <Card style={{padding:"10px" , width:"400px" }} color="transparent" shadow={true}>
        <div className='flex items-center justify-center'>
          <Image src='/logowh.jpg' alt="Logo" width={70} height={70} style={{ marginBottom: "5px" }} /> {/* Use Image */}
        </div>
        
        <Typography variant="h3" color="blue-gray" className='flex items-center justify-center mb-8'>
          Login
        </Typography>
        <Typography color="gray" className="flex items-center justify-center mt-5 font-normal">
          Welcome to PaintRouteX!
        </Typography>
        <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Your Email
            </Typography>
            <Input
              size="sm"
              placeholder="name@mail.com"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={e => setEmail(e.target.value)}
            />
            <Typography variant="h6" color="blue-gray" className="-mb-3">
              Password
            </Typography>
            <Input
              type="password"
              size="sm"
              placeholder="********"
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  Remember me
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </div>
          {error && (
            <Typography color="red" className="mt-2 text-center">
              {error}
            </Typography>
          )}
          <Button type="submit" className="mt-6" fullWidth>
            Login
          </Button>
          <Typography color="gray" className="mt-4 text-center font-normal">
            Don&apos;t have an account? {/* Move comment inside braces */}
            <a href="#" onClick={handleSignupClick} className="font-medium text-gray-900">
              Sign Up
            </a>
          </Typography>
        </form>
      </Card>
    </div>
  );
}

export default LoginForm;
