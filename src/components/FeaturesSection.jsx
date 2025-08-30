// src/components/FeaturesSection.jsx
import { useTranslation } from 'react-i18next';
import CardSwap, { Card } from '../components/Animating/CardSwap';
import { Link } from 'react-router-dom';
import healing from '../assets/imgi_29_default.jpg';
import makinghoney from '../assets/makinghoney.jpg';
const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      key: 'natural',
      icon: '🌿',
      title: t('home.features.natural.title'),
      desc: t('home.features.natural.description'),
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    },
    {
      key: 'healing',
      icon: '✨',
      title: t('home.features.healing.title'),
      desc: t('home.features.healing.description'),
      img: healing,
    },
    {
      key: 'love',
      icon: '❤️',
      title: t('home.features.love.title'),
      desc: t('home.features.love.description'),
      img: makinghoney,
    },
  ];

  return (
    <section className="py-16 bg-white px-4 md:px-10" style={{
        
    }}>
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('home.why_choose_us')}
          </h2>
          <p className="text-gray-600">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Omnis totam mollitia consequatur praesentium, fugit sapiente, ex pariatur veniam, iure suscipit distinctio nobis odit possimus quibusdam! Fugit aut inventore consequuntur deleniti!
          </p>
          <Link to={''} className="text-yellow-600 font-medium hover:underline">
            Read More
          </Link>
        </div>

        {/* Right Column - Animated Cards */}
        <div className="relative w-full h-96 lg:h-[400px] flex justify-center items-center">
          <CardSwap
            cardDistance={20}
            verticalDistance={60}
            delay={4000}
            pauseOnHover={true}
          >
            {features.map(({ key, icon, title, desc, img }) => (
              <Card
                key={key}
                className="rounded-xl shadow-lg bg-cover bg-center text-white"
                style={{ backgroundImage: `url(${img})` }}
              >
                <div className="p-6 text-center bg-black/40 rounded-xl">
                  <div className="w-16 h-16 mb-4 mx-auto flex items-center justify-center rounded-full bg-amber-100 text-2xl">
                    {icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-sm">{desc}</p>
                </div>
              </Card>
            ))}
          </CardSwap>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
