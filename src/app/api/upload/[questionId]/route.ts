import { prisma } from '@/lib/prisma';

const VALID_FIELDS = [
  'image',
  'optionAImage',
  'optionBImage',
  'optionCImage',
  'optionDImage',
] as const;

type ImageField = (typeof VALID_FIELDS)[number];

const FIELD_MAP: Record<ImageField, { data: string; mime: string }> = {
  image: { data: 'imageData', mime: 'imageMime' },
  optionAImage: { data: 'optionAImageData', mime: 'optionAImageMime' },
  optionBImage: { data: 'optionBImageData', mime: 'optionBImageMime' },
  optionCImage: { data: 'optionCImageData', mime: 'optionCImageMime' },
  optionDImage: { data: 'optionDImageData', mime: 'optionDImageMime' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    const url = new URL(request.url);
    const field = url.searchParams.get('field');

    if (!field || !VALID_FIELDS.includes(field as ImageField)) {
      return new Response('Invalid field', { status: 400 });
    }

    const columns = FIELD_MAP[field as ImageField];

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        [columns.data]: true,
        [columns.mime]: true,
      },
    });

    if (!question) {
      return new Response('Not found', { status: 404 });
    }

    const imageData = question[columns.data as keyof typeof question] as Buffer | null;
    const imageMime = question[columns.mime as keyof typeof question] as string | null;

    if (!imageData || !imageMime) {
      return new Response('No image', { status: 404 });
    }

    return new Response(new Uint8Array(imageData), {
      headers: {
        'Content-Type': imageMime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Serve image error:', error);
    return new Response('Server error', { status: 500 });
  }
}
