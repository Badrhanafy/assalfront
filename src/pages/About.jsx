// About.jsx
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Lottie from 'lottie-react';
import animationData from '../assets/Honeybee.json';
import DotGrid from '../components/Animating/DotGrid';

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  /* Honey-drip shine on hover */
  useEffect(() => {
    const cards = document.querySelectorAll('.shine');
    const moveShine = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--x', `${x}%`);
      card.style.setProperty('--y', `${y}%`);
    };
    cards.forEach((c) => c.addEventListener('mousemove', moveShine));
    return () =>
      cards.forEach((c) => c.removeEventListener('mousemove', moveShine));
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        background:
          'radial-gradient(ellipse at top, #2a1a05 0%, #0f0a01 60%, #000 100%)',
      }}
    >
      {/* animated DotGrid */}
      <div className="fixed inset-0 -z-20" >
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#8B4513"
          activeColor="#8B4513"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* subtle vignette */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

      <Header />

      <main className="flex-grow">
        {/* HERO */}
        <section className="container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-amber-50 leading-tight">
                {t('about.hero.title')}
              </h1>
              <p className="mt-6 text-amber-200/80 text-xl max-w-2xl">
                {t('about.hero.description')}
              </p>
            </div>
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-amber-600/30 rounded-full blur-2xl scale-90 group-hover:scale-125 transition-transform duration-700" />
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  className="w-72 h-72 relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className={isRTL ? 'md:order-2' : ''}>
              <h2 className="text-4xl font-serif font-bold text-amber-50 mb-6">
                {t('about.story.title')}
              </h2>
              <div className="space-y-4 text-amber-200/80 text-lg leading-relaxed">
                <p>{t('about.story.paragraph1')}</p>
                <p>{t('about.story.paragraph2')}</p>
                <p>{t('about.story.paragraph3')}</p>
              </div>
            </div>
            <div className={isRTL ? 'md:order-1' : ''}>
              <div className="relative group shine overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
                  alt={t('about.story.image_alt')}
                  className="w-full h-auto scale-110 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-serif font-bold text-amber-50">
              {t('about.values.title')}
            </h2>
            <p className="mt-4 text-amber-200/70">
              {t('about.values.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('about.values.purity.title'),
                desc: t('about.values.purity.description'),
                icon: (
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
              },
              {
                title: t('about.values.sustainability.title'),
                desc: t('about.values.sustainability.description'),
                icon: (
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                ),
              },
              {
                title: t('about.values.healing.title'),
                desc: t('about.values.healing.description'),
                icon: (
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
              },
            ].map((val, i) => (
              <div
                key={i}
                className="relative shine group/card bg-amber-50/5 backdrop-blur-md border border-amber-50/10 rounded-2xl p-8 text-center overflow-hidden"
              >
                {/* shine layer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at var(--x,50%) var(--y,50%), #d4af3730 0%, transparent 70%)',
                  }}
                />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-amber-900 mb-6">
                    <svg
                      className="w-10 h-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {val.icon}
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-amber-50 mb-3">
                    {val.title}
                  </h3>
                  <p className="text-amber-200/70">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONSERVATION */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-3">
              <h2 className="text-4xl font-serif font-bold text-amber-50 mb-6">
                {t('about.conservation.title')}
              </h2>
              <div className="space-y-4 text-amber-200/80 text-lg">
                <p>{t('about.conservation.paragraph1')}</p>
                <p>{t('about.conservation.paragraph2')}</p>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/30 to-amber-600/30 rounded-full blur-2xl scale-90 group-hover:scale-125 transition-transform duration-700" />
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  className="w-72 h-72 relative z-10 drop-shadow-2xl"
                />
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