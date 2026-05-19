import { Check, Inbox, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ChatList } from "../components/chat/ChatList";
import { ChatWindow } from "../components/chat/ChatWindow";
import { EmptyState } from "../components/common/EmptyState";
import { Layout } from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";

export function MessagesPage() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const composeUsername = searchParams.get("compose") ?? "";
  const {
    currentUser,
    users,
    conversations,
    messageRequests,
    requireAuth,
    sendMessage,
    respondToMessageRequest,
    markConversationSeen,
    setConversationTheme,
    findUserByUsername
  } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      requireAuth("Please login or create an account to open your messages.", "/messages");
    }
  }, [currentUser, requireAuth]);

  const activeConversation =
    conversations.find((conversation) => conversation.id === Number(conversationId)) ??
    messageRequests.find((conversation) => conversation.id === Number(conversationId)) ??
    conversations[0] ??
    messageRequests[0];

  const composeTarget = useMemo(
    () => (composeUsername ? findUserByUsername(composeUsername) : undefined),
    [composeUsername, findUserByUsername]
  );

  if (!currentUser) {
    return (
      <Layout>
        <EmptyState
          title="Messages are for members"
          description="Once you sign in, you'll get the full split-screen chat experience with conversation history and live composition."
        />
      </Layout>
    );
  }

  const rightPanel = (
    <div className="space-y-5">
      <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
        <div className="mb-3 flex items-center gap-2">
          <Inbox className="h-4 w-4 text-primary" />
          <h3 className="headline-font text-lg font-semibold text-text">Requests</h3>
        </div>
        <div className="space-y-3">
          {messageRequests.length ? (
            messageRequests.map((request) => {
              const requester = users.find(
                (user) => request.participantIds.includes(user.id) && user.id !== currentUser.id
              );
              if (!requester) {
                return null;
              }
              return (
                <div key={request.id} className="rounded-[1.6rem] bg-white/75 p-4">
                  <p className="text-sm font-semibold text-text">{requester.fullName}</p>
                  <p className="mt-1 text-sm text-muted">{request.lastMessage}</p>
                  <div className="mt-3 flex gap-2">
                    {request.requestSenderId !== currentUser.id ? (
                      <>
                        <button type="button" onClick={() => respondToMessageRequest(request.id, true)} className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
                          <span className="inline-flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Accept
                          </span>
                        </button>
                        <button type="button" onClick={() => respondToMessageRequest(request.id, false)} className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-700">
                          <span className="inline-flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Reject
                          </span>
                        </button>
                      </>
                    ) : (
                      <span className="rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-muted">Request sent</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">No message requests right now.</p>
          )}
        </div>
      </div>
      {composeTarget ? (
        <div className="glass-panel rounded-[2rem] p-5 shadow-soft">
          <h3 className="headline-font text-lg font-semibold text-text">Start a request</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Your first message to @{composeTarget.username} will go to requests until they accept it.
          </p>
        </div>
      ) : null}
    </div>
  );

  return (
    <Layout rightPanel={rightPanel}>
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <ChatList
            conversations={conversations}
            users={users}
            currentUserId={currentUser.id}
            activeConversationId={activeConversation?.id}
          />
          {messageRequests.length ? (
            <div className="glass-panel rounded-[2rem] p-4 shadow-soft">
              <h3 className="headline-font text-lg font-semibold text-text">Pending requests</h3>
              <div className="mt-3 space-y-2">
                {messageRequests.map((request) => {
                  const requester = users.find(
                    (user) => request.participantIds.includes(user.id) && user.id !== currentUser.id
                  );
                  return requester ? (
                    <a key={request.id} href={`/messages/${request.id}`} className="block rounded-[1.3rem] bg-white/75 px-3 py-3 text-sm">
                      <p className="font-semibold text-text">{requester.fullName}</p>
                      <p className="truncate text-muted">{request.lastMessage}</p>
                    </a>
                  ) : null;
                })}
              </div>
            </div>
          ) : null}
        </div>
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            users={users}
            currentUserId={currentUser.id}
            globalThemeId={currentUser.chatTheme?.id}
            globalThemeBackground={currentUser.chatTheme?.customBackground}
            onSeen={() => markConversationSeen(activeConversation.id)}
            onThemeChange={(themeId) => setConversationTheme(activeConversation.id, themeId)}
            onSend={async (text, file) => {
              await sendMessage({
                conversationId: activeConversation.id,
                text,
                file
              });
            }}
          />
        ) : composeTarget ? (
          <ChatWindow
            conversation={{
              id: 0,
              participantIds: [currentUser.id, composeTarget.id],
              lastMessage: "",
              updatedAt: new Date().toISOString(),
              messages: [],
              status: "pending",
              requestSenderId: currentUser.id,
              themeId: currentUser.chatTheme?.id || "default-glass",
              customThemeUrl: currentUser.chatTheme?.customBackground || null
            }}
            users={users}
            currentUserId={currentUser.id}
            globalThemeId={currentUser.chatTheme?.id}
            globalThemeBackground={currentUser.chatTheme?.customBackground}
            onSeen={() => undefined}
            onThemeChange={() => undefined}
            onSend={async (text, file) => {
              const result = await sendMessage({
                recipientId: composeTarget.id,
                text,
                file
              });
              if (result.conversationId) {
                window.location.assign(`/messages/${result.conversationId}`);
              }
            }}
          />
        ) : (
          <EmptyState title="No messages yet" description="Start a conversation or send a message request to see it here." />
        )}
      </div>
    </Layout>
  );
}
