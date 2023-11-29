import { Router } from 'express';
import ProductosService from '../servicios/ProductosService.js';

const UserGUIRouter = Router();
const PRODUCTOS_PAGINA = 30;

/**
 * Obtener los productos por página
 */
UserGUIRouter.get('/inicio', async (req, res) => {
    
    //obtener productos

    //enviar lsita de productos a la vista
});

/**
 * Confirmar un pedido
 * Se pasa el carrito como parametro
 */
UserGUIRouter.get('/makeOrder', async (req, res) => {
    //obtener carrito

    //llamo al servicio para restar cantidad a los proveedores

    //llamo a ordenes para hacer orden, devuelve idOrden

    //redirijo a ordenes con el idOrden '---?id=123'
});

export default UserGUIRouter;