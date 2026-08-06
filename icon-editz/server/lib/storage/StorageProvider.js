/**
 * Abstract Base Class for Storage Providers.
 * All storage providers (SupabaseStorageProvider, R2StorageProvider) must implement these methods.
 */
export class StorageProvider {
  /**
   * Upload a file to storage.
   * @param {Object} params
   * @param {Object} params.file - Multer file object with buffer, originalname, mimetype, size
   * @param {string} [params.folder='uploads'] - Subfolder inside the bucket
   * @returns {Promise<{ key: string, url: string, name: string, size: number, type: string }>}
   */
  async upload({ file, folder = 'uploads' }) {
    throw new Error('Method upload() must be implemented by storage provider')
  }

  /**
   * Delete an object from storage.
   * @param {Object} params
   * @param {string} params.key - Storage object key / path
   * @returns {Promise<boolean>}
   */
  async delete({ key }) {
    throw new Error('Method delete() must be implemented by storage provider')
  }

  /**
   * Get public URL for a given storage object key.
   * @param {string} key
   * @returns {string}
   */
  getPublicUrl(key) {
    throw new Error('Method getPublicUrl() must be implemented by storage provider')
  }

  /**
   * List objects in a storage folder.
   * @param {Object} params
   * @param {string} [params.folder='']
   * @returns {Promise<Array<{ key: string, name: string, size: number, updatedAt: string }>>}
   */
  async list({ folder = '' } = {}) {
    throw new Error('Method list() must be implemented by storage provider')
  }
}
