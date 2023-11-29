import UsuarioRepository from "../repositorios/UsuarioRepository.js";
import { ulid } from 'ulid';
import UsuarioPermissions from "../modelos/UserPermissions.js";

class UsuarioService {

    static async Create(user) {
        const id = ulid();
        user.id = id;
        user.permissions = UsuarioPermissions.get();
        let createdUser = await UsuarioRepository.save(id, user);

        return createdUser.id;
    }

    static async ReadByEmail(email){
        let user = await UsuarioRepository.search()
            .where("email").eq(email).return.first();

        return user;
    }

    static async ReadById(id){
        let user = await UsuarioRepository.search()
            .where("id").eq(id).return.first();

        return user;
    }
}

export default UsuarioService;