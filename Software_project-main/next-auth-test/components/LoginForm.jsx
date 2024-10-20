"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Login.module.css'; // Import the CSS module for styling

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid Credentials");
                return;
            }
            
            router.replace("/dashboard");

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.overlay}>
                <div className={styles.formContainer}>
                    <h1>Login Details</h1>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            placeholder="Email"
                            className="p-2 border rounded"
                        />
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            placeholder="Password"
                            className="p-2 border rounded"
                        />
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Login</button>
                        {error && <div className="text-red-500">{error}</div>}
                        <Link href='/register'>
                            No account? <span className="text-blue-500">Register</span>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
