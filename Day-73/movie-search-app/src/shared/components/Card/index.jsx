// src/shared/components/Card/index.jsx

function Card({ children, className = '', onClick, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;