import { useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";

const backendURL = "http://localhost:8000"; // replace with your Render URL when deployed

export default function FileUploader() {
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${backendURL}/upload-file/`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.message) setUploaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Upload Resume</h2>
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition">
        <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
        <span className="text-gray-500 text-sm">
          Click or drag a PDF/DOCX/TXT file here
        </span>
        <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileUpload} />
      </label>

      {loading && <p className="text-blue-600 mt-2 text-sm">Uploading...</p>}
      {uploaded && !loading && (
        <p className="text-green-600 mt-2 flex items-center gap-1 text-sm">
          <CheckCircle className="w-4 h-4" /> Uploaded successfully
        </p>
      )}
    </div>
  );
}
