const API = 'http://localhost:5000';

export const productApi = {
  getProducts: async () => {
    const res = await fetch(`${API}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
  updateStock: async ({ id, stock }) => {
    const res = await fetch(`${API}/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    });
    if (!res.ok) throw new Error('Failed to update stock');
    return res.json();
  },
};