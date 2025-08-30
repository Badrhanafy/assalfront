// src/components/CartSidebar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CartSidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [cartItems, setCartItems] = useState([]);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const sidebarRef = useRef(null);

  // Update RTL state when language changes
  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
  }, [i18n.language]);

  // Load cart items from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };

    loadCart();

    // Listen for cart updates from other components
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Handle sidebar animation based on RTL/LTR
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Reset transform when language changes to ensure proper positioning
    if (isOpen) {
      sidebar.style.transform = 'translateX(0)';
    } else {
      sidebar.style.transform = isRTL ? 'translateX(-100%)' : 'translateX(100%)';
    }
  }, [isRTL, isOpen]);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const updatedCart = cartItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const calculateItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Get localized currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get localized pluralization for items
  const getItemsText = (count) => {
    if (count === 1) {
      return t('cart.item', { count });
    }
    return t('cart.items', { count });
  };

  // Get sidebar transform class based on RTL and open state
  const getTransformClass = () => {
    if (isOpen) {
      return 'translate-x-0';
    }
    return isRTL ? '-translate-x-full' : 'translate-x-full';
  };

  // Get sidebar position class based on RTL
  const getPositionClass = () => {
    return isRTL ? 'left-0' : 'right-0';
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 h-full w-full max-w-md bg-white shadow-xl z-50
                    transform transition-transform duration-300 ease-in-out
                    ${getPositionClass()} ${getTransformClass()}
                    ${isRTL ? 'font-arabic' : 'font-sans'}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('cart.your_cart')} ({getItemsText(calculateItemsCount())})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t('cart.close_cart')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {t('cart.empty_cart_title')}
                </h3>
                <p className="mt-2 text-gray-500">
                  {t('cart.empty_cart_description')}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <li key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image ? `http://localhost:8000/${item.image}` : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    </div>
                    <div className={`flex-1 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.product_name}
                        </h3>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(parseFloat(item.price) * item.quantity)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatCurrency(item.price)} {t('cart.each')}
                      </p>
                      <div className="mt-2 flex items-center">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            aria-label={t('cart.decrease_quantity')}
                          >
                            -
                          </button>
                          <span className="px-2 py-1 border-l border-r border-gray-300 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            aria-label={t('cart.increase_quantity')}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className={`text-sm font-medium text-red-600 hover:text-red-800 ${isRTL ? 'mr-3' : 'ml-3'}`}
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>{t('cart.subtotal')}</p>
              <p>{formatCurrency(calculateTotal())}</p>
            </div>
            
            {cartItems.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  {t('cart.shipping_notice')}
                </p>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  {t('cart.complete_order')}
                </Link>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="mt-3 flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('cart.view_cart')}
                </Link>
              </>
            )}
            
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-600"
              >
                {t('cart.continue_shopping')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;