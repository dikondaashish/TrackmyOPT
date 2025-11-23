/**
 * Documents API - List all user documents
 * 
 * GET /api/documents
 * Query params:
 *   - category: Filter by document type
 *   - search: Search in filename and summary
 *   - sort: Sort order (newest, oldest, expiring-soon, name)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching documents list...');

    // Get user from session
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`filename.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    // Apply sorting
    switch (sort) {
      case 'oldest':
        query = query.order('uploaded_at', { ascending: true });
        break;
      case 'expiring-soon':
        query = query
          .not('expiry_date', 'is', null)
          .order('expiry_date', { ascending: true });
        break;
      case 'name':
        query = query.order('filename', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('uploaded_at', { ascending: false });
        break;
    }

    const { data: documents, error: dbError } = await query;

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw dbError;
    }

    console.log(`✅ Found ${documents?.length || 0} documents`);

    return NextResponse.json({
      documents: documents || [],
      count: documents?.length || 0,
    });

  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

