'use client';
import { useState } from "react";
import CustomModal from "../customModal/customModal";
import Input from "../input/input";

//default login modal
export default function LoginModal(open, onClose) {

    return (
       <CustomModal>
        <div className="w-[400px] h-[auto] flex ">
            <div className="w-[100%] h-[auto] ">
               <Input 
                   onChange={} 
                   key={} 
                   value={} 
                   type="text"
                   placeholder="tuemail@gmail.com"
                   label="Ingresa tu correo"
                />
               
               <Input 
                   onChange={} 
                   key={} 
                   type="password" 
                   label="Ingresa tu contraseña" 
                   placeholder="contraseña"
                />
            </div>
        </div>
       </CustomModal>
    )
}