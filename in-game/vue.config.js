const path = require('path');

module.exports = {
    publicPath: './',
    lintOnSave: false,
    outputDir: path.resolve(__dirname, '../native/windows/in-game'),
    chainWebpack: (config) => {
        config.plugin('copy').tap((options) => {
            options[0][0].ignore.push('./public/css/**/*');
            options[0][0].ignore.push('/public/css/**/*');
            options[0][0].ignore.push('public/css/**/*');
            options[0][0].ignore.push('/css/**/*');
            options[0][0].ignore.push('css/**/*');
            options[0][0].ignore.push('./public/img/**/*');
            options[0][0].ignore.push('/public/img/**/*');
            options[0][0].ignore.push('public/img/**/*');
            options[0][0].ignore.push('/img/**/*');
            options[0][0].ignore.push('img/**/*');
            console.log(options[0][0].ignore);
            return options;
        });
    },
};
