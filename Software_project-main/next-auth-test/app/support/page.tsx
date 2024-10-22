'use client';

import React from "react";
import Header from "../Header";
import { useRouter } from "next/navigation";
import Footer from "../Footer";
import Image from "next/image";

const Support: React.FC = () => {
    const router = useRouter();

    const handleLoginClick = () => {
      router.push('/login');
    };

    return (
        <>
            <Header onLoginClick={handleLoginClick} />

            <div style={{position: 'relative', top: '200px', paddingBottom: '200px'}}>
                <div className="flex flex-col items-center justify-center mb-10">
                    <h1 className="text-4xl font-bold text-center text-slate-800 mb-6" style={{color: "#4592A5"}}>
                        For any tech support and paint orders,<br /> 
                        contact us and we&apos;ll be thrilled to assist you.
                    </h1>
                </div>
                
                <div className="flex flex-row justify-center mt-8">
                    <div className="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-[900px]" style={{backgroundColor:"#D8E1E0", margin:"10px"}}>
                        <div className="relative p-2.5 h-[1000px] overflow-hidden rounded-xl bg-clip-border flex items-center justify-center">
                            <Image
                                src="/Bandula.png"
                                alt="card-image"
                                width={800}
                                height={1600}
                                className="rounded-md"
                                style={{objectFit: "contain", maxHeight: "100%", maxWidth: "100%"}}
                            />
                        </div>                                                             
                        <div className="p-8 flex flex-col">
                            <div className="mb-6 text-center">
                                <p className="text-slate-800 text-2xl font-semibold mb-3">
                                Bandula Paint Center
                                </p>
                                <p className="text-cyan-600 text-2xl font-semibold mb-5">
                                Address: Bandula Paint Center, Colombo Road, Negombo
                                </p>
                            </div>
                            <a className="text-slate-600 leading-normal font-light text-center text-xl" href="mailto:support@paintroutex.com">
                            Email: support@paintroutex.com
                            </a>
                            <p className="text-slate-600 leading-normal font-light text-center text-xl">
                            Contact No: 0777445448
                            </p>                                                
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
}

export default Support;
