// src/pages/Homepage.jsx
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import TrueFocus from '../components/Animating/TrueFocus';
// Configure axios
axios.defaults.baseURL = 'http://localhost:8000/api';

// Reusable animated container
const AnimatedSection = ({ children, className = '' }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [controls, inView]);

  return (
    <motion.section
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 60 },
      }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// Main component
export default function Homepage() {
  const { t, i18n } = useTranslation();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchSlides();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/slides');
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
      // Fallback slides with translated content
      setSlides([
        {
          id: 1,
          title: t('home.slide1.title'),
          description: t('home.slide1.description'),
          cta_text: t('home.slide1.cta_text'),
          image: "slides/laOS2wiSROuwWZtnVF191Dku0CNokfor7oXsiIBP0.jpg",
          link: "/products"
        },
        {
          id: 2,
          title: t('home.slide2.title'),
          description: t('home.slide2.description'),
          cta_text: t('home.slide2.cta_text'),
          image: "slides/5vHe67JZXotONA8sJjhoistLPPwrCPNFITRVqGbV.jpg",
          link: "/products?promo=true"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/products');
      setProducts(response.data.slice(0, 3)); // Show only 3 products on homepage
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fallback products with translated content
      setProducts([
        {
          id: 1,
          product_name: t('home.products.raw_honey.name'),
          price: 14.99,
          weight: '500g',
          image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=600&q=60',
        },
        {
          id: 2,
          product_name: t('home.products.cinnamon_honey.name'),
          price: 16.99,
          weight: '450g',
          image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=60',
        },
        {
          id: 3,
          product_name: t('home.products.comb_honey.name'),
          price: 19.50,
          weight: '400g',
          image: 'https://images.unsplash.com/photo-1603565832960-5dc3c6f2fdd0?auto=format&fit=crop&w=600&q=60',
        },
      ]);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen " dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {/* Hero Slider Section */}
      {!loading && slides.length > 0 && (
        <section className="relative h-screen max-h-[800px] overflow-hidden bg-black">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(http://localhost:8000/storage/${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-3xl">
                    <motion.h1
                      className="text-4xl md:text-6xl font-serif font-bold mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      className="text-xl md:text-2xl mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      {slide.description}
                    </motion.p>
                    <motion.a
                      href={slide.link || "#products"}
                      className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      {slide.cta_text || t('home.learn_more')}
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className={`absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full ${isRTL ? 'right-4' : 'left-4'
                  }`}
                aria-label={t('home.previous_slide')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className={`absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full ${isRTL ? 'left-4' : 'right-4'
                  }`}
                aria-label={t('home.next_slide')}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>

              {/* Slider Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    aria-label={t('home.go_to_slide', { number: index + 1 })}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Loading State for Slider */}
      {loading && (
        <section className="relative h-screen max-h-[800px] overflow-hidden bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('home.loading_slides')}</p>
          </div>
        </section>
      )}

      {/* Features Section */}
      <AnimatedSection className="py-16 bg-white">
        <FeaturesSection />
      </AnimatedSection>

      {/* Products Section */}
      <AnimatedSection id="products" className="py-16  bg-amber-100" >
        <div className="container mx-auto px-4" style={{zIndex:"1000"}}>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-amber-900 mb-4">
            {t('home.popular_products')}
          </h2>
          <p className="text-center text-amber-700 max-w-2xl mx-auto mb-12">
            {t('home.products_description')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(http://localhost:8000/${product.image})` }}></div>
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
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg transition-colors">
                    {t('home.add_to_cart')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/products"
              className="inline-block border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold py-3 px-8 rounded-full transition-all duration-300"
            >
              {t('home.view_all_products')}
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRTL ? 'md:grid-cols-2' : ''}`}>
            <div className={isRTL ? 'md:order-2' : ''}>
              <h2 className="text-3xl font-serif font-bold text-amber-900 mb-6">
                <TrueFocus
                  sentence={t('home.our_story')}
                  manualMode={false}
                  blurAmount={5}
                  borderColor="red"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                />
              </h2>
              <p className="text-amber-700 mb-4">
                {t('home.story_paragraph1')}
              </p>
              <p className="text-amber-700">
                {t('home.story_paragraph2')}
              </p>
            </div>
            <div className={isRTL ? 'md:order-1' : ''}>
              <img
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
                alt={t('home.beekeeper_alt')}
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-amber-900 mb-12">
            {t('home.testimonials')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="text-amber-500 text-2xl">★★★★★</div>
              </div>
              <p className="text-amber-700 mb-4">
                {t('home.testimonial1.text')}
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-700 font-semibold">SG</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">{t('home.testimonial1.author')}</p>
                  <p className="text-sm text-amber-600">{t('home.testimonial1.role')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="text-amber-500 text-2xl">★★★★★</div>
              </div>
              <p className="text-amber-700 mb-4">
                {t('home.testimonial2.text')}
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-700 font-semibold">MJ</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">{t('home.testimonial2.author')}</p>
                  <p className="text-sm text-amber-600">{t('home.testimonial2.role')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-md"
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center mb-4">
                <div className="text-amber-500 text-2xl">★★★★★</div>
              </div>
              <p className="text-amber-700 mb-4">
                {t('home.testimonial3.text')}
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-amber-200 rounded-full flex items-center justify-center mr-3">
                  <span className="text-amber-700 font-semibold">ER</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-900">{t('home.testimonial3.author')}</p>
                  <p className="text-sm text-amber-600">{t('home.testimonial3.role')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* Newsletter Section */}
      <AnimatedSection className="py-16 bg-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t('home.newsletter.title')}</h2>
          <p className="max-w-2xl mx-auto mb-8 text-amber-100">
            {t('home.newsletter.description')}
          </p>
          <form className="max-w-md mx-auto flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder={t('home.newsletter.placeholder')}
              className="flex-grow px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-white text-amber-700 font-semibold px-6 py-3 rounded-lg hover:bg-amber-100 transition-colors"
            >
              {t('home.newsletter.button')}
            </button>
          </form>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
}