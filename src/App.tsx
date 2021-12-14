import React from "react";
import { ConversationProvider } from "./hooks/useConversation";
import { SubApp } from "./subapp";

function App() {
	return (
		<ConversationProvider>
			<SubApp />
		</ConversationProvider>
	);
}

export default App;
