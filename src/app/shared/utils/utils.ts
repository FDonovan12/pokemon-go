export function createTimer(label: string) {
    const start = performance.now();
    let last = start;

    return (checkpoint: string) => {
        const now = performance.now();
        console.log(`[${label}] ${checkpoint}: +${(now - last).toFixed(2)}ms (total: ${(now - start).toFixed(2)}ms)`);
        last = now;
    };
}
