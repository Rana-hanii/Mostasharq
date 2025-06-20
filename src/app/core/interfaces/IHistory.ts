export type IHistory = Array<{
  chat_id: number;
  chat_title: string;
  title: string;
  status: string;
  started_at: string;
  ended_at: null;
  last_message_preview: null;
  last_message_time?: string;
  created_at?: string;
}>;