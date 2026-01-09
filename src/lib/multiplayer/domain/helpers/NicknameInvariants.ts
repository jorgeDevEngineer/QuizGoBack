import { MAX_NICKNAME_TEXT_LENGTH, MIN_NICKNAME_TEXT_LENGTH } from "../valueObjects/playerVOs";

interface validation {
    isValid: boolean,
    cleanNickname: string 
    error: string | undefined,
}

export const validateNicknameInvariants = (nickname: string): validation  => {

        const cleanNickname = nickname ? nickname.trim() : "";

        if( cleanNickname.length === 0 )
            throw new Error("El nickname del usuario no puede estar vacío");      
        
        if( cleanNickname.length > MAX_NICKNAME_TEXT_LENGTH )
            throw new Error(`La longitud del nickname NO puede superar los ${ MAX_NICKNAME_TEXT_LENGTH } caracteres.`);      

        if( cleanNickname.length < MIN_NICKNAME_TEXT_LENGTH )
            throw new Error(`La longitud del nickname debe ser superior a los ${ MAX_NICKNAME_TEXT_LENGTH } caracteres.`);  

        return { isValid: true, cleanNickname, error: undefined };

}