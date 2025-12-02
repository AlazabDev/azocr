import { drive_v3, google } from 'googleapis';
import { DriveFile } from '../types';

function buildDriveClient(): drive_v3.Drive | null {
  const credentialsJSON = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJSON) return null;

  try {
    const parsed = JSON.parse(credentialsJSON);
    const auth = new google.auth.JWT({
      email: parsed.client_email,
      key: parsed.private_key?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Failed to initialize Google Drive client', error);
    return null;
  }
}

const driveClient = buildDriveClient();

export function isDriveConfigured() {
  return Boolean(driveClient);
}

const fallbackFiles: DriveFile[] = [
  {
    id: 'demo-1',
    name: 'BOQ-demo.pdf',
    mimeType: 'application/pdf',
    size: '324000',
    webViewLink: '#',
  },
  {
    id: 'demo-2',
    name: 'materials.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: '128000',
    webViewLink: '#',
  },
];

export async function listDriveFiles(): Promise<{ files: DriveFile[]; usedFallback: boolean }> {
  if (!driveClient) {
    return { files: fallbackFiles, usedFallback: true };
  }

  const response = await driveClient.files.list({
    pageSize: 10,
    fields: 'files(id, name, mimeType, size, webViewLink)',
    q: "mimeType!='application/vnd.google-apps.folder'",
    orderBy: 'modifiedTime desc',
  });

  return { files: response.data.files as DriveFile[], usedFallback: false };
}
