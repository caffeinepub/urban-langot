import List "mo:core/List";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  type ProductId = Nat;

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    price : Nat;
    rating : Nat;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  type CartProduct = {
    product : Product;
    quantity : Nat;
  };

  let products = Map.fromIter<ProductId, Product>([(1, {
                                                   id = 1;
                                                   name = "Urban Langot Classic Cotton";
                                                   description = "Premium cotton comfort for everyday wear.";
                                                   price = 39900;
                                                   rating = 4;
                                                 }), (2, {
                                                          id = 2;
                                                          name = "Urban Langot Sport Flex";
                                                          description = "Flexible and durable for active lifestyles.";
                                                          price = 49900;
                                                          rating = 5;
                                                        }), (3, {
                                                                 id = 3;
                                                                 name = "Urban Langot Ultra Comfort";
                                                                 description = "Extra soft and gentle fit for sensitive skin.";
                                                                 price = 44900;
                                                                 rating = 4;
                                                               }), (4, {
                                                                        id = 4;
                                                                        name = "Urban Langot Premium Fit";
                                                                        description = "Superior fit and premium quality materials.";
                                                                        price = 59900;
                                                                        rating = 5;
                                                                      })].values());
  let cart = List.empty<CartItem>();

  // Product Management (Query):
  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  // Cart Management:
  public func addToCart(productId : ProductId) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("This product does not exist.") };
      case (?_) {
        let cartArray = cart.toArray();

        let newCart : List.List<CartItem> = if (cartArray.size() > 0) {
          List.empty<CartItem>();
        } else {
          cart;
        };

        if (newCart.size() == cart.size()) {
          newCart.add({ productId; quantity = 1 });
        };

        cart.clear();
        let reversedNewCart = newCart.reverse();
        cart.addAll(reversedNewCart.values());
      };
    };
  };

  public func removeFromCart(productId : ProductId) : async () {
    let filteredCart = cart.filter(
      func(item) {
        if (item.productId == productId) {
          if (item.quantity > 1) {
            cart.add({ productId; quantity = item.quantity - 1 });
          };
          false;
        } else {
          true;
        };
      }
    );
    cart.clear();
    cart.addAll(filteredCart.values());
  };

  public func clearCart() : async () {
    cart.clear();
  };

  public query ({ caller }) func getCart() : async [CartProduct] {
    let cartProducts = cart.toArray().map(
      func(item) {
        {
          product = switch (products.get(item.productId)) {
            case (?product) { product };
            case (null) {
              Runtime.trap("Product not found in system, but present in cart.");
            };
          };
          quantity = item.quantity;
        };
      }
    );
    cartProducts;
  };
};
