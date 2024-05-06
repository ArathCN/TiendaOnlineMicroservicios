const foobarIpsum = require('foobar-ipsum');
var fs = require('fs');
 
const categorias = [
  "muebles",
  "bebidas",
  "tecnología",
  "papelería",
  "salud y belleza",
  "cocina",
  "juguetería",
  "frutas y verduras",
  "panadería",
  "cuidado del hogar",
  "carnicería"
];
const uomd = ["cm", "in"];
const uomw = ["kg", "lb"];

const generadorUomd = new foobarIpsum({dictionary: uomd});
const generadorUomw = new foobarIpsum({dictionary: uomw});
const generadorCategorias = new foobarIpsum({dictionary: categorias});
const generator = new foobarIpsum({
  size: {
    sentence: 8,
    paragraph: 5
  }
})

class Producto {
  constructor(name, price, qty, category, description, image, measures){
    this.name = name;
    this.price = price;
    this.qty = qty;
    this.category = category;
    this.description = description;
    this.image = image;
    this.measures = measures;
  }
}
class Measures {
  constructor(height, length, width, weight, uomd, uomw){
    this.height = height;
    this.length = length;
    this.width = width;
    this.weight = weight;
    this.uomd = uomd;
    this.uomw = uomw;
  }
}

function aleatorio(minimo, maximo, decimales) {
  var precision = Math.pow(10, decimales);
  minimo = minimo*precision;
  maximo = maximo*precision;
  return Math.floor(Math.random()*(maximo-minimo+1) + minimo) / precision;
}

let productos = [];

for (let index = 0; index < 1000; index++) {
  let name = generator.sentence();
  let price = aleatorio(0.1, 1000, 2);
  let qty = aleatorio(1, 100, 0);
  let category = generadorCategorias.word();
  let description = generator.paragraph();
  let image = "/img/" + generator.word() + ".jpg";
  
  let height = aleatorio(1, 40, 2);
  let length = aleatorio(1, 40, 2);
  let width = aleatorio(1, 40, 2);
  let weight = aleatorio(0.1, 60, 2);
  let uomd = generadorUomd.word();
  let uomw = generadorUomw.word();

  let measures = new Measures(height, length, width, weight, uomd, uomw);
  let producto = new Producto(name, price, qty, category, description, image, measures);

  productos.push(producto);
  //console.log(producto);
}


fs.writeFile('productos.json', JSON.stringify(productos), function(err) {
  if (err) { 
    console.error(err);
  } else {
    console.log("Se escribió con exito en el fichero.");
  }
});