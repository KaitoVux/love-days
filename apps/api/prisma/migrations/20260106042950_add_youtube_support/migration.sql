-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "sourceType" VARCHAR(20) NOT NULL DEFAULT 'upload',
ADD COLUMN     "youtube_video_id" VARCHAR(20),
ALTER COLUMN "file_path" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "songs_sourceType_idx" ON "songs"("sourceType");
