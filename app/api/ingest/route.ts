import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles file upload and stores it for processing
 * Supports both single and multiple file uploads
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    
    // Get all files from the FormData
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
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
        return NextResponse.json(
          { error: `Unsupported file type for ${file.name}` },
          { status: 400 }
        );
      }
      
      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File size exceeds the maximum limit of 10MB for ${file.name}` },
          { status: 400 }
        );
      }
      
      // Verify file can be read
      await file.arrayBuffer();
      
      // Store file metadata
      processedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }
    
    // Make sure we processed at least one file
    if (processedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files provided' },
        { status: 400 }
      );
    }
    
    // Generate a document ID for this batch
    const documentId = generateDocumentId();
    
    return NextResponse.json({
      success: true,
      message: processedFiles.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully',
      documentId,
      fileMetadata: processedFiles,
    });
  } catch (error) {
    console.error('Error ingesting document:', error);
    return NextResponse.json(
      { error: 'Failed to process the document' },
      { status: 500 }
    );
  }
}

/**
 * Generate a simple document ID
 * In a real application, you would use a database-generated ID or UUID
 */
function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
