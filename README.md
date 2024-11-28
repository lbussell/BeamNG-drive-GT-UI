# BeamNG-drive-GT-UI

UI Mods for BeamNG.drive inspired by a certain racing game franchise.

## Mods

### GT2 - Digital Only

![screenshot of GT2 digital speedometer](/src/GT2/GT2_DigitalSpeedo/app.png)

## How to install

1. Download or clone this repository
2. Navigate to the mod you want to install (e.g.
   [GT2_DigitalSpeedo](/src/GT2/GT2_DigitalSpeedo/))
3. Copy the folder to
   `C:\Program Files (x86)\Steam\steamapps\common\BeamNG.drive\ui\modules\apps\`
4. Add the UI App to your HUD in-game

## Developing

A [Deno](https://deno.com/) script exists at the root of the repo to make
development easier. It copies UI apps from this repo to your BeamNG installation
directory. Use the script to update the apps in-game while developing them.

```
deno --allow-read --allow-write update-apps.ts
```

If it's the first time you've ran this script, it will ask for the path to your
BeamNG ui apps directory.
