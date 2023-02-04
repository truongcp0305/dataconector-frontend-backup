import Api from './api';
import { appConfigs } from './../configs.js';
let api = new Api(appConfigs.uniqueApiDomain.location);

export default {
    getAddressFromLocation(location) {
        return api.get('reverse.php', { lat: location.latitude, lon: location.longitude, zoom: 18, format: 'jsonv2' });
    },
};
