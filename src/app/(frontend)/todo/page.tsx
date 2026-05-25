'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TodoPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/tasks');
  }, []);
  return null;
}
