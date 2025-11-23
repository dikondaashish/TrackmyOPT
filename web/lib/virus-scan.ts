/**
 * Virus Scanning Utility
 * 
 * Framework for scanning uploaded files for viruses/malware
 * Currently disabled - enable by setting ENABLE_VIRUS_SCAN=true
 * 
 * Implementation Options:
 * 1. ClamAV (recommended for self-hosted)
 * 2. VirusTotal API (cloud-based, rate limited)
 * 3. MetaDefender API (cloud-based, paid)
 */

export interface VirusScanResult {
  safe: boolean;
  threat?: string;
  scanTime: number;
  scanner: string;
}

/**
 * Scan file buffer for viruses
 * 
 * @param fileBuffer - File content as Buffer
 * @param filename - Original filename
 * @returns Scan result
 */
export async function scanFileForViruses(
  fileBuffer: Buffer,
  filename: string
): Promise<VirusScanResult> {
  const startTime = Date.now();

  // Check if virus scanning is enabled
  if (process.env.ENABLE_VIRUS_SCAN !== 'true') {
    console.log('⏭️  Virus scanning disabled - skipping');
    return {
      safe: true,
      scanner: 'disabled',
      scanTime: Date.now() - startTime,
    };
  }

  // Select scanner based on configuration
  const scanner = process.env.VIRUS_SCANNER || 'clamav';

  switch (scanner) {
    case 'clamav':
      return await scanWithClamAV(fileBuffer, filename, startTime);
    
    case 'virustotal':
      return await scanWithVirusTotal(fileBuffer, filename, startTime);
    
    default:
      console.warn(`⚠️  Unknown virus scanner: ${scanner}, skipping scan`);
      return {
        safe: true,
        scanner: 'none',
        scanTime: Date.now() - startTime,
      };
  }
}

/**
 * Scan file using ClamAV
 * 
 * Requires:
 * - ClamAV installed on server
 * - clamd running
 * - node-clam package installed
 * 
 * Setup:
 * 1. Install ClamAV: apt-get install clamav clamav-daemon
 * 2. Start daemon: systemctl start clamav-daemon
 * 3. Install package: pnpm add clamscan
 * 4. Set env: CLAMAV_HOST=localhost, CLAMAV_PORT=3310
 */
async function scanWithClamAV(
  fileBuffer: Buffer,
  filename: string,
  startTime: number
): Promise<VirusScanResult> {
  // ClamAV integration is optional and requires manual setup
  // To enable:
  // 1. Install ClamAV: apt-get install clamav clamav-daemon
  // 2. Install package: pnpm add clamscan
  // 3. Set env: CLAMAV_HOST=localhost, CLAMAV_PORT=3310
  // 4. Uncomment the implementation below
  
  console.log('⏭️  ClamAV not configured - skipping virus scan');
  console.log('   To enable: Install ClamAV and clamscan package');
  
  return {
    safe: true,
    scanner: 'clamav (not configured)',
    scanTime: Date.now() - startTime,
  };
  
  /* Uncomment to enable ClamAV scanning:
  
  try {
    console.log(`🔍 Scanning file with ClamAV: ${filename}`);

    const { default: NodeClam } = await import('clamscan');

    const clamscan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: parseInt(process.env.CLAMAV_PORT || '3310'),
        timeout: 30000,
      },
      preference: 'clamdscan',
    });

    const { isInfected, viruses } = await clamscan.scanStream(fileBuffer);

    console.log(`✅ ClamAV scan complete: ${isInfected ? 'INFECTED' : 'CLEAN'}`);

    return {
      safe: !isInfected,
      threat: isInfected ? viruses.join(', ') : undefined,
      scanner: 'clamav',
      scanTime: Date.now() - startTime,
    };

  } catch (error) {
    console.error('❌ ClamAV scan error:', error);
    return {
      safe: true,
      scanner: 'clamav (error)',
      scanTime: Date.now() - startTime,
    };
  }
  */
}

/**
 * Scan file using VirusTotal API
 * 
 * Requires:
 * - VirusTotal API key
 * - virustotal-api package installed
 * 
 * Setup:
 * 1. Get API key from https://www.virustotal.com/gui/user/YOUR_USERNAME/apikey
 * 2. Install package: pnpm add virustotal-api
 * 3. Set env: VIRUSTOTAL_API_KEY=your-api-key
 * 
 * Note: Free tier has rate limits (4 requests/minute)
 */
async function scanWithVirusTotal(
  fileBuffer: Buffer,
  filename: string,
  startTime: number
): Promise<VirusScanResult> {
  try {
    console.log(`🔍 Scanning file with VirusTotal: ${filename}`);

    if (!process.env.VIRUSTOTAL_API_KEY) {
      console.error('❌ VIRUSTOTAL_API_KEY not configured');
      return {
        safe: true,
        scanner: 'virustotal (not configured)',
        scanTime: Date.now() - startTime,
      };
    }

    // VirusTotal requires file upload via multipart/form-data
    // For production, implement full VirusTotal integration
    // For now, return safe (fail open)
    
    console.warn('⚠️  VirusTotal integration not fully implemented');
    
    return {
      safe: true,
      scanner: 'virustotal (not implemented)',
      scanTime: Date.now() - startTime,
    };

  } catch (error) {
    console.error('❌ VirusTotal scan error:', error);
    return {
      safe: true,
      scanner: 'virustotal (error)',
      scanTime: Date.now() - startTime,
    };
  }
}

/**
 * Check if file type is commonly used for malware
 * Quick heuristic check before deep scan
 */
export function checkSuspiciousFileType(filename: string, mimeType: string): boolean {
  const suspiciousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr',
    '.vbs', '.js', '.jar', '.zip', '.rar', '.7z',
  ];

  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  
  if (suspiciousExtensions.includes(ext)) {
    console.warn(`⚠️  Suspicious file extension detected: ${ext}`);
    return true;
  }

  // Check for executable MIME types
  const suspiciousMimeTypes = [
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-executable',
    'application/x-sh',
  ];

  if (suspiciousMimeTypes.includes(mimeType)) {
    console.warn(`⚠️  Suspicious MIME type detected: ${mimeType}`);
    return true;
  }

  return false;
}

