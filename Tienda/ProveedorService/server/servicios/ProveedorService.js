const ProveedorRepository = require("../repositorios/ProveedorRepository");

const ProveedorService = {
    create: async (proveedor) => {
        let respuesta;

        try {
            respuesta = await ProveedorRepository.create(proveedor);
        } catch (error) {
            throw error;
        }

        return respuesta;
    },

    readById: async (id, embed) => {
        let proveedor;
        try {
            proveedor = await ProveedorRepository.readById(id, embed);
        } catch (error) {
            throw error;
        }

        return proveedor;
    },
    
    readMany: async (pagination, filters, embed) => {
        let coleccion;

        try {
            coleccion = await ProveedorRepository.readMany(pagination, filters, embed);
        } catch (error) {
            throw error;
        }

        return coleccion;
    },

    readAll: async (embed) => {
        let proveedores;

        try {
            proveedores = await ProveedorRepository.readAll(embed);
        } catch (error) {
            throw error;
        }

        return proveedores;
    },

    update: async (proveedor) => {
        let respuesta;

        try {
            respuesta =  await ProveedorRepository.update(proveedor);
        } catch (error) {
            throw error;
        }

        return respuesta;
    },

    delete: async (id) => {
        let respuesta;

        try {
            respuesta = await ProveedorRepository.delete(id);
        } catch (error) {
            throw error;
        }

        return respuesta;
    }
}

module.exports = ProveedorService;