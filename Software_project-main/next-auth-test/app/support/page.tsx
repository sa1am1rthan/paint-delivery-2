'use client';

import React from "react";
import Header from "../Header";
import { useRouter } from "next/navigation";
import Footer from "../Footer";

const Support: React.FC = () => {
    const router = useRouter();

    const handleLoginClick = () => {
      router.push('/login');
    };

    return (
        <>
            <Header onLoginClick={handleLoginClick} />

            <div className="flex flex-wrap justify-center" style={{marginTop:"60px"}}>
                <div className="flex flex-col items-center justify-center" style={{height:"200px"}}>
                    <h1 className="text-4xl font-bold text-center text-slate-800 mb-6" style={{color: "#4592A5"}}>For any tech support and paint orders,<br /> contact us and we'll be thrilled to assist you.</h1>
                </div>
                
                <div className="flex flex-row" >
                <div class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96" style={{backgroundColor:"#D8E1E0", margin:"10px"}}>
            <div class="relative p-2.5 h-96 overflow-hidden rounded-xl bg-clip-border flex items-center justify-center">
                <img
                    style={{width:"200px", height:"200px", objectFit:"contain"}}
                    src="Bandula.png" 
                    alt="card-image"
                    class="rounded-md"
                    style={{height:"500px"}}
                />
            </div>                                                             
            <div class="p-4 flex flex-col">
                <div class="mb-4 text-center">
                    <p class="text-slate-800 text-xl font-semibold mb-2">
                    Bandula Paint Center
                    </p>
                    <p class="text-cyan-600 text-xl font-semibold mb-4">
                    Address:Bandula Paint Center, Colombo Road, Negombo
                    </p>
                </div>
                <a class="text-slate-600 leading-normal font-light text-center" href="support@paintroutex.com">
                Email: support@paintroutex.com
                </a>
                <p class="text-slate-600 leading-normal font-light text-center">
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