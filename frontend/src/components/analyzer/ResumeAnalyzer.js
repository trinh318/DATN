import React, { useState } from 'react';
import { LoaderCircle, Search, ClipboardList } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Button } from '@/components/control/ui/button';
import { formatSummaryMarkdown, formatSuggestMarkdown, formatOptimizerMarkdown } from '@/libs/formatSummaryMarkdown';
import Header from '../CVAI/custom/Header';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobOffer, setJobOffer] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [updatedResume, setUpdatedResume] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chartBase64, setChartBase64] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis');
  const handleTabClick = (tab) => setActiveTab(tab);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setSelectedFile(file);

    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    handleUpload(file);
  };

  const handleUpload = async (uploadFile) => {
    if (!uploadFile) return alert("Please upload a resume file.");

    const formData = new FormData();
    formData.append('file', uploadFile);

    const res = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log(data.resume_text);
    setResumeText(data.resume_text);
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:8000/analyze-with-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_offer_text: jobOffer,
          job_title: jobTitle,
          model_name: 'gemini-1.5-flash-latest',
          provider: 'google',
          api_key: process.env.REACT_APP_GOOGLE_AI_API_KEY,
          temperature: 0.3
        })
      });

      const data = await response.json();
      setAnalysisResult(data);
      console.log(analysisResult);
      setChartBase64(data.chart_base64);
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('An error occurred while analyzing the resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    try {
      setLoading(true);

      const response = await fetch('http://localhost:8000/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_offer_text: jobOffer,
          job_title: jobTitle,
          model_name: 'gemini-1.5-flash-latest',
          provider: 'google',
          api_key: process.env.REACT_APP_GOOGLE_AI_API_KEY,
          temperature: 0.3
        })
      });

      const data = await response.json();
      setSuggestions(data.suggestions);
      console.log(data.suggestions);
    } catch (error) {
      console.error('Error suggesting changes:', error);
      alert('An error occurred while suggesting changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('resume_text', resumeText);
      formData.append('job_offer_text', jobOffer);
      formData.append('job_title', jobTitle);
      formData.append('model_name', 'gemini-1.5-flash-latest');
      formData.append('provider', 'google');
      formData.append('api_key', process.env.REACT_APP_GOOGLE_AI_API_KEY);
      formData.append('temperature', '0.3');
      formData.append('suggestions', suggestions);

      const response = await fetch('http://localhost:8000/apply', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setUpdatedResume(data.updated_resume);
      console.log(data.updated_resume);
    } catch (error) {
      console.error('Error applying suggestions:', error);
      alert('An error occurred while applying suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: analysisResult ? Object.keys(analysisResult.scores) : [],
    datasets: [
      {
        label: 'Score',
        data: analysisResult ? Object.values(analysisResult.scores) : [],
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          backdropColor: 'transparent',
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const handleAnalyzeAndSuggest = async () => {
    await handleAnalyze();
    await handleSuggest();
    await handleApply();
  };

  return (
    <div>
      <Header />
      <div className="h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row h-full overflow-auto">
          {/* Sidebar Left */}
          <div className="w-full lg:w-[400px] border-r bg-white p-4 overflow-y-auto h-full">
            {/* Upload Card */}
            <div className="bg-white p-4 rounded-2xl shadow mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Upload your resume
              </label>
              <div className="flex flex-col items-start gap-4">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                />
              </div>
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>📄 {selectedFile.name}</p>
                  {previewUrl && (
                    <iframe
                      src={previewUrl}
                      className="mt-2 border rounded-lg"
                      width="100%"
                      height="300"
                      title="Resume Preview"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Job Title + Analyze */}
            <div className="bg-white p-4 rounded-2xl shadow mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🏷️ Job Title
              </label>
              <input
                type="text"
                placeholder="Enter Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-sm"
              />
            </div>

            {/* Job Description Card */}
            <div className="bg-white p-4 rounded-2xl shadow">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Job Description
              </label>
              <textarea
                rows={5}
                placeholder="Paste job offer description here..."
                value={jobOffer}
                onChange={(e) => setJobOffer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none">
              </textarea>
              <Button
                onClick={handleAnalyzeAndSuggest}
                disabled={loading}
                className={`w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin mr-2" size={16} />
                ) : (
                  <Search className="inline mr-2" size={16} />
                )}
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </div>
          </div>

          {/* Result Right */}
          <div className="flex-1 p-6 space-y-4 bg-gray-50 overflow-y-auto h-full">
            <h1 className="text-2xl font-semibold">LLM Resume Analyser</h1>

            <div className="flex gap-2 text-sm text-gray-600">
              <span
                onClick={() => handleTabClick('analysis')}
                className={`cursor-pointer ${activeTab === 'analysis' ? 'font-medium text-indigo-600' : ''}`}
              >
                Resume VS Job offer
              </span>
              <span>|</span>
              <span
                onClick={() => handleTabClick('improve')}
                className={`cursor-pointer ${activeTab === 'improve' ? 'font-medium text-indigo-600' : ''}`}
              >
                Improve your Resume
              </span>
            </div>
            {activeTab === 'analysis' && (
              analysisResult ? (
                <div className="bg-white p-6 rounded-2xl shadow-md">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Summary</h3>
                  <div className="prose max-w-none text-sm leading-loose border-none">
                    <ReactMarkdown>{formatSummaryMarkdown(analysisResult.summary)}</ReactMarkdown>
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4 mt-4">Score Breakdown</h4>
                  <div className="flex flex-row gap-6 items-start">
                    <ul className="w-1/3 grid gap-2 text-sm text-gray-700">
                      {Object.entries(analysisResult.scores).map(([key, value]) => (
                        <li key={key} className="flex items-center gap-2">
                          <ClipboardList className="text-purple-500" size={16} />
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>

                    <div className="w-2/3" style={{ aspectRatio: '1 / 1' }}>
                      <Radar
                        data={chartData}
                        options={{
                          ...chartOptions,
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl shadow-md text-gray-400 text-sm text-center flex items-center justify-center">
                  No analysis result yet. Please upload a resume and analyze.
                </div>
              )
            )}

            {activeTab === 'improve' && (
              suggestions ? (
                <>
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Suggestions</h3>
                    <div className="prose max-w-none text-sm leading-loose border-none">
                      <ReactMarkdown>{formatSuggestMarkdown(suggestions)}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">📊 Resume Optimizer Based on Suggestions</h3>
                    <div className="prose max-w-none text-sm leading-loose border-none">
                      <ReactMarkdown>{formatOptimizerMarkdown(updatedResume)}</ReactMarkdown>
                    </div>
                  </div>
                </>
              ) : (<div className="bg-white p-6 rounded-2xl shadow-md text-gray-400 text-sm text-center flex items-center justify-center">
                No analysis result yet. Please upload a resume and analyze.
              </div>)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalyzer;