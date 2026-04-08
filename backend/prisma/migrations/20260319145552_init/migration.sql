/*
  Warnings:

  - You are about to drop the column `cazoleta_recomendada` on the `Mezclas` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Mezclas` table. All the data in the column will be lost.
  - You are about to drop the column `imagen_url` on the `Mezclas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BarStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE_MEZCLA', 'COMENTARIO_MEZCLA', 'NUEVO_MENSAJE', 'SISTEMA');

-- CreateEnum
CREATE TYPE "StashType" AS ENUM ('HAVE', 'WANT');

-- AlterTable
ALTER TABLE "BarResenas" ADD COLUMN     "imagen_url" TEXT;

-- AlterTable
ALTER TABLE "Bares" ADD COLUMN     "solicitante_id" INTEGER,
ADD COLUMN     "status" "BarStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Mezclas" DROP COLUMN "cazoleta_recomendada",
DROP COLUMN "descripcion",
DROP COLUMN "imagen_url",
ADD COLUMN     "matices" TEXT;

-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "latitud" DECIMAL(10,8),
ADD COLUMN     "longitud" DECIMAL(11,8),
ADD COLUMN     "ubicacion" TEXT;

-- AlterTable
ALTER TABLE "Usuarios" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MezclaDislikes" (
    "usuario_id" INTEGER NOT NULL,
    "mezcla_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MezclaDislikes_pkey" PRIMARY KEY ("usuario_id","mezcla_id")
);

-- CreateTable
CREATE TABLE "SellerReviews" (
    "id" SERIAL NOT NULL,
    "vendedor_id" INTEGER NOT NULL,
    "comprador_id" INTEGER NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerReviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" "NotificationType" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "recurso_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStash" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nombre_tabaco" TEXT NOT NULL,
    "marca" TEXT,
    "tipo" "StashType" NOT NULL DEFAULT 'HAVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStash_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tastes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "linea" TEXT,
    "descripcion" TEXT,
    "brandId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tastes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TasteFormats" (
    "id" SERIAL NOT NULL,
    "taste_id" INTEGER NOT NULL,
    "formato" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TasteFormats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MezclaComentarios" (
    "id" SERIAL NOT NULL,
    "mezcla_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MezclaComentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MezclaTags" (
    "mezcla_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "MezclaTags_pkey" PRIMARY KEY ("mezcla_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brands_name_key" ON "Brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tastes_name_brandId_key" ON "Tastes"("name", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "TasteFormats_taste_id_formato_key" ON "TasteFormats"("taste_id", "formato");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_nombre_key" ON "Tags"("nombre");

-- AddForeignKey
ALTER TABLE "MezclaDislikes" ADD CONSTRAINT "MezclaDislikes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaDislikes" ADD CONSTRAINT "MezclaDislikes_mezcla_id_fkey" FOREIGN KEY ("mezcla_id") REFERENCES "Mezclas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReviews" ADD CONSTRAINT "SellerReviews_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerReviews" ADD CONSTRAINT "SellerReviews_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bares" ADD CONSTRAINT "Bares_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificaciones" ADD CONSTRAINT "Notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStash" ADD CONSTRAINT "UserStash_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tastes" ADD CONSTRAINT "Tastes_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasteFormats" ADD CONSTRAINT "TasteFormats_taste_id_fkey" FOREIGN KEY ("taste_id") REFERENCES "Tastes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaComentarios" ADD CONSTRAINT "MezclaComentarios_mezcla_id_fkey" FOREIGN KEY ("mezcla_id") REFERENCES "Mezclas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaComentarios" ADD CONSTRAINT "MezclaComentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaTags" ADD CONSTRAINT "MezclaTags_mezcla_id_fkey" FOREIGN KEY ("mezcla_id") REFERENCES "Mezclas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaTags" ADD CONSTRAINT "MezclaTags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
