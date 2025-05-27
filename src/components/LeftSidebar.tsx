export default function LeftSidebar({ selected, onChange }) {
  const options = [
    { value: "question_01", label: "Question 01" },
    { value: "question_02", label: "Question 02" },
  ];

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2 text-gray-300">Select Question</h2>
      <ul className="space-y-2">
        {options.map((opt) => (
          <li
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`cursor-pointer px-3 py-2 rounded-full text-gray-300 border border-gray-700 ${
              selected === opt.value
                ? "bg-gray-500 text-white shadow-xs shadow-gray-800"
                : "hover:bg-gray-400"
            }`}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
