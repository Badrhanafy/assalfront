// src/components/ProductCard.jsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { addToCart } from '../utils/cartUtils';
import { useToast } from '../contexts/ToastContext';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const baseurl = import.meta.env.VITE_BACKEND_ENDPOINT;

  const handleAddToCart = () => {
    addToCart(product, 1);
    addToast(
      t('home.product_added_to_cart', { product: product.product_name }),
      'success'
    );
  };

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div 
        className="h-48 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${product.image.startsWith('http') 
            ? product.image 
            : `${baseurl}/${product.image}`})` 
        }}
      >
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-amber-900">{product.product_name}</h3>
          <span className="bg-amber-100 text-amber-700 text-sm font-medium px-2 py-1 rounded">
            {t('common.currency', { value: product.price })}
          </span>
        </div>
        <p className="text-amber-600 mb-4">
          {t('home.weight')}: {product.weight}
        </p>
        
        {/* Buttons container */}
        <div className="flex space-x-2">
          {/* See Details Button (Link) */}
          <a 
            href={`/products/${product.id}`}
            className="flex-1 bg-white border border-amber-500 text-amber-500 hover:bg-amber-50 py-2 rounded-lg transition-colors text-center"
          >
            {t('home.view_details')}
          </a>
          
          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition-colors"
          >
            {t('home.add_to_cart')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;