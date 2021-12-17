import React from "react";
import { ConversationProvider } from "./hooks/use-conversation";
import { SubApp } from "./subapp";

import "c3/c3.css";
import "./styles/c3-overrides.css";
import "./styles/c3-extensions.css";

function App() {
	return (
		<ConversationProvider>
			<SubApp />
		</ConversationProvider>
	);
}

export default App;
