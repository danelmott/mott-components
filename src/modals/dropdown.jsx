'use client';
import { useRef, useEffect} from "react";

export default function DropDown({children, open, onClose}) {
    const dropDownRef = useRef(null);
    
    useEffect(() => {
        const dropdown = dropDownRef.current;
        if(!dropdown) return;
    
    })

    <div 
        className=""
        ref={dropDownRef}
        onClick={}
    >

    </div>
}