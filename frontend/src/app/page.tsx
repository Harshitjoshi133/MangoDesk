"use client";

import { useState } from 'react';
import { FiUpload, FiSend, FiFileText, FiMail, FiLoader, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';

export default function Home() {
  const [transcript, setTranscript] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [isFirstRequest, setIsFirstRequest] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTranscript(e.target.files[0]);
      setError('');
    }
  };

  const generateSummary = async () => {
    if (!transcript) {
      setError('Please upload a transcript file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSummary('');
    setSuccess('');
    if (isFirstRequest) setIsFirstRequest(false);

    const formData = new FormData();
    formData.append('transcript', transcript);
    formData.append('custom_prompt', customPrompt);

    try {
      const response = await fetch('https://mangodesk-nc4e.onrender.com/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary. Please try again.');
      }

      const data = await response.json();
      setSummary(data.summary);
      setSuccess('Summary generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSummary = async () => {
    if (!summary || !recipients) {
      setError('Please generate a summary and provide recipient emails.');
      return;
    }

    setIsSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('https://mangodesk-nc4e.onrender.com/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          recipients: recipients.split(',').map(email => email.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email. Please try again.');
      }

      setSuccess('Email sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isFirstRequest && (
          <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
            <p>⏳ First request may take a few moments as the server wakes up (hosted on Render's free tier)</p>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Meeting Notes Summarizer
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Transform your meeting transcripts into clear, actionable summaries
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {(error || success) && (
              <div className={`mb-6 p-4 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {error || success}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 flex items-center">
                  <FiFileText className="mr-2" />
                  Upload Transcript (.txt)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".txt"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">{transcript?.name || 'No file selected'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
                  Custom Instructions (Optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="custom-prompt"
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 text-blue-700"
                    placeholder="e.g., Focus on action items, decisions, and key discussion points..."
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={generateSummary}
                  disabled={isLoading || !transcript}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    isLoading || !transcript
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <FiUpload className="-ml-1 mr-2 h-4 w-4" />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>

              {summary && (
                <div className="space-y-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                        Generated Summary
                      </label>
                      <span className="text-xs text-gray-500">{summary.length} characters</span>
                    </div>
                    <div className="mt-1">
                      <textarea
                        id="summary"
                        rows={8}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 font-mono text-sm text-blue-700"
                        placeholder="Your summary will appear here..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 flex items-center">
                      <FiMail className="mr-2" />
                      Recipient Emails
                    </label>
                    <div className="mt-1">
                      <input
                        id="recipients"
                        type="email"
                        multiple
                        value={recipients}
                        onChange={(e) => setRecipients(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 text-blue-700"
                        placeholder="email1@example.com, email2@example.com"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={sendSummary}
                      disabled={isSending || !summary || !recipients}
                      className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isSending || !summary || !recipients
                          ? 'bg-indigo-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="-ml-1 mr-2 h-4 w-4" />
                          Send Summary
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* API Documentation Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          <button 
            onClick={() => setShowApiDocs(!showApiDocs)}
            className="w-full px-6 py-4 flex justify-between items-center text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none border-b border-gray-200"
          >
            <div className="flex items-center">
              <FiInfo className="mr-2 text-blue-500" />
              <span className="text-lg font-semibold">API Documentation</span>
            </div>
            {showApiDocs ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          
          {showApiDocs && (
            <div className="p-6">
              <div className="space-y-8">
                {/* Generate Summary Endpoint */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                      POST
                    </span>
                    <code className="text-sm font-mono text-gray-800">/summarize</code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-4">Generate a summary from a text transcript using AI.</p>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Request</h4>
                    <div className="bg-gray-800 rounded-md p-4 mb-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        {`{
  "transcript": "[Text content or file]",
  "custom_prompt": "[Optional instructions for summarization]"
}`}
                      </pre>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Response</h4>
                    <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                      <pre className="text-blue-300 text-sm">
                        {`{
  "status": "success",
  "summary": "Generated summary text..."
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Send Email Endpoint */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-3">
                      POST
                    </span>
                    <code className="text-sm font-mono text-gray-800">/send-email</code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 mb-4">Send the generated summary via email to specified recipients.</p>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Request</h4>
                    <div className="bg-gray-800 rounded-md p-4 mb-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        {`{
  "summary": "Generated summary text...",
  "recipients": ["email1@example.com", "email2@example.com"]
}`}
                      </pre>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-2">Response</h4>
                    <div className="bg-gray-800 rounded-md p-4 overflow-x-auto">
                      <pre className="text-blue-300 text-sm">
                        {`{
  "status": "success",
  "message": "Email sent successfully"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Tech Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Frontend</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Next.js 14 with TypeScript</li>
                        <li>• React 18</li>
                        <li>• Tailwind CSS</li>
                        <li>• React Icons</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Backend</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Python FastAPI</li>
                        <li>• Gemini API for AI processing</li>
                        <li>• SMTP for email delivery</li>
                        <li>• Render for deployment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>MangoDesk &copy; {new Date().getFullYear()} - Making meeting notes more actionable</p>
        </div>
      </div>
    </main>
  );
}
