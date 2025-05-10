import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Health check endpoint to verify API routes are functioning
 * GET /api/health
 */
export async function GET() {
  try {
    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiConfigured = !!geminiApiKey;
    
    // Get environment information
    const environment = {
      node: process.version,
      env: process.env.NODE_ENV || 'development',
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
    
    // Return health status
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      geminiConfigured,
      environment,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const serverError = error instanceof Error ? error : new Error('Unknown server error');
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: serverError.message,
      stack: process.env.NODE_ENV === 'development' ? serverError.stack : undefined,
    }, { status: 500 });
  }
}
