-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('CACHIMBA', 'CAZOLETA', 'MANGUERA', 'GESTOR_CALOR', 'ACCESORIO', 'BASE', 'CARBON');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DISPONIBLE', 'RESERVADO', 'VENDIDO');

-- CreateTable
CREATE TABLE "Usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mezclas" (
    "id" SERIAL NOT NULL,
    "autor_id" INTEGER,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "cazoleta_recomendada" TEXT,
    "imagen_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mezclas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MezclaIngredientes" (
    "id" SERIAL NOT NULL,
    "mezcla_id" INTEGER NOT NULL,
    "nombre_tabaco" TEXT NOT NULL,
    "marca" TEXT,
    "porcentaje" INTEGER NOT NULL,

    CONSTRAINT "MezclaIngredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MezclaLikes" (
    "usuario_id" INTEGER NOT NULL,
    "mezcla_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MezclaLikes_pkey" PRIMARY KEY ("usuario_id","mezcla_id")
);

-- CreateTable
CREATE TABLE "Productos" (
    "id" SERIAL NOT NULL,
    "vendedor_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria" "ProductCategory" NOT NULL,
    "estado" "ProductStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "imagen_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chats" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "interesado_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensajes" (
    "id" SERIAL NOT NULL,
    "chat_id" INTEGER NOT NULL,
    "emisor_id" INTEGER,
    "texto" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bares" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT NOT NULL,
    "latitud" DECIMAL(10,8) NOT NULL,
    "longitud" DECIMAL(11,8) NOT NULL,
    "imagen_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarResenas" (
    "id" SERIAL NOT NULL,
    "bar_id" INTEGER NOT NULL,
    "usuario_id" INTEGER,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarResenas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuarios_email_key" ON "Usuarios"("email");

-- AddForeignKey
ALTER TABLE "Mezclas" ADD CONSTRAINT "Mezclas_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaIngredientes" ADD CONSTRAINT "MezclaIngredientes_mezcla_id_fkey" FOREIGN KEY ("mezcla_id") REFERENCES "Mezclas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaLikes" ADD CONSTRAINT "MezclaLikes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MezclaLikes" ADD CONSTRAINT "MezclaLikes_mezcla_id_fkey" FOREIGN KEY ("mezcla_id") REFERENCES "Mezclas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productos" ADD CONSTRAINT "Productos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_interesado_id_fkey" FOREIGN KEY ("interesado_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensajes" ADD CONSTRAINT "Mensajes_emisor_id_fkey" FOREIGN KEY ("emisor_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarResenas" ADD CONSTRAINT "BarResenas_bar_id_fkey" FOREIGN KEY ("bar_id") REFERENCES "Bares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarResenas" ADD CONSTRAINT "BarResenas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
