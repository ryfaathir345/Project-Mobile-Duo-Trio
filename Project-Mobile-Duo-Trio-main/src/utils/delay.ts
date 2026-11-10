/** Utility asynchronous sederhana untuk memberi jeda dalam milidetik. */
export function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
