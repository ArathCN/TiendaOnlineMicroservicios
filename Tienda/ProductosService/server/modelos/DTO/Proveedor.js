class Proveedor{
    constructor (id, nombre, contrato){
        this.id = id || 0;
        this.nombre = nombre || "";
        this.contrato = contrato || null;
    }
}

export default Proveedor;