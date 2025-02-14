// components/CategoryTabs.js
export function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      {Object.values(categories).map((category) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeCategory === category.key
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {category.value}
        </button>
      ))}
    </div>
  );
}
