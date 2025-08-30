// src/pages/OrderHistory.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const isRTL = i18n.language === 'ar';
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:8000/api',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/user/orders');
            setOrders(response.data.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(t('orders.fetch_error'));
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const toastIt = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;

        setCancellingOrder(true);
        try {
            await axiosInstance.put(`/orders/${selectedOrder.id}`, {
                status: 'cancelled'
            });

            // Update local state
            setOrders(orders.map(order => 
                order.id === selectedOrder.id 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));

            setShowCancelDialog(false);
            toastIt(t('orders.cancel_success'), 'success');
        } catch (err) {
            console.error('Error cancelling order:', err);
            toastIt(t('orders.cancel_error'), 'error');
        } finally {
            setCancellingOrder(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            shipped: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const canCancelOrder = (order) => {
        return order.status === 'pending' || order.status === 'processing';
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            
            {/* Toast Notification */}
            <AnimatePresence>
                {toast.show && (
                    <motion.div
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
                            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                        }`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cancel Confirmation Dialog */}
            <AnimatePresence>
                {showCancelDialog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => !cancellingOrder && setShowCancelDialog(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {t('orders.cancel_confirm_title')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {t('orders.cancel_confirm_message')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowCancelDialog(false)}
                                    disabled={cancellingOrder}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancellingOrder}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancellingOrder ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {t('orders.cancelling')}
                                        </div>
                                    ) : (
                                        t('orders.confirm_cancel')
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{t('orders.my_orders')}</h1>
                    <p className="text-gray-600 mt-2">{t('orders.order_history')}</p>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('orders.no_orders')}</h3>
                        <p className="text-gray-500 mb-6">{t('orders.no_orders_desc')}</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            {t('orders.start_shopping')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {t('orders.order')} #{order.id}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(order.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                                {t(`orders.status.${order.status}`)}
                                            </span>
                                            {canCancelOrder(order) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowCancelDialog(true);
                                                    }}
                                                    className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium border border-red-200 rounded-md hover:bg-red-50 transition"
                                                >
                                                    {t('orders.cancel_order')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                {t('orders.shipping_address')}
                                            </h4>
                                            <p className="text-gray-600">{order.shipping_address}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                {t('orders.payment_info')}
                                            </h4>
                                            <p className="text-gray-600">
                                                {t('orders.payment_method')}: {order.payment_method}
                                            </p>
                                            <p className="text-gray-600">
                                                {t('orders.payment_status')}: {order.payment_status}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-4">
                                            {t('orders.order_items')}
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-4">
                                                        <img
                                                            src={item.product?.image ? `http://localhost:8000/storage/${item.product.image}` : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=100&q=80'}
                                                            alt={item.product?.product_name}
                                                            className="w-16 h-16 object-cover rounded"
                                                        />
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">
                                                                {item.product?.product_name}
                                                            </h5>
                                                            <p className="text-sm text-gray-500">
                                                                {t('orders.quantity')}: {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            {formatCurrency(item.total_price)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatCurrency(item.unit_price)} {t('orders.each')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-900">
                                                {t('orders.total')}
                                            </span>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {formatCurrency(order.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderHistory;