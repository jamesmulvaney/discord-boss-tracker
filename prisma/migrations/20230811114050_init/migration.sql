-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "isMaintenance" BOOLEAN NOT NULL,
    "nextMaintenance" TIMESTAMP(3),
    "maintenanceLength" INTEGER,
    "isSeason" BOOLEAN NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "isArsha" BOOLEAN NOT NULL,
    "isSeason" BOOLEAN NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boss" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "aliases" TEXT NOT NULL,
    "info" TEXT,
    "avatar" TEXT NOT NULL,
    "nextSpawn" TIMESTAMP(3),
    "lastSpawn" TIMESTAMP(3),
    "isWorldBoss" BOOLEAN NOT NULL,
    "status" JSONB[],
    "inWindow" BOOLEAN,
    "windowStart" TIMESTAMP(3),
    "windowEnd" TIMESTAMP(3),
    "windowCooldown" INTEGER,
    "clearTime" TIMESTAMP(3),
    "forceDespawnTime" INTEGER NOT NULL DEFAULT 30,
    "forceClearTime" INTEGER NOT NULL DEFAULT 31,
    "isUber" BOOLEAN NOT NULL DEFAULT false,
    "uberOf" INTEGER,

    CONSTRAINT "Boss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_name_key" ON "Channel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_shortName_key" ON "Channel"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_name_key" ON "Boss"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Boss_shortName_key" ON "Boss"("shortName");
