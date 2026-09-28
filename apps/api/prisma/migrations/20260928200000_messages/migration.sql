CREATE TABLE "Message" ("id" TEXT NOT NULL,"content" TEXT NOT NULL,"channelId" TEXT NOT NULL,"authorId" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "Message_pkey" PRIMARY KEY ("id"));
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId","createdAt");
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
