/**
 * 浏览器是否支持 Web Speech 合成。
 */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * 停止当前朗读。
 */
export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/**
 * 使用浏览器 Web Speech API 播放单词读音。
 */
export function speak(text: string, rate = 1): void {
  if (!isSpeechSupported() || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = "en-US";
  utterance.rate = rate;
  stopSpeaking();
  window.speechSynthesis.speak(utterance);
}
