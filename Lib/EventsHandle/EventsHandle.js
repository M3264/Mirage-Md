const EventEmitter = require('events');
const HacxK = new EventEmitter();
const fs = require('fs');
const path = require('path');

let AntiCheckers;
const debounceTimeout = 2000;
let sock;

async function loadAntiCheckers() {
    const { default: chalk } = await import('chalk');
    const AntiChecker = {};
    const pluginDir = path.join(__dirname, '../../Events/Anti');

    try {
        const files = await fs.promises.readdir(pluginDir);

        for (const file of files) {
            if (!file.endsWith('.js')) continue;

            const commandPath = path.join(pluginDir, file);
            try {
                const commandModule = require(commandPath);

                if (commandModule.isEnabled === false) {
                    console.warn(chalk.yellow(`⚠️ Event in ${file} is disabled.`));
                    continue;
                }

                if (commandModule.event) {
                    const usages = Array.isArray(commandModule.event) ? commandModule.event : [commandModule.event];
                    for (const usage of usages) {
                        AntiChecker[usage] = commandModule;
                    }
                    console.log(chalk.green(`✅ Loaded Event: ${commandModule.event} from ${file}`));
                } else {
                    console.warn(chalk.yellow(`⚠️ Event in ${file} does not have a event property.`));
                }
            } catch (error) {
                console.error(chalk.red(`❌ Error loading Event from ${file}:`, error));
            }
        }
    } catch (error) {
        console.error(chalk.red('❌ Error reading the anti directory:', error));
    }

    return AntiChecker;
}

function watchEvents() {
    let reloadTimeout;
    const pluginDir = path.join(__dirname, '../../Events/Anti');

    fs.watch(pluginDir, { recursive: true }, (eventType, filename) => {
        if (filename.endsWith('.js')) {
            clearTimeout(reloadTimeout);
            reloadTimeout = setTimeout(async () => {
                const commandPath = path.join(pluginDir, filename);

                try {
                    delete require.cache[require.resolve(commandPath)];
                    const newCommandModule = require(commandPath);

                    if (typeof newCommandModule.execute === 'function' && newCommandModule.event) {
                        registerCommand(newCommandModule, AntiCheckers);
                        console.log('\x1b[35m%s\x1b[0m', `[Hot Reload] Successfully reloaded ${filename}`);
                    } else {
                        console.warn('\x1b[35m%s\x1b[0m', `[Hot Reload] Skipped ${filename}: Invalid Event module format.`);
                    }
                } catch (error) {
                    console.error(`[Hot Reload] Error reloading ${filename}: ${error.message}`);
                }
            }, debounceTimeout);
        }
    });
}

function registerCommand(commandModule, AntiCheckers) {
    if (commandModule.usage) {
        const usages = Array.isArray(commandModule.usage) ? commandModule.usage : [commandModule.usage];
        for (const usage of usages) {
            AntiCheckers[usage] = commandModule;
        }
    }
}

async function registerEventListeners(chalk) {
    const events = Object.keys(AntiCheckers);
    
    for (const event of events) {
        sock.ev.on(event, async (data) => {
            try {
                if (typeof data[Symbol.iterator] === 'function') {
                    // Data is iterable, spread it as arguments
                    await AntiCheckers[event].execute(sock, ...data);
                } else {
                    // Data is not iterable, pass it as is
                    await AntiCheckers[event].execute(sock, data);
                }
                console.log(chalk.blue(`📩 Event handled: ${event}`));
            } catch (error) {
                console.error(chalk.red(`❌ Error handling event ${event}:`, error));
            }
        });
    }
}


async function ownEvent(sok) {
    const { default: chalk } = await import('chalk');
    sock = sok
    AntiCheckers = await loadAntiCheckers();
    watchEvents();
    registerEventListeners(chalk);
}

module.exports = { ownEvent, HacxK };
