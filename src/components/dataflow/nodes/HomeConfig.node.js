export default class HomeConfig {
    /**
     * đánh dấu dataflow này có áp dụng quy tắc sinh cột mới không 
     * với các node union, join thì các name các cột được tạo mới như trước đây là sẽ bỏ dấu từ title
     * theo cách mới sẽ là lấy từ cột cũ tương ứng, trường hợp trùng thì mới phải tăng hậu tố lên
     * giá trị của changeNewColGeneration là true khi action là create hoặc được chuyển qua chế độ này
     */
    extra = {
        changeColGeneration: false
    };
    name = '';
    description = '';
    variables = [];
    type = 'home';
    datasetNameByNodeId={}
    isRunningDataflow = false;
    autoSaveConfig = {
        active: false,
        restoring: false,
        saving: false,
    };
    constructor() { }

    getVariables() {
        return this.variables.reduce((arr, el) => {
            if (el.name.trim()) {
                el.name = el.name.trim();
                arr.push(el);
            }
            return arr;
        }, []);
    }

    setConfigForRunning(data = {}) {
        if (typeof data == 'object') {
            if (typeof data.variables == 'object') {
                this.variables.map((el) => {
                    if (data.variables.hasOwnProperty(el.name)) {
                        el.value = data.variables[el.name];
                    }
                    return el;
                });
            }
        }
    }
}