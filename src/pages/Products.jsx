import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom';

const Products = () => {
    const { t, i18n } = useTranslation();
    const [products, setProds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/products');
                setProds(response.data);
            } catch (err) {
                setError(t('products.fetch_error'));
                console.error('Error fetching products:', err);
                // Fallback products with translated content
                setProds([
                    {
                        id: 1,
                        name: t('products.fallback.manuka.name'),
                        price: 24.99,
                        weight: "500g",
                        onPromo: true,
                        description: t('products.fallback.manuka.description'),
                        ingredients: [t('products.fallback.manuka.ingredient1'), t('products.fallback.manuka.ingredient2')],
                        image: "https://images.unsplash.com/photo-1558645830-e2a3f5df8a4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
                    },
                    {
                        id: 2,
                        name: t('products.fallback.lavender.name'),
                        price: 19.99,
                        weight: "400g",
                        onPromo: false,
                        description: t('products.fallback.lavender.description'),
                        ingredients: [t('products.fallback.lavender.ingredient1'), t('products.fallback.lavender.ingredient2')],
                        image: "https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
                    },
                    {
                        id: 3,
                        name: t('products.fallback.ginger.name'),
                        price: 22.99,
                        weight: "450g",
                        onPromo: true,
                        description: t('products.fallback.ginger.description'),
                        ingredients: [t('products.fallback.ginger.ingredient1'), t('products.fallback.ginger.ingredient2'), t('products.fallback.ginger.ingredient3')],
                        image: "https://images.unsplash.com/photo-1558645830-e2a3f5df8a4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [t]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">{t('products.loading')}</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
                    
                <main className="flex-grow container mx-auto px-4 py-8 mt-24">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800 text-center">
                        {error}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
            <Header /><br /><br /><br />

            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-4xl font-serif font-bold text-center text-secondary-800 mb-4">
                    {t('products.title')}
                </h1>
                <p className="text-center text-secondary-600 max-w-2xl mx-auto mb-8">
                    {t('products.description')}
                </p>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🍯</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('products.no_products')}</h3>
                        <p className="text-gray-500">{t('products.check_back')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => (
                            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                                <div className="h-48 bg-cover bg-center relative" style={{ 
                                    backgroundImage: `url(${product.image?.startsWith('http') ? product.image : `http://localhost:8000/${product.image}`})` 
                                }}>
                                    {product.on_promo && (
                                        <div className="absolute top-4 right-4 bg-primary-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                                            {t('products.on_promo')}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className={`flex justify-between items-start mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <h3 className="text-xl font-semibold text-secondary-800">
                                            {product.product_name || product.name}
                                        </h3>
                                        <span className="text-primary-600 font-bold">
                                            {t('common.currency', { value: product.price })}
                                        </span>
                                    </div>
                                    <p className="text-secondary-600 mb-4">
                                        {product.description}
                                    </p>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-secondary-700 mb-1">
                                            {t('products.ingredients')}:
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(product.ingredients) && product.ingredients.map((ingredient, index) => (
                                                <span 
                                                    key={index} 
                                                    className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded"
                                                >
                                                    {ingredient}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-secondary-500 text-sm">
                                            {t('products.weight')}: {product.weight}
                                        </span>
                                        <button className="bg-orange-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                                            <Link to={`/product/Deetails/${product.id}`}>
                                                {t('products.see_details')}
                                            </Link>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Products;