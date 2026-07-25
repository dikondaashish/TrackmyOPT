import { HttpException, HttpStatus } from '@nestjs/common';
import mammoth from 'mammoth';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

jest.mock('mammoth', () => ({
  __esModule: true,
  default: {
    extractRawText: jest.fn(),
  },
}));

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function makeFile(
  buffer: Buffer,
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'resume.docx',
    encoding: '7bit',
    mimetype:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: buffer.length,
    destination: '',
    filename: '',
    path: '',
    buffer,
    stream: null as never,
    ...overrides,
  };
}

function fakeDocx(uncompressedBytes = 128): Buffer {
  const localHeader = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
  const filename = Buffer.from('word/document.xml');
  const centralDirectory = Buffer.alloc(46);
  centralDirectory.writeUInt32LE(0x02014b50, 0);
  centralDirectory.writeUInt32LE(uncompressedBytes, 24);
  centralDirectory.writeUInt16LE(filename.length, 28);
  return Buffer.concat([localHeader, centralDirectory, filename]);
}

describe('OcrController hostile resume uploads', () => {
  const uploadToS3 = jest.fn();
  const ocrService = {
    uploadToS3,
  } as unknown as OcrService;
  const controller = new OcrController(ocrService);

  beforeEach(() => {
    jest.clearAllMocks();
    uploadToS3.mockResolvedValue('resumes/user/resume.docx');
    jest.mocked(mammoth.extractRawText).mockResolvedValue({
      value: 'Resume text',
      messages: [],
    });
  });

  it('rejects an oversized file before persistence or parsing', async () => {
    const file = makeFile(Buffer.alloc(MAX_UPLOAD_BYTES + 1));

    await expect(controller.parseResume(file)).rejects.toMatchObject({
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    });
    expect(uploadToS3).not.toHaveBeenCalled();
    expect(mammoth.extractRawText).not.toHaveBeenCalled();
  });

  it('rejects a DOCX label whose content is not a ZIP archive', async () => {
    const file = makeFile(Buffer.from('<xml>not-a-docx</xml>'));

    await expect(controller.parseResume(file)).rejects.toBeInstanceOf(
      HttpException,
    );
    await expect(controller.parseResume(file)).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
    });
    expect(uploadToS3).not.toHaveBeenCalled();
    expect(mammoth.extractRawText).not.toHaveBeenCalled();
  });

  it('rejects a DOCX archive with excessive expanded content', async () => {
    const file = makeFile(fakeDocx(26 * 1024 * 1024));

    await expect(controller.parseResume(file)).rejects.toMatchObject({
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    });
    expect(uploadToS3).not.toHaveBeenCalled();
    expect(mammoth.extractRawText).not.toHaveBeenCalled();
  });

  it('parses a validated DOCX only after hostile-input checks pass', async () => {
    const buffer = fakeDocx();
    const file = makeFile(buffer);

    await expect(controller.parseResume(file)).resolves.toMatchObject({
      success: true,
      text: 'Resume text',
      s3Key: 'resumes/user/resume.docx',
    });
    expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer });
    expect(uploadToS3).toHaveBeenCalledTimes(1);
  });
});
