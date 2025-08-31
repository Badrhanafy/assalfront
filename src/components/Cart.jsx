// src/components/Cart.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import schopingAnimation from '../assets/emptybag.json'
import Lottie from 'lottie-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    city: '',
    address: ''
  });
  const [orderNote, setOrderNote] = useState('');

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Load cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading cart:', error);
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = () => {
    // Validate user information
    if (!userInfo.name || !userInfo.phone || !userInfo.city || !userInfo.address) {
      alert('Please fill in all your information before checkout');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderData = {
      items: cartItems,
      user_info: userInfo,
      note: orderNote,
      total: calculateTotal()
    };

    alert('Proceeding to checkout!');
    console.log('Order data:', orderData);
    
    // Here you would typically send this data to your backend API
    // and then clear the cart
    // localStorage.removeItem('cart');
    // setCartItems([]);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
       <Header/>

       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
             <div className='text-center' style={{
          width:"40vh",
          textAlign:"center"
   }}>
       <Lottie
                    animationData={schopingAnimation}
                    loop={true}
                    autoplay={true}
                  />
   </div>
          <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Start adding some products to your cart!</p>
          <Link
            to="/products"
            className="mt-6 inline-block bg-blue-600 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Cart Items ({calculateItemsCount()} {calculateItemsCount() === 1 ? 'item' : 'items'})
                </h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image ? `http://localhost:8000/${item.image}` : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"}
                        alt={item.product_name}
                        className="w-full sm:w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.product_name}
                        </h3>
                        <p className="text-lg font-medium text-gray-900">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">${item.price} each</p>
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Ingredients: {item.ingredients.join(', ')}
                          </p>
                        </div>
                      )}
                      <div className="mt-4 flex items-center">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-l border-r border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 text-gray-600 hover:text-gray-800"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue Shopping Button */}
            <div className="mt-6">
              <Link
                to="/products"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${calculateTotal()}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={userInfo.name}
                        onChange={handleUserInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={userInfo.phone}
                        onChange={handleUserInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={userInfo.city}
                        onChange={handleUserInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows={3}
                        value={userInfo.address}
                        onChange={handleUserInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="note" className="block text-sm text-gray-700 mb-1">
                        Order Note (Optional)
                      </label>
                      <textarea
                        id="note"
                        rows={3}
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Special instructions for your order..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-green-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-green-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>

                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <Link
                      to="/products"
                      className="text-blue-600 font-medium hover:text-blue-800"
                    >
                      Continue Shopping
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Cart;