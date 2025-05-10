import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Add detailed logging
function logApiRequest(method: string, url: string, body?: any) {
  console.log(`API Request: ${method} ${url}`);
  if (body) {
    console.log('Request body:', JSON.stringify(body, null, 2));
  }
}

function logApiResponse(status: number, body?: any) {
  console.log(`API Response: ${status}`);
  if (body) {
    console.log('Response body:', JSON.stringify(body, null, 2));
  }
}

/**
 * Handles file upload and stores it for processing
 * Supports both single and multiple file uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Log the request
    logApiRequest('POST', '/api/ingest', { url: request.url });
    
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      const errorResponse = { error: 'Request must be multipart/form-data' };
      logApiResponse(400, errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Parse the form data
    let formData;
    try {
      formData = await request.formData();
      console.log('Form data parsed successfully');
    } catch (error) {
      console.error('Error parsing form data:', error);
      const formError = error instanceof Error ? error : new Error('Unknown error parsing form data');
      const errorResponse = { error: 'Error parsing form data', details: formError.message };
      logApiResponse(400, errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Get all files from the FormData
    const files = formData.getAll('files');
    console.log(`Files found: ${files.length}`);
    
    if (!files || files.length === 0) {
      const errorResponse = { error: 'No files provided' };
      logApiResponse(400, errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Array to store all processed files
    const processedFiles = [];
    
    // Validate file types
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'application/pdf',
      'text/plain',
      'text/html',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    // Maximum file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Process each file
    for (const file of files) {
      if (!(file instanceof File)) continue;
      
      // Validate file type
      if (!validTypes.includes(file.type)) {
        console.error(`Unsupported file type: ${file.type} for file ${file.name}`);
        const errorResponse = { error: `Unsupported file type for ${file.name}` };
        logApiResponse(400, errorResponse);
        return NextResponse.json(errorResponse, { status: 400 });
      }
      
      // Validate file size
      if (file.size > maxSize) {
        console.error(`File size (${file.size} bytes) exceeds the maximum limit of ${maxSize} bytes for ${file.name}`);
        const errorResponse = { error: `File size exceeds the maximum limit of 10MB for ${file.name}` };
        logApiResponse(400, errorResponse);
        return NextResponse.json(errorResponse, { status: 400 });
      }
      
      // Verify file can be read
      try {
        await file.arrayBuffer();
        console.log(`Successfully read file: ${file.name}`);
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
        const readError = error instanceof Error ? error : new Error(`Unknown error reading file ${file.name}`);
        const errorResponse = { error: `Failed to read file ${file.name}`, details: readError.message };
        logApiResponse(400, errorResponse);
        return NextResponse.json(errorResponse, { status: 400 });
      }
      
      // Store file metadata
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
      console.log(`Added file to processed list: ${file.name}`);

    }
    
    // Make sure we processed at least one file
    if (processedFiles.length === 0) {
      console.error('No valid files were processed');
      const errorResponse = { error: 'No valid files provided' };
      logApiResponse(400, errorResponse);
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Generate a document ID for this batch
    const documentId = generateDocumentId();
    console.log(`Generated document ID: ${documentId}`);
    
    // Prepare success response
    const successResponse = {
      success: true,
      message: processedFiles.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully',
      documentId,
      fileMetadata: processedFiles,
    };
    
    logApiResponse(200, { success: true, documentId, fileCount: processedFiles.length });
    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('Error ingesting document:', error);
    const serverError = error instanceof Error ? error : new Error('Unknown server error');
    const errorResponse = { 
      error: 'Failed to process the document',
      details: serverError.message,
      stack: process.env.NODE_ENV === 'development' ? serverError.stack : undefined
    };
    
    logApiResponse(500, { error: errorResponse.error });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Generate a simple document ID
 * In a real application, you would use a database-generated ID or UUID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
