// components/ThreadCard.tsx
import Link from 'next/link';
import { Thread } from '../lib/types';

interface ThreadCardProps {
  thread: Thread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200">
      <Link href={`/threads/${thread.id}`} className="block">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
          {thread.title}
        </h3>
      </Link>
      <p className="text-gray-600 mb-4 line-clamp-3">{thread.content}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="flex items-center">
          by <span className="font-medium ml-1">{thread.author.username}</span>
        </span>
        <div className="flex space-x-4">
          <span>{thread.postCount} {thread.postCount === 1 ? 'post' : 'posts'}</span>
          <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}