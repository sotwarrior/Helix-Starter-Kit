'use strict';

var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

const introPrompts = require('../global/prompts/intro.prompts.js');
const modulePrompts = require('../global/prompts/module.prompts.js');
const common = require('../global/common.js');
const presets = common.GetConfig();

module.exports = class extends Generator {

    constructor(args, opts) { 
        super(args, opts); 
    }

    init() {
        this.log(yosay('welcome to ' + chalk.magenta('Helix Starter Kit') + ' Yeoman generator!'));
    }

    prompting() {

        // Only Prompt for Questions that don't have a preset config option
        var prompts = common.TrimPrompts(introPrompts, presets.Generators);

        // if (!common.getSolutionFilePath(this.destinationPath())) {
        //     prompts = prompts.filter(function (x) {
        //         return x.choices.value == 'create-module';
        //     });
        // }

        // console.log(prompts);

        return this.prompt(prompts).then((answers) => {
            if (answers.GeneratorType === 'initialize') {

                // Solution Initialization
                this.composeWith(require.resolve('../solution-setup/'));

            }

            if (answers.GeneratorType === 'create-module') {

                // Create New Module Prompts
                return this.prompt(common.TrimPrompts(modulePrompts, presets.Generators)).then((moduleanswers) => {
                    if (moduleanswers.GeneratorModuleType === 'project') {
                        this.composeWith(require.resolve('../create-module/helix-project/'));
                    }
        
                    if (moduleanswers.GeneratorModuleType === 'feature')
                    {
                        this.composeWith(require.resolve('../create-module/helix-feature/'));
                    }
        
                    if (moduleanswers.GeneratorModuleType === 'foundation') 
                    {
                        this.composeWith(require.resolve('../create-module/helix-foundation/'));
                    }
                });
            }
        });
    }
};