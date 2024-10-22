import React from "react";

function Shopcard({title, price, para, logo}){
    return (
        <div class="relative flex flex-col my-6 bg-white shadow-sm border border-slate-200 rounded-lg w-96" style={{backgroundColor:"#D8E1E0", margin:"10px"}}>
            <div class="relative p-2.5 h-96 overflow-hidden rounded-xl bg-clip-border flex items-center justify-center">
                <img
                    style={{width:"200px", height:"200px", objectFit:"contain"}}
                    src={logo}
                    alt="card-image"
                    class="rounded-md"
                />
            </div>                                                             
            <div class="p-4 flex flex-col">
                <div class="mb-4 text-center">
                    <p class="text-slate-800 text-xl font-semibold mb-2">
                        {title}
                    </p>
                    <p class="text-cyan-600 text-xl font-semibold mb-4">
                        {price}
                    </p>
                </div>
                <p class="text-slate-600 leading-normal font-light text-center">
                    {para}
                </p>
            </div>
        </div>
    )
}

export default Shopcard;
