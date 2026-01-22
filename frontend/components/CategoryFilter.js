const categories = [
  'All',
  'Music',
  'Sports',
  'Conference',
  'Workshop',
  'Festival',
  'Theater',
  'Comedy',
  'Food & Drink',
  'Other'
]

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelect && onSelect(category === 'All' ? null : category)}
          className={`px-4 py-2 rounded-full font-semibold transition ${
            (selected === category || (!selected && category === 'All'))
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
