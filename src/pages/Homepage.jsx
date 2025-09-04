// src/pages/Homepage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeaturesSection from '../components/FeaturesSection';
import TrueFocus from '../components/Animating/TrueFocus';
import { AnimatedTestimonialsDemo } from '../components/testimonials';
import manahil from '../assets/manahil.jpg'
import bee from '../assets/bee.jpg'
import ScrollVelocity from '../components/Animating/ScrollVelocity';
import ClickSpark from '../components/Animating/ClickSpark';
import { ScrollProgress } from '../components/animate-ui/radix/scroll-progress';
import ProductCard from '../components/ProductCard';
import Lottie from 'lottie-react';
import animationData from '../assets/honeyloader.json'

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_ENDPOINT;

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

// Touch swipe detection hook
const useSwipe = (onSwipeLeft, onSwipeRight) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance to trigger navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Main component
export default function Homepage() {
  const { t, i18n } = useTranslation();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const baseurl = import.meta.env.VITE_BACKEND_ENDPOINT;
  const isRTL = i18n.language === 'ar';

  const sliderRef = useRef();

  // Swipe handlers
  const swipeHandlers = useSwipe(
    () => nextSlide(), // Swipe left goes to next slide
    () => prevSlide()  // Swipe right goes to previous slide
  );

  useEffect(() => {
    fetchSlides();
    fetchProducts();
  }, []);

  useEffect(() => {
    let interval;
    if (slides.length > 0 && isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [slides, isAutoPlaying]);

  const fetchSlides = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/slides`);
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
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
      const response = await axios.get(`${baseurl}/api/products`);
      setProducts(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching products:', error);
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
    setIsAutoPlaying(true); // Restart auto-play after manual navigation
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setIsAutoPlaying(true); // Restart auto-play after manual navigation
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(true); // Restart auto-play after manual navigation
  };

  // Pause auto-play when user interacts with slider
  const handleSliderInteraction = () => {
    setIsAutoPlaying(false);
    // Restart auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {/* Hero Slider Section */}
      {!loading && slides.length > 0 && (
        <section
          className="relative h-[50vh] sm:h-[70vh] md:h-screen max-h-[800px] overflow-hidden bg-black"
          ref={sliderRef}
          {...swipeHandlers}
          onClick={handleSliderInteraction}
          onTouchStart={handleSliderInteraction}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(http://localhost:8000/storage/${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-3xl mx-auto w-full">
                    {slide.title && (
                      <motion.h1
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold mb-4 px-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        {slide.title}
                      </motion.h1>
                    )}
                    {slide.description && (
                      <motion.p
                        className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {slide.description}
                      </motion.p>
                    )}
                    {slide.link && (
                      <motion.a
                        href={slide.link}
                        className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 md:py-3 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      >
                        {slide.cta_text || t('home.learn_more')}
                      </motion.a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls - Hidden on mobile when only 1 slide */}
          {slides.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                className={`hidden sm:block absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 md:p-3 rounded-full transition-all duration-200 ${isRTL ? 'right-2 md:right-4' : 'left-2 md:left-4'
                  }`}
                aria-label={t('home.previous_slide')}
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                className={`hidden sm:block absolute top-1/2 transform -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-2 md:p-3 rounded-full transition-all duration-200 ${isRTL ? 'left-2 md:left-4' : 'right-2 md:right-4'
                  }`}
                aria-label={t('home.next_slide')}
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>

              {/* Mobile Touch Indicators */}
              <div className="sm:hidden absolute inset-0 z-20 flex justify-between items-center px-2">
                <div
                  className="h-full w-1/4 flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevSlide();
                  }}
                >
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                    </svg>
                  </div>
                </div>
                <div
                  className="h-full w-1/4 flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextSlide();
                  }}
                >
                  <div className="bg-white bg-opacity-20 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Slider Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                    }}
                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'bg-white scale-125'
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    aria-label={t('home.go_to_slide', { number: index + 1 })}
                  />
                ))}
              </div>

              {/* Auto-play Indicator */}
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAutoPlaying(!isAutoPlaying);
                  }}
                  className="bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-colors"
                  aria-label={isAutoPlaying ? t('home.pause_slideshow') : t('home.play_slideshow')}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    {isAutoPlaying ? (
                      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Loading State for Slider */}
      {loading && (
        <section className="relative h-screen max-h-[800px] overflow-hidden bg-transparent flex items-center justify-center">
          <div className="text-center">
            <div className='w-40 h-40 md:w-56 md:h-56 mx-auto'>
              <Lottie
                animationData={animationData}
                loop={true}
                className="w-full"
              />
            </div>
            <p className="text-gray-600 mt-4 text-sm md:text-base">{t('home.loading_slides')}</p>
          </div>
        </section>
      )}

      <ScrollVelocity
        texts={['Al-Naaman Apiaries from nature directly to your hands',
          'مناحل النعمان  من الطبيعة الى يديك مباشرة']}
        velocity={8}
        className="custom-scroll-text text-3xl md:text-4xl lg:text-5xl pb-2 bg-yellow-500 px-4"
      />

      {/* Products Section */}
      <AnimatedSection id="products" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto px-0" style={{ zIndex: "1000" }}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-center text-amber-900 mb-4 px-4">
            {t('home.popular_products')}
          </h2>
          <p className="text-center text-amber-700 max-w-2xl mx-auto mb-8 md:mb-12 px-4 text-sm md:text-base">
            {t('home.products_description')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-8 md:mt-12 px-4">
            <a
              href="/products"
              className="inline-block border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white font-semibold py-2 px-6 md:py-3 md:px-8 rounded-full transition-all duration-300 text-sm md:text-base"
            >
              {t('home.view_all_products')}
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Rest of your components remain the same */}
      <AnimatedSection className="bg-white">
        <FeaturesSection />
      </AnimatedSection>

      <AnimatedSection className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${isRTL ? 'md:grid-cols-2' : ''}`}>
            <div className={isRTL ? 'md:order-2' : ''}>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-amber-900 mb-4 md:mb-6">
                <TrueFocus
                  sentence={t('home.our_story')}
                  manualMode={false}
                  blurAmount={5}
                  borderColor="red"
                  animationDuration={2}
                  pauseBetweenAnimations={1}
                />
              </h2>
              <p className="text-amber-700 mb-4 text-sm md:text-base">
                {t('home.story_paragraph1')}
              </p>
              <p className="text-amber-700 text-sm md:text-base">
                {t('home.story_paragraph2')}
              </p>
            </div>
            <div className={isRTL ? 'md:order-1' : ''}>
              <img
                src={manahil}
                alt={t('home.beekeeper_alt')}
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
        </div>
      </AnimatedSection>

      <ClickSpark
        sparkColor='#fff'
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <AnimatedSection className="reviews cursor-pointer">
          <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none"></div>
          <div className="relative z-20">
            <AnimatedTestimonialsDemo />
          </div>
        </AnimatedSection>
      </ClickSpark>

      <Footer />
      <ScrollProgress className='' />
    </div>
  );
}