export const matchShortcut = (e: KeyboardEvent | React.KeyboardEvent, shortcut: string) => {
    if (!shortcut) return false;
    const parts = shortcut.split('+');
    const key = parts.pop()?.toLowerCase();
    const meta = parts.includes('Meta');
    const shift = parts.includes('Shift');
    const alt = parts.includes('Alt');

    const eventKey = e.key.toLowerCase();

    return (
        (eventKey === key || e.key === key) &&
        (e.metaKey || e.ctrlKey) === meta &&
        e.shiftKey === shift &&
        e.altKey === alt
    );
};
