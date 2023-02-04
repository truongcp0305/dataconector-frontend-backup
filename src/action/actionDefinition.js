import { util } from '../plugins/util';

function autoImportActionModules() {
    var context = require.context('./modules', true, /\.(js)$/);
    var modules = {};
    let filename = '';
    context.keys().forEach((filePath) => {
        filename = filePath.match(/[^\\/:*?"<>|\r\n]+$/)[0].replace('.js', '');
        filename = util.str.toSnakeCase(filename);
        modules[filename] = context(filePath)['default'];
    });
    return modules;
}
let modules = autoImportActionModules();
export default modules;
