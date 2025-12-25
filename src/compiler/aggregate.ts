import { HotkeyModel } from "./types";

export function aggregateHotkeys(hotkeys: HotkeyModel[]): HotkeyModel[] {
    return hotkeys
        .map((hotkey, index) => ({ hotkey, index }))
        .sort((a, b) => {
            const order = a.index - b.index;
            if (order !== 0) {
                return order;
            }
            return a.hotkey.id.localeCompare(b.hotkey.id);
        })
        .map((entry) => entry.hotkey);
}
