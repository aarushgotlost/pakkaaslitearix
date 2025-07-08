import { useState } from 'react';
import { 
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'blog' | 'story';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export function useContent() {
  const { currentUser } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to user's content
  const subscribeToContents = () => {
    if (!currentUser) return () => {};

    const q = query(
      collection(db, 'contents'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const contentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContentItem[];
      setContents(contentList);
    });
  };

  // Save content
  const saveContent = async (title: string, content: string, type: 'blog' | 'story') => {
    if (!currentUser) throw new Error('Must be logged in to save content');

    setLoading(true);
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'contents'), {
        title,
        content,
        type,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now
      });
    } finally {
      setLoading(false);
    }
  };

  // Update content
  const updateContent = async (id: string, updates: Partial<Pick<ContentItem, 'title' | 'content'>>) => {
    setLoading(true);
    try {
      const contentRef = doc(db, 'contents', id);
      await updateDoc(contentRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete content
  const deleteContent = async (id: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'contents', id));
    } finally {
      setLoading(false);
    }
  };

  return {
    contents,
    loading,
    saveContent,
    updateContent,
    deleteContent,
    subscribeToContents
  };
}