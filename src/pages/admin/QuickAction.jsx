// src/pages/admin/QuickAction.jsx
import { motion } from 'framer-motion';

const QuickAction = ({ title, description, icon, section, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(section);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group w-full text-left bg-white p-4 focus:outline-none border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start">
        <span className="text-2xl mr-4 mt-1">{icon}</span>
        <div>
          <span className="block text-sm font-medium text-gray-900 group-hover:text-amber-600 transition-colors">{title}</span>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
};

export default QuickAction;