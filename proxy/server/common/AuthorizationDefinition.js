import {AuthorizationChain, AuthenticationState, HttpMethods} from './AuthorizationHandling.js';

let AUTH_RULES = new AuthorizationChain();
AUTH_RULES
    .add(HttpMethods.ALL, '/**', AuthenticationState.AUTHENTICATED)
    .add(HttpMethods.ALL, '/static/**', AuthenticationState.ANONYMOUS)
    .add(HttpMethods.GET, '/api/**', ['READ_ORDER', 'READ_PRODUCT', 'READ_SUPPLIER', 'READ_SHIPPING', 'READ_PAYMENT'])
    .add(HttpMethods.POST, '/api/**', ['CREATE_ORDER', 'CREATE_SUPPLIER', 'CREATE_SHIPPING', 'CREATE_PAYMENT'])
    .add([HttpMethods.UPDATE, HttpMethods.PATCH], '/api/**', ['UPDATE_ORDER', 'UPDATE_PRODUCT', 'UPDATE_SUPPLIER', 'UPDATE_SHIPPING', 'UPDATE_PAYMENT'])
    .add(HttpMethods.DELETE, '/api/**', ['DELETE_ORDER', 'DELETE_SUPPLIER', 'DELETE_SHIPPING', 'DELETE_PAYMENT'])
    .add([HttpMethods.POST], ['/api/auth/signUp', '/api/auth/logIn'], AuthenticationState.ANONYMOUS)
    

export default AUTH_RULES;