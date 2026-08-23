'use client';
import CustomModal from "../customModal/customModal";
import Input from "../input/input";
import Button from "../buttons/button";

export default function RegisterModal({
    verifyPasswordValue,
    verifyPasswordOnchange,
    passwordValue,
    passwordOnchange,
    emailValue,
    emailOnchange,

}) {
    

    return (
        <CustomModal>
            <div className="w-[400px] h-[auto] flex">
                <div className="">
                    <div className="">
                       <Input type="text" onChange={emailOnchange} value={emailValue}/>
                    </div>
                    <div className="">
                        <Input type="password" onChange={passwordOnchange} value={passwordValue}/>
                        <Input type="password" onChange={verifyPasswordOnchange} value={verifyPasswordValue}/>
                    </div>
                </div>
                <Button variant={} quiet />

            </div>
        </CustomModal>
    )
}