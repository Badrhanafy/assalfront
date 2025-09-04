// src/components/FeaturesSection.jsx
import { useTranslation } from 'react-i18next';
import CardSwap, { Card } from '../components/Animating/CardSwap';
import { Link } from 'react-router-dom';
import healing from '../assets/imgi_29_default.jpg';
import makinghoney from '../assets/makinghoney.jpg';
import bg from '../assets/backg.jpg'
import BlurText from "../components/ui/Animating/BlurText";
import SplitText from "../components/ui/Animating/SplitText";

const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

const FeaturesSection = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

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
    <div
      className="bg-cover bg-center"
      style={{
        backgroundImage: `url(${bg})`,
      }}
    >
      <section className="py-16 px-4 md:px-10 relative bg-black/50">
        <div className={`container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative md:bottom-24 ${isRTL ? 'lg:gap-24' : ''}`}>
          {/* Left Column - Text */}
          <div className={`space-y-6 ${isRTL ? 'lg:order-2' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
            {t('home.why_choose_us')}
            </h2>
            <p className="text-white">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Et ex culpa iure earum sit impedit, laborum numquam hic. Officia harum quaerat, a dolores suscipit beatae quam reprehenderit vitae laboriosam ea. Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae libero natus et magnam ut corporis quasi nam vero iure maiores delectus minus fuga aliquam doloremque laborum fugiat, quae sunt in!
            </p>
            <Link
              to={''}
              style={{
                border:"1px solid orange"
              }}
              className="
    inline-block
    px-6 py-3
    text-white
    font-medium
    bg-none
    
    rounded-none
    relative
    overflow-hidden
    group
    transition-colors
    duration-300
  "
            >
              <span className="relative z-10 group-hover:text-white">{t('home.read_more')}</span>
              <span className="absolute inset-0 bg-orange-500 w-0 group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
          </div>
{/* Right Column - Animated Cards */}
<div 
  className={`
    relative 
    w-full 
    max-w-[500px] 
    h-80 sm:h-96 lg:h-[400px]  
    flex justify-center items-center 
    mx-auto
    ${isRTL ? 'lg:mr-8' : 'lg:ml-8'}
  `}
>
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
        <div className="p-6 text-center bg-black/50 h-full rounded-xl border border-orange-500">
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
    </div>
  );
};

export default FeaturesSection;