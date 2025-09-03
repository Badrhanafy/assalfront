// src/components/Cart.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import schopingAnimation from '../assets/emptybag.json';
import Lottie from 'lottie-react';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    phone: '',
    city: '',
    address: ''
  });
  const [orderNote, setOrderNote] = useState('');
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  // Create axios instance
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api'
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

  const handleCheckout = async () => {
    // Validate user information
    if (!userInfo.name || !userInfo.phone || !userInfo.city || !userInfo.address) {
      alert(t('cart.fill_info_error'));
      return;
    }

    if (cartItems.length === 0) {
      alert(t('cart.empty_cart_title'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is authenticated and get user ID
      const token = localStorage.getItem('token');
      let userId = null;
      
      if (token) {
        try {
          const user = localStorage.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            userId = userObj.id;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Continue with null user_id if there's an error parsing user data
        }
      }

      // Prepare order data - user_id will be null for guest users
      const orderData = {
        user_id: userId,
        customer_name: userInfo.name,
        customer_phone: userInfo.phone,
        total_amount: calculateTotal(),
        shipping_address: `${userInfo.address}, ${userInfo.city}`,
        billing_address: `${userInfo.address}, ${userInfo.city}`,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        notes: orderNote,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: (parseFloat(item.price) * item.quantity).toFixed(2)
        }))
      };

      // Prepare request config
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};

      // Send order to backend
      const response = await axiosInstance.post('/orders/create', orderData, config);

      if (response.data.success) {
        alert(t('cart.order_success'));
        
        // Clear the cart
        localStorage.removeItem('cart');
        setCartItems([]);
        
        // Reset form
        setUserInfo({
          name: '',
          phone: '',
          city: '',
          address: ''
        });
        setOrderNote('');
        
        // Redirect based on authentication status
        if (token) {
          try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.id) {
              navigate(`/user/${user.id}/orders`);
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error('Error parsing user data for redirect:', error);
            navigate('/');
          }
        } else {
          // For guest users, redirect to home or order confirmation page
          navigate('/');
        }
      } else {
        throw new Error(response.data.message || t('cart.order_error'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error.response) {
        // Backend returned an error response
        if (error.response.status === 422) {
          // Validation error (e.g., insufficient stock)
          const errorData = error.response.data;
          if (errorData.message === 'Insufficient stock') {
            alert(t('cart.insufficient_stock', { 
              product: errorData.product, 
              available: errorData.available_stock 
            }));
            
            // Update the cart to reflect available stock
            setCartItems(prevItems => 
              prevItems.map(item => 
                item.id === errorData.product_id 
                  ? { ...item, quantity: Math.min(item.quantity, errorData.available_stock) }
                  : item
              ).filter(item => item.quantity > 0)
            );
          } else {
            alert(t('cart.validation_error'));
          }
        } else if (error.response.status === 401) {
          // Token might be invalid, but we'll still proceed with guest checkout
          alert(t('cart.order_error_generic'));
        } else {
          alert(t('cart.order_error_generic'));
        }
      } else {
        alert(t('cart.network_error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component remains the same until the return statement ...

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart.your_cart')}</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-amber-100">
            <div className='mx-auto' style={{ width: "40vh" }}>
              <Lottie
                animationData={schopingAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
            <h2 className="mt-4 text-xl font-medium text-gray-900">{t('cart.empty_cart_title')}</h2>
            <p className="mt-2 text-gray-500">{t('cart.empty_cart_description')}</p>
            <Link
              to="/products"
              className="mt-6 inline-block bg-gradient-to-r from-orange-500 to-amber-500 py-3 px-6 border border-transparent rounded-lg text-base font-medium text-white hover:from-orange-600 hover:to-amber-600 transition"
            >
              {t('cart.continue_shopping')}
            </Link>
          </div>
        ) : (
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
                <div className="px-6 py-4 border-b border-amber-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    {t('cart.cart_items', { count: calculateItemsCount() })}
                  </h2>
                </div>
                <ul className="divide-y divide-amber-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image ? `http://localhost:8000/${item.image}` : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"}
                          alt={item.product_name}
                          className="w-full sm:w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {item.product_name}
                          </h3>
                          <p className="text-lg font-medium text-orange-600">
                            {t('common.currency', { value: (parseFloat(item.price) * item.quantity).toFixed(2) })}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{t('common.currency', { value: item.price })} {t('cart.each')}</p>
                        {Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              {t('product.ingredients')}:{" "}
                              {item.ingredients.map((ing, index) => (
                                <span key={index}>
                                  {ing}{index < item.ingredients.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </p>
                          </div>
                        )}
                        <div className="mt-4 flex items-center">
                          <div className="flex items-center border border-amber-300 rounded-lg bg-amber-50">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-amber-600 hover:text-amber-800 transition"
                              aria-label={t('cart.decrease_quantity')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-4 py-1 border-l border-r border-amber-300 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-amber-600 hover:text-amber-800 transition"
                              aria-label={t('cart.increase_quantity')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-4 text-sm font-medium text-red-600 hover:text-red-800 transition"
                          >
                            {t('cart.remove')}
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
                  className="flex items-center text-orange-600 hover:text-orange-800 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('cart.continue_shopping')}
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 150 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 border border-amber-100"
              >
                <h2 className="text-lg font-medium text-gray-900 mb-4">{t('cart.order_summary')}</h2>
                
                <div className="border-t border-amber-200 pt-4">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>{t('cart.subtotal')}</p>
                    <p className="text-orange-600">{t('common.currency', { value: calculateTotal() })}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('cart.shipping_notice')}
                  </p>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{t('cart.shipping_info')}</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                          {t('product.name')} *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={userInfo.name}
                          onChange={handleUserInfoChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-amber-50"
                          required
                          placeholder={t('product.name_placeholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
                          {t('product.phone')} *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={userInfo.phone}
                          onChange={handleUserInfoChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-amber-50"
                          required
                          placeholder={t('product.phone_placeholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="city" className="block text-sm text-gray-700 mb-1">
                          {t('product.city')} *
                        </label>
                        <select
                          id="city"
                          name="city"
                          value={userInfo.city}
                          onChange={handleUserInfoChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-amber-50"
                          required
                        >
                          <option value="">{t('product.select_city')}</option>
                          <option value="casablanca">Casablanca</option>
                          <option value="rabat">Rabat</option>
                          <option value="marrakech">Marrakech</option>
                          <option value="fes">Fes</option>
                          <option value="tanger">Tanger</option>
                          <option value="agadir">Agadir</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm text-gray-700 mb-1">
                          {t('product.delivery_address')} *
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={userInfo.address}
                          onChange={handleUserInfoChange}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-amber-50 resize-none"
                          required
                          placeholder={t('product.address_placeholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="note" className="block text-sm text-gray-700 mb-1">
                          {t('product.order_note')} ({t('common.optional')})
                        </label>
                        <textarea
                          id="note"
                          rows={3}
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-amber-50 resize-none"
                          placeholder={t('product.order_note_placeholder')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className={`w-full py-3 px-4 flex items-center justify-center text-base font-medium rounded-lg ${
                        isSubmitting 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                      } text-white border border-transparent transition shadow-md hover:shadow-lg`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t('cart.processing')}
                        </>
                      ) : (
                        t('cart.complete_order')
                      )}
                    </motion.button>
                  </div>

                  <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                    <p>
                      {t('cart.or')}{' '}
                      <Link
                        to="/products"
                        className="text-orange-600 font-medium hover:text-orange-800 transition"
                      >
                        {t('cart.continue_shopping')}
                      </Link>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;