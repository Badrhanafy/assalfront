// src/components/ProductDetails.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { addToCart } from '../utils/cartUtils';
import ClickSpark from '../components/ClickSpark';

const StarRating = ({ value = 0, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="flex space-x-1" dir="ltr"> {/* Force LTR for star rating */}
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => onChange(star)}
                    className={`w-7 h-7 cursor-pointer transition-colors duration-200 ${star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
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
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [orderNote, setOrderNote] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Review form state
    const [reviewStars, setReviewStars] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    // Auto-fill user info from localStorage
    const [userInfo, setUserInfo] = useState({
        name: '',
        phone: '',
        city: '',
        address: '',
    });

    const { id } = useParams();
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });

    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUserInfo({
                    name: parsed.name || '',
                    phone: parsed.phone || '',
                    city: parsed.city || '',
                    address: parsed.address || '',
                });
            } catch {
                /* ignore */
            }
        }
    }, []);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/products/${id}`);
                setProduct(data);
            } catch (err) {
                setError(t('product.fetch_error'));
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [id, t]);

    const toastIt = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        toastIt(t('product.added_to_cart', { quantity, name: product.product_name }));
    };

    const handleBuyNow = () => {
        if (!userInfo.name || !userInfo.phone || !userInfo.city || !userInfo.address) {
            toastIt(t('product.fill_info_error'), 'error');
            return;
        }
        const total = (parseFloat(product.price) * quantity).toFixed(2);
        toastIt(t('product.order_placed', { total }));
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        toastIt(t('product.review_thanks'));
        setShowReviewModal(false);
        setReviewStars(0);
        setReviewComment('');
    };

    if (loading)
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                />
            </div>
        );

    if (error)
        return (
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">{error}</div>
            </div>
        );

    if (!product)
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
                {t('product.not_found')}
            </div>
        );

    return (
        <>
            {/* Toast */}
            <Header /> <br /><br /><br />
            
 <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
            }`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {toast.message}
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
              <h3 className="text-lg font-bold mb-3">{t('product.leave_review')}</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">{t('product.your_rating')}</label>
                  <StarRating value={reviewStars} onChange={setReviewStars} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">{t('product.comment')}</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    required
                    placeholder={t('product.comment_placeholder')}
                  />
                </div>
                <div className={`flex ${isRTL ? 'flex-row-reverse space-x-reverse' : ''} space-x-2 justify-end`}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {t('common.submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          {/* Left scrollable side */}
          <div className="lg:w-2/3 space-y-8">
            {/* Product card */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    src={
                      product.image
                        ? `http://localhost:8000/${product.image}`
                        : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={product.product_name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-1/2 space-y-3">
                  <h1 className="text-3xl font-bold text-gray-900">{product.product_name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-indigo-600">
                      {t('common.currency', { value: product.price })}
                    </span>
                    {product.on_promo && (
                      <span className="text-sm bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                        {t('product.on_promo')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{product.description}</p>
                  {product.ingredients?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        {t('product.ingredients')}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {product.ingredients.map((i) => (
                          <span
                            key={i}
                            className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      {t('product.weight')}
                    </h3>
                    <p className="text-gray-600">{product.weight} g</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      {t('product.quantity')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                        aria-label={t('product.decrease_quantity')}
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                        aria-label={t('product.increase_quantity')}
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500 ml-2">
                        {t('product.available', { stock: product.stock })}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    {t('product.add_to_cart')}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Reviews section */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{t('product.customer_reviews')}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition"
                >
                  {t('product.publish_review')}
                </motion.button>
              </div>
              <div className="text-center py-8 text-gray-500">
                {t('product.no_reviews')}
              </div>
            </motion.div>

            {/* Similar products */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('product.similar_products')}</h2>
              <div className="text-center py-8 text-gray-500">{t('product.no_similar_products')}</div>
            </motion.div>
          </div>

          {/* Right sticky order form */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 150 }}
              className="sticky top-8 bg-white rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-bold mb-4">{t('product.complete_order')}</h2>
              <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">{t('product.total')}:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {t('common.currency', { value: (parseFloat(product.price) * quantity).toFixed(2) })}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {quantity} × {t('common.currency', { value: product.price })}
                </p>
              </div>

              <form className="space-y-3">
                {[
                  { key: 'name', label: t('product.name') },
                  { key: 'phone', label: t('product.phone') },
                  { key: 'city', label: t('product.city') },
                  { key: 'address', label: t('product.delivery_address') }
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1">
                      {label} *
                    </label>
                    {key === 'address' ? (
                      <textarea
                        name={key}
                        rows={3}
                        value={userInfo[key]}
                        onChange={(e) => setUserInfo({ ...userInfo, [key]: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        required
                        placeholder={t('product.address_placeholder')}
                      />
                    ) : (
                      <input
                        type={key === 'phone' ? 'tel' : 'text'}
                        name={key}
                        value={userInfo[key]}
                        onChange={(e) => setUserInfo({ ...userInfo, [key]: e.target.value })}
                        className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                        placeholder={label}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('product.order_note')} ({t('common.optional')})
                  </label>
                  <textarea
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder={t('product.order_note_placeholder')}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
                >
                  {t('product.complete_purchase')}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
           
        </>
    );
};

export default ProductDetails;