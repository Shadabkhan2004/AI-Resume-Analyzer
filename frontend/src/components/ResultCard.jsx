export default function ResultCard({ data }) {
  if (!data) return null;

  const renderSection = (title, content) => {
    if (!content) return null;
    if (Array.isArray(content) && content.length === 0) return null;

    return (
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-blue-600 mb-2">{title}</h3>
        {Array.isArray(content) ? (
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {content.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 whitespace-pre-line">{content}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      {renderSection("Name", data.name)}
      {renderSection("Contact", data.contact)}
      {renderSection("Summary", data.summary)}
      {renderSection("Education", data.education)}
      {renderSection("Experience", data.experience)}
      {renderSection("Certifications", data.certifications)}
      {renderSection("Programming Languages", data.programming_languages)}
      {renderSection("Frameworks", data.frameworks)}
      {renderSection("Tools", data.tools)}
      {renderSection("Soft Skills", data.soft_skills)}
      {renderSection("Other Skills", data.other_skills)}
    </div>
  );
}
