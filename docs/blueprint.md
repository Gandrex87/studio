# **App Name**: AutoPilot AI

## Core Features:

- Welcome Screen: Welcome screen with 'Start Conversation' button to initiate the car recommendation process.
- Chat Interface: Main chat window displaying conversation history with distinct styling for user and agent messages.
- Message Input: Message input form for users to send their queries.
- Agent Response Simulation: Simulate the agent's responses based on user messages using a series of canned messages, chosen randomly for dynamic feel. This would normally use a tool like an LLM, but in the mocked environment a 'fake' tool selects canned messages.
- Loading Indicator: Display a loading indicator while waiting for the agent's response.
- Auto Scroll: Automatically scroll the chat window to the bottom when a new message is added, ensuring the latest messages are always in view.
- Markdown Rendering: Render Markdown content from the agent properly (lists, bold text, etc.) using react-markdown.

## Style Guidelines:

- Primary color: Electric blue (#7DF9FF) for a modern tech and automotive feel. The hue relates to forward movement and electricity.
- Background color: Dark gray (#282A3A), creating a professional backdrop that emphasizes content and gives a sleek look.
- Accent color: Cyan (#00FFFF), an analogous hue to the primary, used sparingly for highlighting interactive elements, offering visual interest against the darker background.
- Font: 'Inter' (sans-serif) for high contrast and readability.
- Lucide-react icons: User (User icon) and agent (Bot icon) avatars next to each message, with simple and clean designs.
- Centered chat interface with a max-width for desktop view, fully responsive on mobile.
- Subtle typing animation (three animated dots) for loading indicator.