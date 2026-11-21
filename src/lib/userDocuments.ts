// Cloud copy of things that used to live only in one browser's localStorage:
// saved bulletin templates and baptism programs. localStorage stays the fast,
// offline-capable working copy; this module mirrors it to the user_documents
// table when someone is signed in, and pulls it back down on other devices.
//
// Everything here is best-effort: if the user is signed out, offline, or the
// user_documents table isn't deployed yet, calls quietly do nothing and the
// app behaves exactly as it did before.

import { supabase } from './supabase';

export type UserDocumentKind = 'template' | 'baptism_program';

export interface CloudDocument<T = unknown> {
  doc_key: string;
  data: T;
  deleted: boolean;
  updated_at: string;
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function pushDocument(kind: UserDocumentKind, docKey: string, data: unknown, deleted = false): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await supabase.from('user_documents').upsert(
      { user_id: userId, kind, doc_key: docKey, data: data ?? {}, deleted, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,kind,doc_key' }
    );
  } catch {
    // Best-effort mirror; the local copy is still intact.
  }
}

export async function fetchDocuments<T = unknown>(kind: UserDocumentKind): Promise<CloudDocument<T>[] | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('doc_key, data, deleted, updated_at')
      .eq('user_id', userId)
      .eq('kind', kind);
    if (error) return null;
    return (data || []) as CloudDocument<T>[];
  } catch {
    return null;
  }
}

export async function fetchDocument<T = unknown>(kind: UserDocumentKind, docKey: string): Promise<CloudDocument<T> | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_documents')
      .select('doc_key, data, deleted, updated_at')
      .eq('user_id', userId)
      .eq('kind', kind)
      .eq('doc_key', docKey)
      .maybeSingle();
    if (error || !data) return null;
    return data as CloudDocument<T>;
  } catch {
    return null;
  }
}
