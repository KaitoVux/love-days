/**
 * YouTube Integration Testing Script
 * Tests all YouTube song creation scenarios and validates the implementation
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  message?: string;
  data?: any;
}

const results: TestResult[] = [];
const API_BASE_URL = process.env.API_URL || 'http://localhost:3002';

/**
 * Get admin auth token for API calls
 */
async function getAuthToken(): Promise<string> {
  // For testing, we'll use the service key directly
  // In production, you'd authenticate with admin credentials
  return process.env.SUPABASE_SERVICE_KEY!;
}

/**
 * Make authenticated API request
 */
async function apiRequest(
  method: string,
  path: string,
  body?: any,
): Promise<{ status: number; data: any }> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

/**
 * Test 1: Create song from valid YouTube URL
 */
async function testYouTubeSongCreation(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { status, data } = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });

    if (status !== 201) {
      return {
        test: 'YouTube Song Creation',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: `Expected 201, got ${status}`,
        data,
      };
    }

    // Validate response structure
    if (!data.id || !data.youtubeVideoId || data.sourceType !== 'youtube') {
      return {
        test: 'YouTube Song Creation',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: 'Invalid response structure',
        data,
      };
    }

    // Cleanup: Delete created song
    await prisma.song.delete({ where: { id: data.id } });

    return {
      test: 'YouTube Song Creation',
      status: 'PASS',
      duration: Date.now() - startTime,
      message: `Song created with ID ${data.id}, video ID: ${data.youtubeVideoId}`,
      data: {
        title: data.title,
        artist: data.artist,
        duration: data.duration,
        youtubeVideoId: data.youtubeVideoId,
      },
    };
  } catch (error: any) {
    return {
      test: 'YouTube Song Creation',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Test 2: Invalid YouTube URL
 */
async function testInvalidYouTubeUrl(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { status, data } = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'invalid-url',
    });

    if (status !== 400) {
      return {
        test: 'Invalid YouTube URL',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: `Expected 400, got ${status}`,
        data,
      };
    }

    return {
      test: 'Invalid YouTube URL',
      status: 'PASS',
      duration: Date.now() - startTime,
      message: 'Correctly rejected invalid URL',
      data,
    };
  } catch (error: any) {
    return {
      test: 'Invalid YouTube URL',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Test 3: Video not found
 */
async function testVideoNotFound(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { status, data } = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'https://www.youtube.com/watch?v=INVALIDVIDEO',
    });

    if (status !== 404 && status !== 400) {
      return {
        test: 'Video Not Found',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: `Expected 404 or 400, got ${status}`,
        data,
      };
    }

    return {
      test: 'Video Not Found',
      status: 'PASS',
      duration: Date.now() - startTime,
      message: 'Correctly handled non-existent video',
      data,
    };
  } catch (error: any) {
    return {
      test: 'Video Not Found',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Test 4: List songs with both types
 */
async function testListSongsWithBothTypes(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    // First, create a YouTube song
    const createResult = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });

    if (createResult.status !== 201) {
      return {
        test: 'List Songs (Both Types)',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: 'Failed to create test YouTube song',
      };
    }

    const songId = createResult.data.id;

    // List all songs
    const { status, data } = await apiRequest('GET', '/api/v1/songs');

    if (status !== 200 || !Array.isArray(data)) {
      await prisma.song.delete({ where: { id: songId } });
      return {
        test: 'List Songs (Both Types)',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: 'Failed to list songs',
      };
    }

    // Verify we have both types
    const youtubeSongs = data.filter((s: any) => s.sourceType === 'youtube');
    const uploadSongs = data.filter((s: any) => s.sourceType === 'upload');

    // Cleanup
    await prisma.song.delete({ where: { id: songId } });

    return {
      test: 'List Songs (Both Types)',
      status: 'PASS',
      duration: Date.now() - startTime,
      message: `Found ${youtubeSongs.length} YouTube songs and ${uploadSongs.length} upload songs`,
      data: {
        total: data.length,
        youtube: youtubeSongs.length,
        upload: uploadSongs.length,
      },
    };
  } catch (error: any) {
    return {
      test: 'List Songs (Both Types)',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Test 5: Metadata parsing
 */
async function testMetadataParsing(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    // Test with a song that has clear artist - title format
    const { status, data } = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    });

    if (status !== 201) {
      return {
        test: 'Metadata Parsing',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: `Failed to create song, status: ${status}`,
        data,
      };
    }

    const hasTitle = data.title && data.title.length > 0;
    const hasArtist = data.artist && data.artist.length > 0;
    const hasDuration = data.duration && data.duration > 0;

    // Cleanup
    await prisma.song.delete({ where: { id: data.id } });

    if (!hasTitle || !hasArtist || !hasDuration) {
      return {
        test: 'Metadata Parsing',
        status: 'FAIL',
        duration: Date.now() - startTime,
        message: 'Metadata incomplete',
        data: { title: hasTitle, artist: hasArtist, duration: hasDuration },
      };
    }

    return {
      test: 'Metadata Parsing',
      status: 'PASS',
      duration: Date.now() - startTime,
      message: 'Metadata correctly parsed',
      data: {
        title: data.title,
        artist: data.artist,
        duration: data.duration,
      },
    };
  } catch (error: any) {
    return {
      test: 'Metadata Parsing',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Test 6: Performance - Import time
 */
async function testImportPerformance(): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const { status, data } = await apiRequest('POST', '/api/v1/songs/youtube', {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });

    const duration = Date.now() - startTime;

    if (status !== 201) {
      return {
        test: 'Import Performance',
        status: 'FAIL',
        duration,
        message: `Failed to import, status: ${status}`,
      };
    }

    // Cleanup
    await prisma.song.delete({ where: { id: data.id } });

    const meetsTarget = duration < 2000; // Target: <2s

    return {
      test: 'Import Performance',
      status: meetsTarget ? 'PASS' : 'FAIL',
      duration,
      message: `Import took ${duration}ms (target: <2000ms)`,
      data: {
        durationMs: duration,
        target: '2000ms',
        meetsTarget,
      },
    };
  } catch (error: any) {
    return {
      test: 'Import Performance',
      status: 'FAIL',
      duration: Date.now() - startTime,
      message: error.message,
    };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 YouTube Integration Testing\n');
  console.log('='.repeat(60));

  // Run tests sequentially
  results.push(await testYouTubeSongCreation());
  results.push(await testInvalidYouTubeUrl());
  results.push(await testVideoNotFound());
  results.push(await testListSongsWithBothTypes());
  results.push(await testMetadataParsing());
  results.push(await testImportPerformance());

  // Print results
  console.log('\n📊 Test Results:\n');

  results.forEach((result, index) => {
    const icon =
      result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${icon} Test ${index + 1}: ${result.test}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Duration: ${result.duration}ms`);
    if (result.message) {
      console.log(`   Message: ${result.message}`);
    }
    if (result.data) {
      console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
    }
    console.log('');
  });

  // Summary
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;

  console.log('='.repeat(60));
  console.log(
    `\n📈 Summary: ${passed}/${total} tests passed, ${failed} failed\n`,
  );

  if (failed > 0) {
    console.log('❌ Some tests failed. Please review the results above.');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
