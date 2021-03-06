'use strict';

var Generator = require('yeoman-generator');
var path = require('path');
var chalk = require('chalk');
var mkdir = require('mkdirp');
var guid = require('node-uuid');

const projectPrompts = require('../../global/prompts/modules/project.prompts.js');
const common = require('../../global/common.js');
const constants = require('../../global/constants.js');

let presets;
let parameters = {};

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        parameters = opts.options;

        var presetOptions = common.GetConfig(parameters.Testing);

        if (typeof(presetOptions) != 'undefined' && presetOptions != null) {
            presets = presetOptions.Generators;
        }
    }

    init() {
        this.log(chalk.blue('Creating a Project Module...'));
    }

    prompting() {

        // Only Prompt for Questions that don't have a preset config option set
        let prompts = common.TrimPrompts(projectPrompts, presets);

        if (typeof(prompts) != 'undefined') {
            return this.prompt(prompts).then((answers) => {
                this._processParameters(answers, presets);
            });
        } else {
            this._processParameters(null, presets);
        }
    }

    _processParameters(answers, presets) {
        parameters.ModuleName = common.ProcessParameter(answers, presets, constants.MODULE_NAME);
    }

    configure() {
        this.ProjectGuid = guid.v4();
        this.targetPath = path.join('src', 'Project', parameters.ModuleName);
    }

    runGenerator() {

        this._initializeFolders();
        this._configureUnicorn();
        this._configureSiteDefinition();
        this._configureProject();
        this._configureLayoutDefinition();
        this._configurePackages();
        this._configureAssembly();
        this._configureCodeGeneration();
        this._configureSerializedItems();
        this._solutionAttach();

    }

    _initializeFolders() {
        mkdir.sync(path.join(this.targetPath, 'code/App_Config'));
        mkdir.sync(path.join(this.targetPath, 'code/App_Config/Include'));
        mkdir.sync(path.join(this.targetPath, 'code/App_Config/Include/Project'));

        this.fs.copy(
            this.templatePath('./**'),
            this.destinationPath(this.targetPath), {
                globOptions: { dot: false }
            }
        );
    }

    _configureUnicorn()
    {
        mkdir.sync(path.join(this.targetPath, 'serialization'));

        this.fs.copyTpl(
            this.templatePath('./code/App_Config/Include/Project/.Project.Sample.Serialization.config'),
            this.destinationPath(path.join(this.targetPath, 'code/App_Config/Include/Project/', 'Project.' + parameters.ModuleName + '.Serialization.config')), {
                Parameters: parameters
            }
        );
    }

    _configureSiteDefinition() {
        this.fs.copyTpl(
            this.templatePath('./code/App_Config/Include/Project/.Project.Sample.config'),
            this.destinationPath(path.join(this.targetPath, 'code/App_Config/Include/Project', 'Project.' + parameters.ModuleName + '.config')), {
                Parameters: parameters
            }
        );
    }

    _configureProject() {
        this.fs.copyTpl(
            this.templatePath('./code/.Sitecore.Project.csproj'),
            this.destinationPath(path.join(this.targetPath, 'code', parameters.SolutionPrefix + '.Project.' + parameters.ModuleName + '.csproj')), {
                ProjectGuid: `{${this.ProjectGuid}}`,
                Parameters: parameters
            }
        );
    }

    _configureLayoutDefinition() {
        this.fs.copyTpl(
            this.templatePath('./code/Views/Layout/.Layout.cshtml'),
            this.destinationPath(path.join(this.targetPath, 'code', 'Views', parameters.ModuleName, 'Layout.cshtml')),
            {
                Parameters: parameters
            }
        );
    }

    _configurePackages() {
        this.fs.copyTpl(
            this.templatePath('./code/.packages.config'),
            this.destinationPath(path.join(this.targetPath, 'code', 'packages.config')), {
                Parameters: parameters
            }
        );
    }

    _configureAssembly() {

        this.fs.copyTpl(
            this.templatePath('./code/Properties/.AssemblyInfo.cs'),
            this.destinationPath(path.join(this.targetPath, 'code/Properties', 'AssemblyInfo.cs')), {
                Parameters: parameters
            }
        );
    }

    _configureCodeGeneration() {

        if (parameters.ModuleHasTemplates == true) {
            this.fs.copyTpl(
                this.templatePath('./code/.CodeGen.config'),
                this.destinationPath(path.join(this.targetPath, 'code/', 'CodeGen.config')), {
                    Parameters: parameters
                }
            );
        }
        
    }

    _configureSerializedItems() {

        // Templates
        this.fs.copyTpl(this.templatePath('./serialization/Templates/.Template.yml'), this.destinationPath(path.join(this.targetPath, 'serialization/', 'Templates/', parameters.ModuleName + '.yml')), { Parameters: parameters, Id: guid.v4() });

        mkdir.sync(path.join(this.targetPath, 'serialization', 'Templates', parameters.ModuleName));
        
        this.fs.copyTpl(this.templatePath('./serialization/Templates/.Home.yml'), this.destinationPath(path.join(this.targetPath, 'serialization/', 'Templates/', parameters.ModuleName, 'Home.yml')), { Parameters: parameters, Id: guid.v4() });

        // Renderings
        this.fs.copyTpl(this.templatePath('./serialization/Renderings/.Rendering.yml'), this.destinationPath(path.join(this.targetPath, 'serialization/', 'Renderings/', parameters.ModuleName + '.yml')), { Parameters: parameters, Id: guid.v4() });

        // Layout
        this.fs.copyTpl(this.templatePath('./serialization/Layout/.Layout.yml'), this.destinationPath(path.join(this.targetPath, 'serialization', 'Layout', parameters.ModuleName, 'Layout.yml')), { Parameters: parameters, Id: guid.v4() });

        mkdir.sync(path.join(this.targetPath, 'serialization', 'Layout', parameters.ModuleName));

        this.fs.copyTpl(this.templatePath('./serialization/Layout/.Folder.yml'), this.destinationPath(path.join(this.targetPath, 'serialization', 'Layout', parameters.ModuleName + '.yml')), { Parameters: parameters, Id: guid.v4() });

        // Media Items
        this.fs.copyTpl(this.templatePath('./serialization/Media/.Media.yml'), this.destinationPath(path.join(this.targetPath, 'serialization/', 'Media/', parameters.ModuleName + '.yml')), { Parameters: parameters, Id: guid.v4() });

        // Content Items
        this.fs.copyTpl(this.templatePath('./serialization/Content/.Folder.yml'), this.destinationPath(path.join(this.targetPath, 'serialization', 'Content', parameters.ModuleName + '.yml')), { Parameters: parameters, Id: guid.v4() });

        mkdir.sync(path.join(this.targetPath, 'serialization', 'Content', parameters.ModuleName));

        this.fs.copyTpl(this.templatePath('./serialization/Content/.Home.yml'), this.destinationPath(path.join(this.targetPath, 'serialization', 'Content', parameters.ModuleName, 'Home.yml')), { Parameters: parameters, Id: guid.v4() });

    }

    _solutionAttach() {

        common.addProjectToSolution("project", this.destinationPath(), this.ProjectGuid, parameters.SolutionPrefix, parameters.ModuleName);

    }
}