// src/utils/cartUtils.js

// Add item to cart
export const addToCart = (product, quantity = 1) => {
  // Get current cart from localStorage
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Check if product already exists in cart
  const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product exists
    currentCart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    currentCart.push({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      image: product.image,
      ingredients: product.ingredients,
      quantity: quantity
    });
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('cart', JSON.stringify(currentCart));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('cartUpdated'));
};

// Remove item from cart
export const removeFromCart = (productId) => {
  const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updatedCart = currentCart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.dispatchEvent(new Event('cartUpdated'));
};

// Get cart items
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem('cart') || '[]');
};

// Get cart items count
export const getCartItemsCount = () => {
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

// Clear cart
export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
};