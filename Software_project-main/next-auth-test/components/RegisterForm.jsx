'use client'

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation'


export default function RegisterForm() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            setError("All fields are necessary.");
            return;
        }

        try{

            const resUserExists = await fetch ('api/userExists', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            });

            const {user} = await resUserExists.json();

            if (user) {
                setError("User already exists.");
                return;
            }


            const res = await fetch('api/register', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name, email, password, role: "pending",
                }),
            });
            
            if (res.ok) {
                const form = e.target;
                form.reset();
                router.push("/");
            } else {
                setError("Registration Failed");
                console.error("Registration Failed", error);
            }

            if (res.ok) {
                const form = e.target;
                form.reset();
                router.push("/");
            }else {
                console.log("Registration Failed", error);
            };

        } catch (error) {}
    };

    return(
        <div>
            <h1>Registration Details</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input onChange={e => setName(e.target.value)} type="text" placeholder="Full Name"/>
                <input onChange={e => setEmail(e.target.value)} type="text" placeholder="Email"/>
                <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"/>

                <button>Register</button>

                <Link href='/'>already have an account<span>Register</span></Link>
                <div>{error}</div>

                

            </form>
        </div>
    )
}
