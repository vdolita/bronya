-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(16) NOT NULL,
    "password" VARCHAR(256) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activation" (
    "id" BIGSERIAL NOT NULL,
    "app_id" INTEGER NOT NULL,
    "license_key" CHAR(36) NOT NULL,
    "identity_code" VARCHAR(120) NOT NULL,
    "rolling_code" CHAR(8) NOT NULL,
    "rolling_days" INTEGER NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL,
    "expire_at" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "nx_rolling_code" CHAR(8) NOT NULL,
    "last_rolling_at" TIMESTAMP(3),
    "remark" VARCHAR(256) NOT NULL,

    CONSTRAINT "activation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(16) NOT NULL,
    "encrypt_type" VARCHAR(16) NOT NULL,
    "version" VARCHAR(32) NOT NULL,
    "private_key" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,

    CONSTRAINT "app_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license" (
    "id" BIGSERIAL NOT NULL,
    "license_key" CHAR(36) NOT NULL,
    "app_id" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_act_count" INTEGER NOT NULL,
    "balance_act_count" INTEGER NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "rolling_days" INTEGER NOT NULL,
    "status" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "remark" VARCHAR(256) NOT NULL,

    CONSTRAINT "license_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" CHAR(36) NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(16) NOT NULL,

    CONSTRAINT "label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_label" (
    "license_id" BIGINT NOT NULL,
    "label_id" INTEGER NOT NULL,

    CONSTRAINT "license_label_pkey" PRIMARY KEY ("license_id","label_id")
);

-- CreateTable
CREATE TABLE "activation_label" (
    "activation_id" BIGINT NOT NULL,
    "label_id" INTEGER NOT NULL,

    CONSTRAINT "activation_label_pkey" PRIMARY KEY ("activation_id","label_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_name_key" ON "user"("name");

-- CreateIndex
CREATE INDEX "activation_app_id_activated_at_idx" ON "activation"("app_id", "activated_at");

-- CreateIndex
CREATE INDEX "activation_app_id_expire_at_idx" ON "activation"("app_id", "expire_at");

-- CreateIndex
CREATE UNIQUE INDEX "activation_license_key_identity_code_key" ON "activation"("license_key", "identity_code");

-- CreateIndex
CREATE UNIQUE INDEX "app_name_key" ON "app"("name");

-- CreateIndex
CREATE UNIQUE INDEX "license_license_key_key" ON "license"("license_key");

-- CreateIndex
CREATE INDEX "license_app_id_created_at_idx" ON "license"("app_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "label_name_key" ON "label"("name");

-- AddForeignKey
ALTER TABLE "activation" ADD CONSTRAINT "activation_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "activation" ADD CONSTRAINT "activation_license_key_fkey" FOREIGN KEY ("license_key") REFERENCES "license"("license_key") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "license" ADD CONSTRAINT "license_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "license_label" ADD CONSTRAINT "license_label_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "license"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "license_label" ADD CONSTRAINT "license_label_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "label"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "activation_label" ADD CONSTRAINT "activation_label_activation_id_fkey" FOREIGN KEY ("activation_id") REFERENCES "activation"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "activation_label" ADD CONSTRAINT "activation_label_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "label"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
