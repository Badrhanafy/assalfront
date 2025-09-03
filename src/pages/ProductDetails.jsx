// src/components/ProductDetails.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { addToCart } from '../utils/cartUtils';

const StarRating = ({ value = 0, onChange, interactive = true }) => {
  const { t } = useTranslation();

  return (
    <div className="flex space-x-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => interactive && onChange(star)}
          className={`w-7 h-7 ${interactive ? 'cursor-pointer' : ''} transition-colors duration-200 ${star <= value ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label={t('product.star_rating', { star })}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const ProductDetails = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNote, setOrderNote] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [similarProducts, setSimilarProducts] = useState([]);
  
  // New state for reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // Review form state
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Auto-fill user info from localStorage
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  });

  const { id } = useParams();
  const isRTL = i18n.language === 'ar';
  const token = localStorage.getItem('token');
  const baseurl = import.meta.env.VITE_BACKEND_ENDPOINT;
  
  // Create axios instance with auth token
  const axiosInstance = axios.create({
    baseURL: baseurl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Add auth token if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserInfo(prev => ({
          ...prev,
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          city: parsed.city || '',
          address: parsed.address || '',
        }));
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Fetch product data and reviews
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/products/${id}`);
        setProduct(data);
        
        // Fetch similar products based on category
        if (data.category_id) {
          const similarResponse = await axiosInstance.get(`/products?category_id=${data.category_id}&limit=4`);
          setSimilarProducts(similarResponse.data.data || []);
        }
        
        // Fetch reviews for this product
        await fetchReviews();
      } catch (err) {
        setError(t('product.fetch_error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id, t]);

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  // Function to fetch reviews
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axiosInstance.get(`/api/products/${id}/reviews`);
      
      if (response.data && response.data.data) {
        setReviews(response.data.data);
        setReviewCount(response.data.total || response.data.data.length);
        
        // Calculate average rating
        if (response.data.data.length > 0) {
          const totalRating = response.data.data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / response.data.data.length);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const toastIt = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toastIt(t('product.added_to_cart', { quantity, name: product.product_name }));
  };

  const handlePlaceOrder = async () => {
    if (!userInfo.name || !userInfo.phone || !userInfo.city || !userInfo.address) {
      toastIt(t('product.fill_info_error'), 'error');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare order data - use null user_id for guests
      const orderData = {
        user_id: user ? user.id : null,
        customer_name: userInfo.name,
        customer_email: userInfo.email,
        customer_phone: userInfo.phone,
        total_amount: (parseFloat(product.price) * quantity).toFixed(2),
        status: 'pending',
        shipping_address: `${userInfo.address}, ${userInfo.city}`,
        billing_address: `${userInfo.address}, ${userInfo.city}`,
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        notes: orderNote,
        items: [
          {
            product_id: product.id,
            quantity: quantity,
            unit_price: product.price,
            total_price: (parseFloat(product.price) * quantity).toFixed(2)
          }
        ]
      };

      // Send order to backend
      const response = await axiosInstance.post('/orders/create', orderData);

      if (response.data.success) {
        toastIt(t('product.order_placed_success'), 'success');

        // Redirect based on user status
        setTimeout(() => {
          if (user) {
            navigate(`/user/${user.id}/orders`);
          } else {
            navigate('/order-confirmation', { 
              state: { 
                orderId: response.data.order.id,
                customerName: userInfo.name 
              } 
            });
          }
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      let errorMessage = t('product.order_error');

      if (error.response?.status === 422) {
        // Validation error (e.g., invalid product_id)
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors['items.0.product_id']) {
          errorMessage = t('product.invalid_product_error');
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toastIt(errorMessage, 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setShowLoginAlert(true);
      return;
    }
    
    try {
      await axiosInstance.post(`/api/products/${id}/reviews`, {
        product_id: product.id,
        rating: reviewStars,
        comment: reviewComment
      });
      
      toastIt(t('product.review_thanks'));
      setShowReviewModal(false);
      setReviewStars(0);
      setReviewComment('');
      
      // Refresh reviews after submission
      await fetchReviews();
    } catch (error) {
      console.error('Review submission error:', error);
      toastIt(t('product.review_error'), 'error');
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 text-center shadow-md">
            <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl">{t('product.not_found')}</p>
        </div>
      </div>
    );

  // Parse ingredients if they're stored as a JSON string
  const ingredientsList = typeof product.ingredients === 'string' 
    ? JSON.parse(product.ingredients) 
    : product.ingredients;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <Header /> 

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-orange-500'
              }`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Alert Modal */}
      <AnimatePresence>
        {showLoginAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('product.login_required_title')}</h3>
                <p className="text-gray-600 mb-4">{t('product.login_required_message')}</p>
                <div className="flex justify-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowLoginAlert(false);
                      navigate('/login');
                    }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    {t('common.login')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLoginAlert(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    {t('common.cancel')}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t('product.leave_review')}</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">{t('product.your_rating')}</label>
                  <StarRating value={reviewStars} onChange={setReviewStars} />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">{t('product.comment')}</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition"
                    required
                    placeholder={t('product.comment_placeholder')}
                  />
                </div>
                <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-2 justify-end`}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    {t('common.submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Breadcrumb */}
        <nav className="mb-8 flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <button onClick={() => navigate('/')} className="text-gray-500 hover:text-orange-600 transition">
                {t('common.home')}
              </button>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-orange-600 transition">
                {t('common.products')}
              </button>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700 truncate max-w-xs">{product.product_name}</span>
            </li>
          </ol>
        </nav>

        <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          {/* Left scrollable side */}
          <div className="lg:w-2/3 space-y-8">
            {/* Product card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100"
            >
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                  <motion.div 
                    className="relative overflow-hidden rounded-xl bg-amber-50"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <img
                      src={
                        product.image
                          ? `${baseurl}/${product.image}`
                          : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={product.product_name}
                      className="w-full aspect-square object-cover rounded-xl"
                    />
                    {product.on_promo && (
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {t('product.on_promo')}
                      </div>
                    )}
                  </motion.div>
                </div>
                <div className="md:w-1/2 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>
                    <div className="flex items-center mt-2">
                      <StarRating value={averageRating} interactive={false} />
                      <span className="ml-2 text-sm text-gray-600">
                        ({reviewCount} {t('product.reviews')})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-orange-600">
                      {t('common.currency', { value: product.price })}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xl text-gray-500 line-through">
                        {t('common.currency', { value: product.original_price })}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 py-2">
                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 
                        ? t('product.in_stock') 
                        : t('product.out_of_stock')
                      }
                    </span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="text-sm text-gray-600">
                      {t('product.weight')}: {product.weight}g
                    </span>
                  </div>

                  <div className="pt-4 border-t border-amber-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      {t('product.quantity')}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 transition flex items-center justify-center"
                        aria-label={t('product.decrease_quantity')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 transition flex items-center justify-center"
                        aria-label={t('product.increase_quantity')}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <span className="text-sm text-gray-500 ml-2">
                        {t('product.available', { stock: product.stock })}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToCart}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {t('product.add_to_cart')}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 flex items-center justify-center bg-amber-100 rounded-lg hover:bg-amber-200 transition"
                    >
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Product Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100"
            >
              <div className="border-b border-amber-200">
                <nav className="flex -mb-px">
                  {['description', 'ingredients', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-6 text-center font-medium text-sm border-b-2 transition ${activeTab === tab 
                        ? 'border-orange-500 text-orange-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {t(`product.tabs.${tab}`)}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('product.description')}</h3>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{t('product.detail_1')}</span>
                      </div>
                      <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{t('product.detail_2')}</span>
                      </div>
                      <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{t('product.detail_3')}</span>
                      </div>
                      <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{t('product.detail_4')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'ingredients' && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('product.ingredients')}</h3>
                    {ingredientsList && ingredientsList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ingredientsList.map((ingredient, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">{t('product.no_ingredients')}</p>
                    )}
                    
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex">
                        <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-yellow-800 text-sm">{t('product.allergy_warning')}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{t('product.customer_reviews')}</h3>
                        <div className="flex items-center mt-1">
                          <StarRating value={averageRating} interactive={false} />
                          <span className="ml-2 text-gray-600">
                            {averageRating.toFixed(1)} {t('product.out_of_5')}
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowReviewModal(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
                      >
                        {t('product.write_review')}
                      </motion.button>
                    </div>
                    
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {review.user ? review.user.name : 'Anonymous'}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    <StarRating value={review.rating} interactive={false} />
                                    <span className="ml-2 text-sm text-gray-500">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-gray-700 mt-2">{review.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 border-t border-gray-200">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>{t('product.no_reviews_yet')}</p>
                        <p className="text-sm mt-1">{t('product.be_first_to_review')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Similar products */}
            {similarProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-amber-100"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('product.similar_products')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {similarProducts.map((similarProduct) => (
                    <motion.div
                      key={similarProduct.id}
                      whileHover={{ y: -5 }}
                      className="border border-amber-200 rounded-lg overflow-hidden hover:shadow-md transition"
                    >
                      <div 
                        className="h-40 bg-amber-100 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${similarProduct.id}`)}
                      >
                        <img
                          src={
                            similarProduct.image
                              ? `${baseurl}/${similarProduct.image}`
                              : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={similarProduct.product_name}
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{similarProduct.product_name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-orange-600 font-semibold">
                            {t('common.currency', { value: similarProduct.price })}
                          </span>
                          <button 
                            onClick={() => addToCart(similarProduct, 1)}
                            className="text-gray-500 hover:text-orange-600 transition"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right sticky order form */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
              className="sticky top-28 bg-white rounded-2xl shadow-xl p-6 border border-amber-100"
            >
              <h2 className="text-xl font-bold mb-6 text-gray-900">{t('product.place_order')}</h2>
              
              {!user && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex">
                    <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-amber-800 text-sm">{t('product.guest_order_note')}</span>
                  </div>
                </div>
              )}
              
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">{t('product.total')}:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {t('common.currency', { value: (parseFloat(product.price) * quantity).toFixed(2) })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {quantity} × {t('common.currency', { value: product.price })}
                </p>
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-green-600 mt-1">
                    {t('product.you_save')} {t('common.currency', { value: (parseFloat(product.original_price - product.price) * quantity).toFixed(2) })}
                  </p>
                )}
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.name')} *
                  </label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    required
                    placeholder={t('product.name_placeholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.email')} {!user && '*'}
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    required={!user}
                    placeholder={t('product.email_placeholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    required
                    placeholder={t('product.phone_placeholder')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.city')} *
                  </label>
                  <select
                    value={userInfo.city}
                    onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
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
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.delivery_address')} *
                  </label>
                  <textarea
                    rows={3}
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition"
                    required
                    placeholder={t('product.address_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    {t('product.order_note')} ({t('common.optional')})
                  </label>
                  <textarea
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition"
                    placeholder={t('product.order_note_placeholder')}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || product.stock === 0}
                  className={`w-full py-4 rounded-lg font-semibold transition ${isPlacingOrder || product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg'
                    }`}
                >
                  {isPlacingOrder ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('product.placing_order')}
                    </div>
                  ) : product.stock === 0 ? (
                    t('product.out_of_stock')
                  ) : (
                    t('product.complete_purchase')
                  )}
                </motion.button>
                
                {!user && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {t('product.have_account')}{' '}
                    <button 
                      type="button" 
                      onClick={() => navigate('/login')}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      {t('common.login_here')}
                    </button>
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;