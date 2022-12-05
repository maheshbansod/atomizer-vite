import { Plugin } from "vite";
import Atomizer from 'atomizer';
import type { AtomizerConfig, AtomizerOptions, CSSOptions } from 'atomizer';
import fs from 'fs';
import {debounce} from 'lodash-es';

export interface AtomizerPluginOptions extends AtomizerOptions {
    /* Options passed into Atomizer.getCSS method */
    cssOptions?: CSSOptions;
    /* Atomizer config options */
    config: AtomizerConfig;
    /* Output file name, relative to cwd. Defaults to atomizer.css */
    outfile?: string;
}

export const atomizerPlugin = (options: AtomizerPluginOptions): Plugin => {
    const atomizer = new Atomizer({
        verbose: options.verbose,
    });
    const lookup = new Map<string, Array<string>>();
    let lastComputedCss: string|null = null; // maybe read from outfile?

    const writeToFile = debounce(() => {
        const classes = Array.from(lookup.values()).flat();
        const config = atomizer.getConfig(classes, options.config);
        const css = atomizer.getCss(config, options.cssOptions);

        // don't try to write if contents are gonna be same
        if(lastComputedCss === css) return;
        lastComputedCss = css;

        const source = css;
        const fileName = options.outfile || 'atomizer.css';

        fs.writeFile(fileName, source, (_err) => {});
    }, 1000, {leading: true});

    return {
        name: 'atomizer plugin',

        /* Extract atomic css classes from each file that has changed */
        transform(code, id) {
            if(id.includes('.css') || id.includes('.scss')) return null;
            // Find atomic classes and add them to our cache
            lookup.set(id, atomizer.findClassNames(code));
            writeToFile();
            return null;
        },

        transformIndexHtml(html) {
            lookup.set('html-entry-point', atomizer.findClassNames(html));
            writeToFile();
        }
    };
}