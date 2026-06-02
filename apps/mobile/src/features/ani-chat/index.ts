// ─────────────────────────────────────────────────────────────────────────────
// ani-chat — Public API (barrel export)
// FSD rule: only export what is needed by widgets/pages
// ─────────────────────────────────────────────────────────────────────────────

export { useAniChat } from './model/useAniChat';
export { useAniChatStore } from './model/ani-chat.store';
export { ChatInputBar } from './ui/ChatInputBar';
export { AniMessageBubble } from './ui/AniMessageBubble';
export { UserMessageBubble } from './ui/UserMessageBubble';
export { AniTypingIndicator } from './ui/AniTypingIndicator';
