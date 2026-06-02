interface EnrichedItem {
  word: string;
  phonetic?: string;
  meaningZh: string;
  exampleEn: string;
  exampleZh: string;
  mnemonic: string;
}

/**
 * 调用 OpenAI 兼容 Chat Completions（兼容 DeepSeek）。
 */
async function callOpenAiCompatible(words: string[], interestTags: string[]): Promise<EnrichedItem[]> {
  const baseUrl = process.env.LLM_BASE_URL ?? "https://api.deepseek.com";
  const apiKey = process.env.DEEPSEEK_API_KEY ?? process.env.OPENAI_API_KEY;
  const model = process.env.LLM_MODEL ?? "deepseek-chat";
  if (!apiKey) return [];

  const prompt = `你是英语教学助手。请为这些单词生成 JSON 数组，字段必须为: word, phonetic, meaningZh, exampleEn, exampleZh, mnemonic。兴趣标签：${interestTags.join(
    "、"
  )}。单词：${words.join(", ")}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok) return [];

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { items?: EnrichedItem[] };
  return parsed.items ?? [];
}

/**
 * 生成词条增强信息，无密钥时自动降级本地模板。
 */
export async function enrichWords(words: string[], interestTags: string[]): Promise<EnrichedItem[]> {
  const remote = await callOpenAiCompatible(words, interestTags);
  if (remote.length > 0) return remote;

  return words.map((word) => ({
    word,
    phonetic: "/demo/",
    meaningZh: `“${word}”的中文释义`,
    exampleEn: `The student reviews "${word}" before exams.`,
    exampleZh: `学生在考试前复习“${word}”。`,
    mnemonic: `结合兴趣标签（${interestTags.join("、") || "学习"}）联想记忆`,
  }));
}
