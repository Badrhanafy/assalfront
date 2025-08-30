// src/pages/admin/QuickAction.jsx
const QuickAction = ({ title, description, icon, section }) => {
  const handleClick = () => {
    window.location.hash = section;
  };

  return (
    <button
      onClick={handleClick}
      className="relative group bg-white p-6 focus:outline-none border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-md transition-all"
    >
      <span className="text-2xl mb-3 block">{icon}</span>
      <span className="text-sm font-medium text-gray-900 group-hover:text-amber-600">{title}</span>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </button>
  );
};

export default QuickAction;