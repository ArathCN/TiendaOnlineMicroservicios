import Permissions from "../common/Permissions.js";

class UsuarioPermissions{
    static PERMISSIONS = [
        Permissions.READ_PRODUCT,
        Permissions.READ_ORDER,
        Permissions.READ_SHIPPING,
        Permissions.READ_PAYMENT,
        Permissions.CREATE_ORDER,
        Permissions.CREATE_SHIPPING,
        Permissions.CREATE_PAYMENT
    ];

    static get(){
        return UsuarioPermissions.PERMISSIONS;
    }
}

export default UsuarioPermissions;
