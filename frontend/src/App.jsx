import { useState } from "react";
import FileUploader from "./components/FileUploader";
import QueryBox from "./components/QueryBox";
import ResultCard from "./components/ResultCard";
import { UserRoundSearch } from "lucide-react";

export default function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <UserRoundSearch className="text-blue-600 w-8 h-8" />
        <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
          AI Resume Analyzer
        </h1>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-6 mt-6">
        {/* Left side: file upload + query */}
        <div className="flex-1 space-y-6">
          <FileUploader />
          {/* Default query changed */}
          <QueryBox
            setResult={setResult}
            defaultQuery="Extract complete candidate profile including name, contact info, education, experience, certifications, and skills."
          />
        </div>

        {/* Right side: results */}
        <div className="flex-1">
          {result ? (
            <ResultCard data={result} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic border border-dashed border-gray-300 rounded-2xl p-6 text-center">
              Upload a resume and click “Analyze” to generate a detailed profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
