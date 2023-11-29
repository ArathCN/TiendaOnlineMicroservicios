class AuthorizationChain {

    constructor() {
        this.rules = [];
    }

    add (method, path, permission) {
        const auth = new AuthorizationGrant(method, path, permission);
        this.rules.push(auth);
        return this;
    }

    check(request) {
        const method = request.method;
        const path = request.url;
        let permissions = [];
        if(request.user) permissions = request.user.permissions;
        let grants = [];

        console.log(path);
        
        //reglas que coinciden con el path de la solicitud
        this.rules.forEach(rule => {
            let found = false;
            rule.path.forEach(p => {
                const newPath = p.replace("**", ".*");
                let match = path.match(newPath);
                if(match && !found){
                    grants.push(rule);
                    found = true;
                }
            });
        });

        //reglas que conciden con el metodo de la solicitud.
        for (let index = 0; index < grants.length; index++) {
            let methodIndex = grants[index].method.findIndex(m => m == method || m == HttpMethods.ALL);
            if(methodIndex == -1){
                grants.splice(index, 1);
                index--;
            }
        }
        //console.log("Final", grants);

        if(request.user){
            //Si no encuentra ninguna regla por defecto se toma como que cualquiera autenticado y puede acceder
            if(!grants.length) return true;

            //Se toma el ultimo
            const grant = grants[grants.length-1];
            console.log(grant);
            if(grant.permission.find(p => p == AuthenticationState.AUTHENTICATED)) return true;

            let pass = grant.permission.some(e => {
                return permissions.some(p => p == e)
            });
            return pass;
        }else{
            //Si no encuentra ninguna regla y no se especifica el permiso como anonimo entonces no puede acceder
            if(!grants.length) return false;

            //Se toma el ultimo
            const grant = grants[grants.length-1];
            if(grant.permission.find(p => p == AuthenticationState.ANONYMOUS)) return true;

            return false;
        }
    }
}

class AuthorizationGrant {
    constructor(method, path, permission) {
        if(typeof method === 'string') this.method = [method];
        else this.method = method;

        if(typeof path === 'string') this.path = [path];
        else this.path = path;

        if(typeof permission === 'string') this.permission = [permission];
        else if(Array.isArray(permission)){
            let state = 0;
            permission.forEach(p => {
                for (const key in AuthenticationState) {
                    if(p == key){
                        state++;
                        break;
                    }
                }
            });
            if(state > 1) throw new Error("No se puede usar más de un tipo" + AuthenticationState);
            this.permission = permission;
        }
    }
}

class HttpMethods {
    static ALL = 'ALL';

    static POST = 'POST';
    static GET = 'GET';
    static UPDATE = 'UPDATE';
    static PATCH = 'PATCH';
    static DELETE = 'DELETE';
    static OPTIONS = 'OPTIONS';
    static HEAD = 'HEAD';
    static CONNECT = 'CONNECT';
    static TRACE = 'TRACE';
}

class AuthenticationState {
    static ANONYMOUS = 'ANONYMOUS';
    static AUTHENTICATED = 'AUTHENTICATED';
}

export {AuthorizationChain, AuthorizationGrant, AuthenticationState, HttpMethods}