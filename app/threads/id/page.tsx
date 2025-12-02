// app/threads/[id]/page.tsx

'use client';
import { useRouter } from 'next/navigation';

// Define the Props interface for the dynamic segment
interface ThreadPageProps {
  params: {
    id: string; // The ID will come from the URL segment
  };
}

// Export a default function component for the page
export default function ThreadPage({ params }: ThreadPageProps) {
  const { id } = params;
  
  // Placeholder logic for fetching thread data
  // In the future, you will fetch thread data from your NestJS backend here.

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        Viewing Thread #{id}
      </h1>
      
      <p style={{ color: '#555' }}>
        This page will show the full thread content and all replies.
      </p>

      {/* TODO: Integrate fetch logic here */}

    </div>
  );
}

// Note: If you still have an empty file at `app/threads/id/page.tsx`, 
// you must delete it, ensuring you only use `app/threads/[id]/page.tsx`.
