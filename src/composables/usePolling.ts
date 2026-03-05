import { ref, onUnmounted, type Ref } from "vue";

export function usePolling(
  callback: () => Promise<void>,
  intervalMs: number = 3000,
) {
  const isPolling: Ref<boolean> = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  function start(): void {
    if (isPolling.value) return;
    isPolling.value = true;
    timer = setInterval(async () => {
      try {
        await callback();
      } catch {
        stop();
      }
    }, intervalMs);
  }

  function stop(): void {
    isPolling.value = false;
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  onUnmounted(() => stop());

  return { isPolling, start, stop };
}
