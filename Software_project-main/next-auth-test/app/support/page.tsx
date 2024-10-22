'use client';

import React from "react";
import Image from 'next/image';
import Header from "../Header";
import { useRouter } from "next/navigation";
import Footer from "../Footer";

const Support: React.FC = () => {
    const router = useRouter();

    const handleLoginClick = () => {
      router.push('/login');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header onLoginClick={handleLoginClick} />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Support</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                        <p className="mb-4">
                            If you need assistance, please don&apos;t hesitate to reach out to our support team.
                        </p>
                        <ul className="list-disc list-inside">
                            <li>Email: support@paintroutex.com</li>
                            <li>Phone: +1 (123) 456-7890</li>
                            <li>Hours: Monday - Friday, 9am - 5pm EST</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
                        <ul className="list-disc list-inside">
                            <li>How do I reset my password?</li>
                            <li>Can I change my subscription plan?</li>
                            <li>How do I update my billing information?</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8">
                    <Image
                        src="/support-image.jpg"
                        alt="Support Team"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-md"
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default Support;
