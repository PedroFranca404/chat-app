export type ViewType = "chat" | "friends";

export type ChatMap = Record<string, MessageUI[]>;

export interface MessageUI {
    id: string;
    text: string;
    sender: string;
    time: string;
    read: boolean;
}
