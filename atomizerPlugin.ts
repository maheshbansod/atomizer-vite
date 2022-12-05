import Atomizer from "atomizer";
import fs from 'fs';
import { Plugin } from "vite";

export const atomizerPlugin = (options): Plugin => {
    const atomizer = new Atomizer({
        verbose: options.verbose,
    });
    const lookup = new Map<string, Array<string>>();

    const writeToFile = () => { //TODO: debounced
        const classes = Array.from(lookup.values()).flat();
        const config = atomizer.getConfig(classes, options.config);
        const css = atomizer.getCss(config, options.cssOptions);
        fs.writeFile(options.outfile || 'atomizer.scss', css, (e) => { });
    };

    return {
        name: 'unplugin-atomizer',
        // transformInclude(id) {},

        /* Extract atomic css classes from each file that has changed */
        transform(code, id) {
            if(id.includes('.scss') || id.includes('.css')) return null;
            // Find atomic classes and add them to our cache
            lookup.set(id, atomizer.findClassNames(code));
            writeToFile();
            return null;
        },
        transformIndexHtml(html) {
            // Find atomic classes and add them to our cache
            lookup.set('entry-point', atomizer.findClassNames(html));
            writeToFile();
            return html;
        }
    };
};