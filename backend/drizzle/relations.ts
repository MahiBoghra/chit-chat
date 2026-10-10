import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	conversations: {
		usersViaConversationMembers: r.many.users({
			from: r.conversations.id.through(r.conversationMembers.conversationId),
			to: r.users.id.through(r.conversationMembers.userId),
			alias: "conversations_id_users_id_via_conversationMembers"
		}),
		usersViaMessages: r.many.users({
			from: r.conversations.id.through(r.messages.conversationId),
			to: r.users.id.through(r.messages.senderId),
			alias: "conversations_id_users_id_via_messages"
		}),
	},
	users: {
		conversationsViaConversationMembers: r.many.conversations({
			alias: "conversations_id_users_id_via_conversationMembers"
		}),
		conversationsViaMessages: r.many.conversations({
			alias: "conversations_id_users_id_via_messages"
		}),
	},
}))