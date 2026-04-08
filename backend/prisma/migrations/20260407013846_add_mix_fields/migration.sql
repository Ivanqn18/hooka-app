-- AlterTable
ALTER TABLE "Mezclas" ADD COLUMN     "cazoleta_recomendada" TEXT,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "imagen_url" TEXT,
ADD COLUMN     "privada" BOOLEAN NOT NULL DEFAULT false;
