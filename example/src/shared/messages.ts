export type PageInfo = {
	title: string;
	url: string;
	capturedAt: number;
};

export const STORAGE_KEYS = {
	lastPage: 'lastPageInfo',
};

export enum MessageType {
	ContentPageInfo = 'content:page-info',
	ContentHighlight = 'content:highlight',
	PopupHighlight = 'popup:highlight',
	PopupOpenTab = 'popup:open-tab',
	PopupGetLastPage = 'popup:get-last-page',
	PopupPortPing = 'popup:port-ping',
	BackgroundPortPong = 'background:port-pong',
	TabGetLastPage = 'tab:get-last-page',
}

export type ExtensionMessage =
	| {
			type: MessageType.ContentPageInfo;
			payload: PageInfo;
	  }
	| {
			type: MessageType.ContentHighlight;
			payload: { color: string };
	  }
	| {
			type: MessageType.PopupHighlight;
	  }
	| {
			type: MessageType.PopupOpenTab;
	  }
	| {
			type: MessageType.PopupGetLastPage;
	  }
	| {
			type: MessageType.PopupPortPing;
	  }
	| {
			type: MessageType.BackgroundPortPong;
	  }
	| {
			type: MessageType.TabGetLastPage;
	  };
