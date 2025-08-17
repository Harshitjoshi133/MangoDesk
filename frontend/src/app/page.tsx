"use client";

import { useState } from 'react';

export default function Home() {
  const [transcript, setTranscript] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setTranscript(e.target.files[0]);
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

    const formData = new FormData();
    formData.append('transcript', transcript);
    formData.append('custom_prompt', customPrompt);

    try {
      const response = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary.');
      }

      const data = await response.json();
      setSummary(data.summary);
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

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/send-email', {
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
        throw new Error('Failed to send email.');
      }

      alert('Email sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Meeting Notes Summarizer</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-6">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-blue-700">
              Upload Transcript (.txt)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-blue-700">
              Custom Instruction/Prompt
            </label>
            <textarea
              id="custom-prompt"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-blue-900 placeholder:text-gray-400"
              placeholder="e.g., Focus on action items and decisions."
            />
          </div>

          <button
            onClick={generateSummary}
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </button>

          {summary && (
            <>
              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-blue-700">
                  Generated Summary
                </label>
                <textarea
                  id="summary"
                  rows={10}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-blue-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="recipients" className="block text-sm font-medium text-blue-700">
                  Recipient Emails (comma-separated)
                </label>
                <input
                  id="recipients"
                  type="email"
                  multiple
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-blue-900 placeholder:text-gray-400"
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>

              <button
                onClick={sendSummary}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:bg-gray-400"
              >
                {isLoading ? 'Sending...' : 'Send Summary'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
