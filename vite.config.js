import { defineConfig } from 'vite';
// import { esbuild, vite } from 'atomizer-plugins';
import atomizerConfig from './atomizer.config.js';
import { atomizerPlugin } from './atomizerPlugin.js';

// const atomizerPluginBuild = vite({
//     config: atomizerConfig,
//     outfile: 'dist/atomizer.css',
// });

// const atomizerPluginDev = esbuild({
//     config: atomizerConfig,
//     outfile: 'dist/atomizer.css',
// });

export default defineConfig(() => {
    return {
        plugins: [
            atomizerPlugin({
                    config: atomizerConfig,
                    outfile: 'atomizer.scss',
                })
        ],
    };
});