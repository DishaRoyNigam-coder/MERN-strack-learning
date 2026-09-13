import { useCart } from '../context/CartContext';

function Cart({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🛒 Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">{item.image}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xl font-bold">Total: ${getTotalPrice().toFixed(2)}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => alert('🧾 Checkout successful!')}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  ✅ Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;