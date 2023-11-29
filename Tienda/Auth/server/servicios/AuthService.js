import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt";
import UsuarioService from "./UsuarioService.js";

class AuthService {
    
    static async SignUp(user) {
    
        //Check if the user already exist or not
        const userExist = await UsuarioService.ReadByEmail(user.email);
        if (userExist) throw new Error("Ya existe una cuenta con el correo dado.");

        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(user.password, salt);
        user.password = hashPassword;
        
        //Add user to database
        let userID = await UsuarioService.Create(user);

        //generate token
        const token = AuthService.GenerateToken(userID);

        return {"user": userID, "token": token};
    }

    static async LogIn(mail, password){

        //Check if the user already exist or not
        const userExist = await UsuarioService.ReadByEmail(mail);
        if(!userExist) throw new Error("No existe una cuenta con el correo dado.");

        //Check password match
        const isPasswordMatched = await bcrypt.compare(password, userExist.password);
        if(!isPasswordMatched) throw new Error("Contraseña incorrecta.");

        if(!userExist) throw new Error("No existe una cuenta con el correo dado.");
        
        //generate token
        const token = AuthService.GenerateToken(userExist.id);

        return token;
    }

    static async Verify(headerToken){
        const token = headerToken.split(" ")[1]; 
        const verify = jwt.verify(token, process.env.JWT_KEY);
        const user = UsuarioService.ReadById(verify.id);

        return user;
    }

    static GenerateToken(id){
        const token = jwt.sign({ id: id }, process.env.JWT_KEY, {
            expiresIn: process.env.JWT_EXPIRE,
        });

        return token;
    }
}

export default AuthService;