// src/data/products.js

const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Toys', 'Food', 'Beauty'];

const names = [
  'Wireless Headphones', 'Smart Watch', 'Laptop', 'T-Shirt', 'Jeans', 'Jacket', 'Coffee Mug',
  'Desk Lamp', 'Novel', 'Textbook', 'Basketball', 'Soccer Ball', 'Action Figure', 'Board Game',
  'Chocolate Bar', 'Chips', 'Lipstick', 'Shampoo', 'Phone Case', 'Sunglasses', 'Backpack',
];

export function generateProducts(count = 200) {
  const products = [];
  for (let i = 1; i <= count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    products.push({
      id: i,
      name: `${name} ${i}`,
      price: Math.round((Math.random() * 200 + 5) * 100) / 100,
      category,
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
      inStock: Math.random() > 0.3,
      description: `This is a high-quality ${name.toLowerCase()} from our premium collection.`,
      image: ['📱', '👕', '🏠', '📚', '⚽', '🧸', '🍫', '💄'][Math.floor(Math.random() * 8)],
    });
  }
  return products;
}