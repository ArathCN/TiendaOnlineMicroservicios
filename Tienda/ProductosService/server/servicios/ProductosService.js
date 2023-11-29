import ProveedorService from '../servicios/ProveedorService.js';
import { APIContractResolver, APIContract, APIContractResolverOptions } from '../modelos/BO/APIContractResolver.js';
import ProductoMapper from '../modelos/mappers/ProductoMapper.js';

class ProductosService {
    
    static async obtenerProductosPorId (ids) {
        let proveedores = [];
        let respuestas = [];
        let response = [];

        //buscar todos los proveedores diferentes
        ids.forEach(producto => {
            if(proveedores[producto.idProveedor] !== undefined){
                proveedores[producto.idProveedor].push(producto.id);
            }else {
                proveedores[producto.idProveedor] = new Array(producto.id);    
            }
        });

        for (const proveedor in proveedores) {
            let proveedorData = null;

            try {
                proveedorData = await ProveedorService.obtenerProveedorPorId(proveedor);
            } catch (error) {
                console.log(error);
                throw new Error("Error en el servicio de proveedor: " + proveedor + " => " + error.message);
            }

            if(proveedorData == null){
                throw new Error(`El proveedor '${proveedor}' no se encontró`);
            }

            let contrato = new APIContract(
                proveedorData.contrato._id,
                proveedorData.contrato.host,
                proveedorData.contrato.path,
                proveedorData.contrato.authentication,
                proveedorData.contrato.endpoints
            );

            let apiContractResolver = new APIContractResolver(contrato);

            let apiContractResolverOptions = new APIContractResolverOptions({":ids,...": proveedores[proveedor]}, undefined, undefined);

            try {
                apiContractResolver.resolve();
                let respuesta = await apiContractResolver.call("productsById", apiContractResolverOptions);

                respuesta.proveedor = proveedor;
                respuesta.productos = proveedores[proveedor];
                respuestas.push(respuesta);
            } catch (err) {

                throw new Error (`Error en el contrato '${contrato._id}' => ${err.message}`);
            }
        }

        //Verificar si hubo alguna llamada con error o si no se encontraron productos.
        let productosNoEncontrados = [];
        respuestas.forEach(res => {
            if(res.code == 200){
                response = response.concat(res.data);
            }else if (res.code == 204){
                productosNoEncontrados = productosNoEncontrados.concat(res.productos);
            }else if (res.code >= 500){
                throw new Error(`Error proveedor '${res.proveedor}' => ${res.data.mensaje}`);
            }
        });
        if(productosNoEncontrados.length > 0)
            throw new Error(`Los siguientes productos no fueron encontrados: ${productosNoEncontrados.join(", ")}`);


        return response;
    }

    static async obtenerProductos (page, pageSize) {
        let pagina = page || 0;
        let proveedores = null;
        let todosProductos = new Array();

        //Obtener los proveedores
        proveedores = await ProveedorService.obtenerProveedores();
        let productosXProveedor = Math.floor(pageSize / proveedores.length);
    
        for await (const proveedor of proveedores) {
            if(!proveedor.contrato) continue;

            let contrato = new APIContract(
                proveedor.contrato._id,
                proveedor.contrato.host,
                proveedor.contrato.path,
                proveedor.contrato.authentication,
                proveedor.contrato.endpoints
            );
            let apiContractResolver = new APIContractResolver(contrato);
    
            let apiContractResolverOptions = new APIContractResolverOptions(undefined, {
                "pagination": {
                    "page": pagina,
                    "pageSize": productosXProveedor
                }
            });
    
            try {
                apiContractResolver.resolve();
                let productosResponse = await apiContractResolver.call("productCatalogEndpoint", apiContractResolverOptions);
                let productos = productosResponse.data;
                productos.forEach(producto => { producto.proveedor = proveedor._id});
                productos = ProductoMapper.arrayMap(productos);
                todosProductos = todosProductos.concat(productos);
            } catch (err) {
                throw new Error (`Error en el contrato '${contrato.id}' => ${err.message}`);
            }
        };

        //console.log(todosProductos);
        return todosProductos;
    }

    static async sacarInventario (productos) {
        let proveedores = [];
        let respuestas = [];

        //buscar todos los proveedores diferentes
        productos.forEach(producto => {
            if(proveedores[producto.idProveedor] !== undefined){
                proveedores[producto.idProveedor].push({"id": producto.id, "qty": producto.qty});
            }else {
                proveedores[producto.idProveedor] = new Array({"id": producto.id, "qty": producto.qty});    
            }
        });

        for (const proveedor in proveedores) {
            let proveedorData = null;

            try {
                proveedorData = await ProveedorService.obtenerProveedorPorId(proveedor);
            } catch (error) {
                throw new Error("Error en el servicio de proveedor: " + error.message);
            }

            if(proveedorData == null){
                throw new Error(`El proveedor '${proveedor}' no se encontró`);
            }

            let contrato = new APIContract(
                proveedorData.contrato._id,
                proveedorData.contrato.host,
                proveedorData.contrato.path,
                proveedorData.contrato.authentication,
                proveedorData.contrato.endpoints
            );

            let apiContractResolver = new APIContractResolver(contrato);

            let apiContractResolverOptions = new APIContractResolverOptions(undefined, undefined, proveedores[proveedor]);

            try {
                apiContractResolver.resolve();
                let respuesta = await apiContractResolver.call("getProducts", apiContractResolverOptions);
                respuestas.push(respuesta);
            } catch (err) {

                /////
                ///// Si ocurrió un error en alguno de las llamdas se debe de cancelar las ya hechas
                ///// Si no es posible hacer el rollback se debe de registrar qué se pidió 
                /////

                throw new Error (`Error en el contrato '${contrato._id}' => ${err.message}`);
            }
        }

        return respuestas;
    }
}

export default ProductosService;