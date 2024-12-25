import { copy } from "https://deno.land/std@0.224.0/fs/copy.ts";

const appsDir = await getAppsDir();

const apps = [
    {
        Dir: "./src/GT2/",
        Name: "GT2_DigitalSpeedo"
    },
    {
        Dir: "./src/GT4/",
        Name: "GT4_Digital"
    },
    {
        Dir: "./src/Other/",
        Name: "EngineStreamDebug"
    },
    {
        Dir: "./src/Other/",
        Name: "SimpleAnalogTach"
    }
];

apps.forEach(app => copyApp(app, appsDir));

async function copyApp(app: App, destDir: string) {
    const source = app.Dir + app.Name;
    const dest = destDir + app.Name;

    // Clear existing app
    try {
        console.log(`Removing ${dest}`);
        await Deno.remove(dest, { recursive: true });
    } catch (_) {
        console.log(`${dest} does not exist`)
    }

    console.log(`Copying ${source} to ${destDir}`);
    await copy(source, dest);
}

async function getAppsDir(): Promise<string> {
    const configFile = "config";
    const defaultAppsDir =
        "C:\\Program Files (x86)\\Steam\\steamapps\\common\\BeamNG.drive\\ui\\modules\\apps\\";

    try {
        const appsDir = await Deno.readTextFile("config");
        return appsDir;
    } catch (_) {
        console.log("Config file doesn't exist.");
        const appsDir =
            prompt(
                "Paste the path to your BeamNG.drive apps folder:",
                defaultAppsDir,
            ) ?? defaultAppsDir;
        await Deno.writeTextFile(configFile, appsDir);
        return appsDir;
    }
}

interface App {
    Name: string;
    Dir: string;
}
