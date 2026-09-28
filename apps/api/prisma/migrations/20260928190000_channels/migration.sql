CREATE TABLE "Channel" ("id" TEXT NOT NULL,"name" TEXT NOT NULL,"workspaceId" TEXT NOT NULL,"createdById" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Channel_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "Channel_workspaceId_name_key" ON "Channel"("workspaceId","name");
CREATE INDEX "Channel_workspaceId_idx" ON "Channel"("workspaceId");
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
