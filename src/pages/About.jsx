import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Lottie from "lottie-react";
import animationData from "../assets/Honeybee.json";

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Bee Animation Grid */}
        <section className="bg-primary-50 py-16">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 lg:grid-cols-5 gap-8 items-center ${isRTL ? 'lg:grid-cols-5' : ''}`}>
              {/* Text Content - 3 columns */}
              <div className="lg:col-span-3">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-secondary-800 mb-6">
                  {t('about.hero.title')}
                </h1>
                <p className="text-xl text-secondary-600 max-w-3xl">
                  {t('about.hero.description')}
                </p>
              </div>
              
              {/* Bee Animation - 2 columns */}
              <div className="lg:col-span-2 flex justify-center lg:justify-end">
                <div className="w-full max-w-xs">
                  <Lottie 
                    animationData={animationData} 
                    loop 
                    autoplay 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Story Section with Alternating Layout */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${isRTL ? 'md:grid-cols-2' : ''}`}>
              <div className={isRTL ? 'md:order-2' : ''}>
                <h2 className="text-3xl font-serif font-bold text-secondary-800 mb-6">
                  {t('about.story.title')}
                </h2>
                <p className="text-secondary-600 mb-4">
                  {t('about.story.paragraph1')}
                </p>
                <p className="text-secondary-600 mb-4">
                  {t('about.story.paragraph2')}
                </p>
                <p className="text-secondary-600">
                  {t('about.story.paragraph3')}
                </p>
              </div>
              <div className={isRTL ? 'md:order-1 order-first' : 'order-first md:order-last'}>
                <img 
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
                  alt={t('about.story.image_alt')} 
                  className="rounded-lg shadow-md w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Values Section with Grid Layout */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 lg:grid-cols-4 gap-8 items-center mb-12 ${isRTL ? 'lg:grid-cols-4' : ''}`}>
              <div className="lg:col-span-3">
                <h2 className="text-3xl font-serif font-bold text-secondary-800">
                  {t('about.values.title')}
                </h2>
                <p className="text-secondary-600 mt-4">
                  {t('about.values.description')}
                </p>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="w-32">
                  <Lottie 
                    animationData={animationData} 
                    loop 
                    autoplay 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                  {t('about.values.purity.title')}
                </h3>
                <p className="text-secondary-600">
                  {t('about.values.purity.description')}
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                  {t('about.values.sustainability.title')}
                </h3>
                <p className="text-secondary-600">
                  {t('about.values.sustainability.description')}
                </p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-secondary-800 mb-2">
                  {t('about.values.healing.title')}
                </h3>
                <p className="text-secondary-600">
                  {t('about.values.healing.description')}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        

        {/* Bee Conservation Section */}
        <section className="py-16 bg-secondary-800 text-white">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 md:grid-cols-5 gap-8 items-center ${isRTL ? 'md:grid-cols-5' : ''}`}>
              <div className="md:col-span-3">
                <h2 className="text-3xl font-serif font-bold mb-6">
                  {t('about.conservation.title')}
                </h2>
                <p className="mb-4">
                  {t('about.conservation.paragraph1')}
                </p>
                <p>
                  {t('about.conservation.paragraph2')}
                </p>
              </div>
              <div className="md:col-span-2 flex justify-center">
                <div className="w-full max-w-xs">
                  <Lottie 
                    animationData={animationData} 
                    loop 
                    autoplay 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;