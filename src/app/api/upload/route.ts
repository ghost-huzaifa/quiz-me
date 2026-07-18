import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const VALID_FIELDS = [
  'image',
  'optionAImage',
  'optionBImage',
  'optionCImage',
  'optionDImage',
] as const;

type ImageField = (typeof VALID_FIELDS)[number];

// Map field names to Prisma column names
const FIELD_MAP: Record<ImageField, { data: string; mime: string }> = {
  image: { data: 'imageData', mime: 'imageMime' },
  optionAImage: { data: 'optionAImageData', mime: 'optionAImageMime' },
  optionBImage: { data: 'optionBImageData', mime: 'optionBImageMime' },
  optionCImage: { data: 'optionCImageData', mime: 'optionCImageMime' },
  optionDImage: { data: 'optionDImageData', mime: 'optionDImageMime' },
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const questionId = formData.get('questionId') as string | null;
    const field = formData.get('field') as string | null;

    if (!file || !questionId || !field) {
      return Response.json(
        { success: false, message: 'Missing file, questionId, or field.' },
        { status: 400 }
      );
    }

    if (!VALID_FIELDS.includes(field as ImageField)) {
      return Response.json(
        { success: false, message: 'Invalid field name.' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return Response.json(
        { success: false, message: 'File must be an image.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, message: 'File size must be under 5 MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const columns = FIELD_MAP[field as ImageField];

    await prisma.question.update({
      where: { id: questionId },
      data: {
        [columns.data]: buffer,
        [columns.mime]: file.type,
      },
    });

    const url = `/api/upload/${questionId}?field=${field}`;

    return Response.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { success: false, message: 'Upload failed.' },
      { status: 500 }
    );
  }
}
