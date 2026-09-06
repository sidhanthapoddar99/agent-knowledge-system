/**
 * File CRUD — API calls for create, rename, delete operations.
 */

import { editorFetch } from '../util/dom-helpers.js';

export async function createFile(parentDir: string, fileName: string): Promise<{ filePath: string; prefix: number }> {
  return editorFetch('create-file', { parentDir, fileName });
}

export async function createFolder(parentDir: string, folderName: string): Promise<{ path: string }> {
  return editorFetch('create-folder', { parentDir, folderName });
}

export async function renameItem(oldPath: string, newName: string): Promise<{ newPath: string }> {
  return editorFetch('rename', { oldPath, newName });
}

export async function deleteItem(itemPath: string): Promise<void> {
  await editorFetch('delete', { itemPath });
}
