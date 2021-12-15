import React from "react";
import { ConversationProvider } from "./hooks/use-conversation";
import { SubApp } from "./subapp";

function App() {
	return (
		<ConversationProvider>
			<SubApp />
		</ConversationProvider>
	);
}

export default App;
