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

module.exports = Producto;