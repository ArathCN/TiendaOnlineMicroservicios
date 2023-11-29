import { Router } from 'express';
import ProductosService from '../servicios/ProductosService.js';

const ProductosRouter = Router();
const PRODUCTOS_PAGINA = 30;

/**
 * Obtener los productos por página
 */
ProductosRouter.get('/', async (req, res) => {
    let totalProductos = null;
    let pagina = req.query.page || 0;

    try {
        totalProductos = await ProductosService.obtenerProductos(pagina, PRODUCTOS_PAGINA);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.send({"message": error.message});
        return;
    }

    res.send(totalProductos);
});

/**
 * Obtener productos por ID (e ID proveedor)
 */
ProductosRouter.get('/getProducts', async (req, res) => {
    let products = req.query.products;
    let respuesta = null;

    if(req.headers['user']) console.log(req.headers['user']);

    //comprobar que sean los datos esperados
    if(Array.isArray(products)){
        products.forEach(product => {
            if(!product.hasOwnProperty("id") || !product.hasOwnProperty("idProveedor")){
                respuesta = {"mensaje": "Debe de contener 'id' e 'idProveedor'"};
            }
        });
    }else{
        respuesta = {"mensaje": "Debe ser un array"};
        console.log(products);
    }
    if(respuesta != null) return res.status(500).send(respuesta);

    try {
        let productos = await ProductosService.obtenerProductosPorId(products);
        respuesta = productos;
    } catch (error) {
        respuesta = {"mensaje": error.message};
        res.status(500);
    }

    res.send(respuesta);
});

/**
 * Restar cantidad a productos de proveedores
 * Ejemplo de datos:
 *      [
 *          {
 *              "id": "a123",
 *              "idProveedor": "a1234",
 *              "qty": 12
 *          }
 *      ]
 * numero positivo resta al inventario, numero negativo suma. Pero en general  se busca restar
 */
ProductosRouter.patch('/updateInventory', async (req, res) => {
    let productos = req.body;
    let respuesta = null;
    try {
        respuesta = await ProductosService.sacarInventario(productos);
    } catch (error) {
        res.status(500);
        res.send({"message": error.message});
        return;
    }

    res.send(respuesta);
    
});

export default ProductosRouter;