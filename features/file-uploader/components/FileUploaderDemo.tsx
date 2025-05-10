'use client';

import { useState } from 'react';
import { FileUploader } from '../index';

interface ConversionResult {
  success: boolean;
  latexCode?: string;
  error?: string;
}

export function FileUploaderDemo() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filesBase64, setFilesBase64] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = (file: File, base64?: string) => {
    // Add to existing files
    setSelectedFiles(prev => [...prev, file]);
    setFilesBase64(prev => base64 ? [...prev, base64] : prev);
    setConversionResult(null);
    setErrorMessage(null);
  };
  
  const handleFilesSelect = (files: File[], base64Array?: string[]) => {
    // Add to existing files
    setSelectedFiles(prev => [...prev, ...files]);
    setFilesBase64(prev => base64Array ? [...prev, ...base64Array] : prev);
    setConversionResult(null);
    setErrorMessage(null);
  };
  
  const processFiles = async () => {
    if (selectedFiles.length === 0 || filesBase64.length === 0) {
      setErrorMessage('No files selected');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // First, ingest all documents
      const formData = new FormData();
      
      // Append all files to the form data
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      const ingestResponse = await fetch(`${window.location.origin}/api/ingest`, {
        method: 'POST',
        body: formData,
      });
      
      const ingestData = await ingestResponse.json();
      
      if (!ingestResponse.ok) {
        throw new Error(ingestData.error || 'Failed to upload files');
      }
      
      // Then convert to LaTeX using all documents
      const convertFormData = new FormData();
      selectedFiles.forEach((file) => {
        convertFormData.append('files', file);
      });
      
      const convertResponse = await fetch(`${window.location.origin}/api/convert-to-latex`, {
        method: 'POST',
        body: convertFormData,
      });
      
      const convertData = await convertResponse.json();
      
      if (!convertResponse.ok) {
        throw new Error(convertData.error || 'Failed to convert resume to LaTeX');
      }
      
      // Set the conversion result
      setConversionResult({
        success: true,
        latexCode: convertData.latexCode,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setConversionResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadLatex = () => {
    if (!conversionResult?.latexCode) return;
    
    // Create a blob with the LaTeX code
    const blob = new Blob([conversionResult.latexCode], { type: 'application/x-tex' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    // Use the first file's name if multiple files were uploaded
    const fileName = selectedFiles.length > 0 ? selectedFiles[0].name.split('.')[0] : 'resume';
    a.download = `${fileName}.tex`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  const handleOpenInOverleaf = () => {
    if (!conversionResult?.latexCode) return;
    
    // Create a form to submit to Overleaf
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    
    // Add the LaTeX content as a hidden field
    const snippetField = document.createElement('input');
    snippetField.type = 'hidden';
    snippetField.name = 'snip';
    snippetField.value = conversionResult.latexCode;
    form.appendChild(snippetField);
    
    // Add the engine field (pdflatex is the default)
    const engineField = document.createElement('input');
    engineField.type = 'hidden';
    engineField.name = 'engine';
    engineField.value = 'pdflatex';
    form.appendChild(engineField);
    
    // Add the document name
    const nameField = document.createElement('input');
    nameField.type = 'hidden';
    nameField.name = 'name';
    // Use the first file's name if multiple files were uploaded
    const documentName = selectedFiles.length > 0 ? selectedFiles[0].name.split('.')[0] : 'resume';
    nameField.value = documentName;
    form.appendChild(nameField);
    
    // Submit the form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="my-8">
        <FileUploader 
          onFileSelect={handleFileSelect}
          onFilesSelect={handleFilesSelect}
          multiple={true}
        />
      
      {selectedFiles.length > 0 && !isProcessing && !conversionResult && !errorMessage && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-base flex justify-between items-center">
          <p className="font-medium">{selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} ready for processing</p>
          <button
            onClick={processFiles}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
          >
            Convert to LaTeX
          </button>
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-base flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing your resume...
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-base">
          <p className="font-medium">Error processing resume:</p>
          <p className="mt-1">{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              setConversionResult(null);
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
      
      {conversionResult?.success && conversionResult.latexCode && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg text-base">
          <p className="font-medium">Resume successfully converted to LaTeX!</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadLatex}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
            >
              Download LaTeX File
            </button>
            <button
              onClick={handleOpenInOverleaf}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span>Open in Overleaf</span>
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
