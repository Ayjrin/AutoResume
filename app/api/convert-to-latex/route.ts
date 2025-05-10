import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { convertResumeToLatex } from '@/shared/lib/gemini';

// POST /api/convert-to-latex
export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files');
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    // Extract file data
    const base64FilesData: string[] = [];
    const mimeTypes: string[] = [];
    const fileNames: string[] = [];
    
    for (const file of files) {
      if (!(file instanceof File)) {
        console.error('Invalid file object:', file);
        continue;
      }
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        base64FilesData.push(base64);
        mimeTypes.push(file.type);
        fileNames.push(file.name);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        continue;
      }
    }
    
    if (base64FilesData.length === 0) {
      return NextResponse.json({ error: 'No valid files found.' }, { status: 400 });
    }

    // Convert to LaTeX using Gemini (multi-file support)
    const latexCode = await convertResumeToLatex({
      multipleFiles: true,
      base64FilesData,
      mimeTypes,
      fileNames,
    });

    return NextResponse.json({ latexCode });
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error.'
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
