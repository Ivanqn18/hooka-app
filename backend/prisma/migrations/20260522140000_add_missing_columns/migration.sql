-- CreateEnum: TransactionStatus
CREATE TYPE "TransactionStatus" AS ENUM ('PENDIENTE', 'COMPLETADO', 'DISPUTADO');

-- AlterTable: Add missing columns to Productos
ALTER TABLE "Productos" ADD COLUMN "comprador_id" INTEGER,
ADD COLUMN "transaccion_estado" "TransactionStatus";

-- AlterTable: Add missing column to SellerReviews
ALTER TABLE "SellerReviews" ADD COLUMN "producto_id" INTEGER;

-- CreateIndex: Unique constraint on producto_id in SellerReviews
CREATE UNIQUE INDEX "SellerReviews_producto_id_key" ON "SellerReviews"("producto_id");

-- CreateTable: ProductReports
CREATE TABLE "ProductReports" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "reportado_por_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductReports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: Productos.comprador_id -> Usuarios.id
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: SellerReviews.producto_id -> Productos.id
ALTER TABLE "SellerReviews" ADD CONSTRAINT "SellerReviews_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ProductReports.producto_id -> Productos.id
ALTER TABLE "ProductReports" ADD CONSTRAINT "ProductReports_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: ProductReports.reportado_por_id -> Usuarios.id
ALTER TABLE "ProductReports" ADD CONSTRAINT "ProductReports_reportado_por_id_fkey" FOREIGN KEY ("reportado_por_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
