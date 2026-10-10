ALTER TABLE "conversation_members"
ADD COLUMN "last_read_message_id" integer;

--> statement-breakpoint

ALTER TABLE "conversation_members"
ADD CONSTRAINT "conversation_members_last_read_message_id_messages_id_fkey"
FOREIGN KEY ("last_read_message_id")
REFERENCES "messages"("id")
ON DELETE SET NULL;