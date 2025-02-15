import { getStream } from '@/utils/server/ai_vendors/getStream';
import { getTokenCount } from '@/utils/server/ai_vendors/getTokenCount';

import { ChatBody } from '@/types/chat';

export const runtime = 'edge';

const handler = async (req: Request): Promise<Response> => {
  const { model, messages, apiKey, systemPrompt, temperature } =
    (await req.json()) as ChatBody;

  const { error: tokenCountError, count } = await getTokenCount(
    model,
    systemPrompt.content,
    messages,
  );

  if (tokenCountError) {
    console.error(tokenCountError);
    return new Response('Error', {
      status: 500,
      statusText: tokenCountError,
    });
  }

  const { error: streamError, stream } = await getStream(
    model,
    systemPrompt.content,
    temperature,
    apiKey,
    messages,
    count!,
  );

  if (streamError) {
    console.error(streamError);
    return new Response('Error', {
      status: 500,
      statusText: streamError,
    });
  }

  return new Response(stream);
};

export { handler as GET, handler as POST };
