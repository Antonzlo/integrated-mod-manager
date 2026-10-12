# Weapon-type icons (Genshin Impact)

Icons for the Bow, Catalyst, Claymore, Polearm and Sword categories in the online sidebar
(`src/gameData.json` → `_sIconUrl`). GameBanana has no icons for these categories, and the
previous source (`https://api.hakush.in/gi/UI/WEAPON_*.webp`) is no longer reachable.

These are Genshin Impact's in-game weapon-type icons (© HoYoverse), bundled so the sidebar needs
no third-party request. Downloaded on 2026-10-12 from Project Amber:

| File | Source URL |
| :--- | :--- |
| `bow.png` | https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_Bow.png |
| `catalyst.png` | https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_Catalyst.png |
| `claymore.png` | https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_Claymore.png |
| `polearm.png` | https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_Pole.png |
| `sword.png` | https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_Sword.png |

The same files are also served by Enka.Network at `https://enka.network/ui/UI_GachaTypeIcon_<Type>.png`.

To refresh them:

```bash
for t in Bow Catalyst Claymore Pole Sword; do
  curl -fsSL -o "$(echo "$t" | tr '[:upper:]' '[:lower:]' | sed 's/^pole$/polearm/').png" \
    "https://gi.yatta.moe/assets/UI/UI_GachaTypeIcon_$t.png"
done
```
