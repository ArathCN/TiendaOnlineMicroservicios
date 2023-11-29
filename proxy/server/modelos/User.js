class User {
    /**
     * @constructor
     * @param {String} id - ID unico del usuario
     * @param {Array<String} permissions - Lista de permisos otorgados al usuario
     */
    constructor(id, permissions){
        this.id = id;
        this.permissions = permissions;
    }
}
export default User;