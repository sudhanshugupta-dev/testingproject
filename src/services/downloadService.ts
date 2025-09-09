import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export interface DownloadProgress {
  bytesWritten: number;
  contentLength: number;
  progress: number;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

class DownloadService {
  private getFileExtension(url: string, mimeType?: string): string {
    // Try to get extension from URL first
    const urlExtension = url.split('.').pop()?.split('?')[0];
    if (urlExtension && urlExtension.length <= 4) {
      return urlExtension;
    }

    // Fallback to mime type mapping
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/mov': 'mov',
      'video/avi': 'avi',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/m4a': 'm4a',
      'application/pdf': 'pdf',
    };

    return mimeToExt[mimeType || ''] || 'bin';
  }

  private getDownloadPath(fileName: string): string {
    if (Platform.OS === 'ios') {
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    } else {
      return `${RNFS.DownloadDirectoryPath}/${fileName}`;
    }
  }

  async downloadFile(
    url: string,
    fileName?: string,
    mimeType?: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    try {
      // Generate filename if not provided
      const timestamp = new Date().getTime();
      const extension = this.getFileExtension(url, mimeType);
      const finalFileName = fileName || `download_${timestamp}.${extension}`;
      
      const downloadPath = this.getDownloadPath(finalFileName);

      // Check if file already exists
      const fileExists = await RNFS.exists(downloadPath);
      if (fileExists) {
        const uniqueFileName = `download_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
        const uniquePath = this.getDownloadPath(uniqueFileName);
        
        const downloadPromise = RNFS.downloadFile({
          fromUrl: url,
          toFile: uniquePath,
          progress: onProgress ? (res) => {
            onProgress({
              bytesWritten: res.bytesWritten,
              contentLength: res.contentLength,
              progress: res.bytesWritten / res.contentLength,
            });
          } : undefined,
        });

        const result = await downloadPromise.promise;
        
        if (result.statusCode === 200) {
          // Verify file was actually created
          const fileExists = await RNFS.exists(uniquePath);
          if (fileExists) {
            const fileStats = await RNFS.stat(uniquePath);
            console.log('File downloaded successfully:', uniquePath, 'Size:', fileStats.size);
            return { success: true, filePath: uniquePath };
          } else {
            return { success: false, error: 'File was not created after download' };
          }
        } else {
          return { success: false, error: `Download failed with status: ${result.statusCode}` };
        }
      } else {
        const downloadPromise = RNFS.downloadFile({
          fromUrl: url,
          toFile: downloadPath,
          progress: onProgress ? (res) => {
            onProgress({
              bytesWritten: res.bytesWritten,
              contentLength: res.contentLength,
              progress: res.bytesWritten / res.contentLength,
            });
          } : undefined,
        });

        const result = await downloadPromise.promise;
        
        if (result.statusCode === 200) {
          // Verify file was actually created
          const fileExists = await RNFS.exists(downloadPath);
          if (fileExists) {
            const fileStats = await RNFS.stat(downloadPath);
            console.log('File downloaded successfully:', downloadPath, 'Size:', fileStats.size);
            return { success: true, filePath: downloadPath };
          } else {
            return { success: false, error: 'File was not created after download' };
          }
        } else {
          return { success: false, error: `Download failed with status: ${result.statusCode}` };
        }
      }
    } catch (error: any) {
      console.error('Download error:', error);
      return { success: false, error: error.message || 'Download failed' };
    }
  }

  async getDownloadedFiles(): Promise<string[]> {
    try {
      const downloadDir = Platform.OS === 'ios' 
        ? RNFS.DocumentDirectoryPath 
        : RNFS.DownloadDirectoryPath;
      
      const files = await RNFS.readDir(downloadDir);
      return files
        .filter(file => file.isFile())
        .map(file => file.path);
    } catch (error) {
      console.error('Error reading downloaded files:', error);
      return [];
    }
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new DownloadService();