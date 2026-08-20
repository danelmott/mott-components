const prefixLog = '[MOTT-COMPONENTS]';


export function verifyTypesInput(label, placeholder, type) {
    
    if(typeof placeholder !== "undefined" && typeof placeholder !== "string") {
        throw new TypeError(`${prefixLog} The data type for the placeholder must be string`);
    }
    
    if(typeof label !== "undefined" && typeof label !== "string") {
        throw new TypeError(`${prefixLog} The data type for the label must be string`)
    }
    
    if(typeof type !== "undefined" && !["text", "number", "password"].includes(type)) {
        throw new TypeError(`${prefixLog} The input type entered is not valid; you can only choose between the following types: text, number, password`);
    }
    
    
    return true;
}

