-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageMime" TEXT,
ADD COLUMN     "optionAImageData" BYTEA,
ADD COLUMN     "optionAImageMime" TEXT,
ADD COLUMN     "optionBImageData" BYTEA,
ADD COLUMN     "optionBImageMime" TEXT,
ADD COLUMN     "optionCImageData" BYTEA,
ADD COLUMN     "optionCImageMime" TEXT,
ADD COLUMN     "optionDImageData" BYTEA,
ADD COLUMN     "optionDImageMime" TEXT;
