// src/components/WaveSVG.jsx
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const WaveSVG = () => {
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      className="absolute bottom-0 w-full"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="#ffd700"
          fillOpacity="1"
          d="M0,192L60,176C120,160,240,128,360,128C480,128,600,160,720,154.7C840,149,960,107,1080,106.7C1200,107,1320,149,1380,170.7L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        ></path>
      </svg>
    </motion.div>
  );
};

export default WaveSVG;
