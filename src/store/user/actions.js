import { orgchartApi } from '@/api/orgchart.js';
import { userApi } from '@/api/user';
import dayjs from 'dayjs';
import Vue from 'vue';

const checkAndSetAvatarUrl = (context, userId) => {};

const checkAndSetUserInfo = async (context, userId) => {
    if (!context.state.allUserInfo[userId]) {
        let obj = {
            rolesOgchart: [],
            detailUser: {},
        };
        let detailInfo = await userApi.getDetailUser(userId);
        if (detailInfo.status == 200) {
            obj.detailUser = detailInfo.data.user;
            obj.detailUser.createAt = dayjs(obj.detailUser.createAt).format(
                'DD/MM/YYYY',
            );
        }
        let roleInfo = await orgchartApi.getRolesByUser([{ idUser: userId }]);
        if (roleInfo.status == 200) {
            obj.rolesOgchart = roleInfo.data[0].roles;
        }
        Vue.set(context.state.allUserInfo, userId, obj);
    }
};

export { checkAndSetAvatarUrl, checkAndSetUserInfo };
