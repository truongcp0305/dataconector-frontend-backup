import objectAccessApi from '@/api/objectAccess.js';
export default class {
    /**
     *
     * @param {Object} comp Component vuejs phục vụ việc tự động kiểm tra xem có nên lock object nữa không
     * @param {*} type Loại đối tượng
     * @param {*} id id đối tượng
     * @param {*} action hành động cần khóa
     * @param {*} intervalTime Thời gian lặp lại giữa hai lần khóa object
     */
    constructor(comp, type, id, action, intervalTime = 5) {
        this.comp = comp;
        this.type = type;
        this.id = id;
        this.action = action;
        if (this.intervalTime <= 0) {
            throw new Error('intervalTime can not be smaller or equal than 0');
        } else {
            this.intervalTime = intervalTime;
        }
        this.lockTimes = 0; // số lần đã gửi tín hiệu lock đối tượng
        this.lockInterval = null; // lưu lại đối tượng lặp đi lặp lại việc lock object
        this.checkOnInactiveTimes = 0;
    }

    checkParams() {
        return this.type && this.id && this.action;
    }

    /**
     * @returns {
     *  stauts: 'unknown|locked|free'
     *  info: {
     *      reason: '',
     *      lockedBy: '',
     *      lastUpdateTime: ''
     *  }
     * }
     * stauts là unknown khi có lỗi xảy ra ở khâu nào đó
     * lastUpdateTime là thời gian lock object gần nhất tính theo timestamp second
     */
    async checkStatus() {
        if (this.checkParams()) {
            let res = await objectAccessApi.checkStatus(
                this.type,
                this.id,
                this.action,
                this.intervalTime,
            );
            return res.data;
        } else {
            console.error(
                '[SYMPER] Can not check status when type, id, or action is empty',
            );
            return {
                stauts: 'unknown',
                info: {
                    reason: 'One or more params (id, type, action) is empty',
                },
            };
        }
    }

    /**
     *
     * @returns {
     *  staus: 'failed|successed',
     *  info: {
     *      reason: '',
     *      lockedBy: '',
     *      lastUpdateAgoForInsecond: ''
     *    }
     * }
     */
    lock() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (self.checkParams()) {
                if (self.lockInterval) {
                    reject(
                        '[Symper] Object is set locked, no need lock any more!',
                    );
                } else {
                    self.lockInterval = setInterval(async () => {
                        try {
                            if (!self.comp._inactive) {
                                let res = await objectAccessApi.lockObject(
                                    self.type,
                                    self.id,
                                    self.action,
                                    self.intervalTime,
                                );
                                self.lockTimes += 1;
                                if (self.lockTimes == 1) {
                                    resolve(res.data);
                                }
                            } else {
                                self.checkOnInactiveTimes += 1;
                            }
                        } catch (error) {
                            self.unlock();
                            console.error(
                                error,
                                'Can not continue lock object: ',
                                self,
                            );
                        }
                    }, self.intervalTime * 1000);
                }
            } else {
                console.error(
                    '[SYMPER] Can not lock object when type, id, or action is empty',
                );
                resolve({
                    stauts: 'failed',
                    info: {
                        reason: 'One or more params (id, type, action) is empty',
                    },
                });
            }
        });
    }

    async unlock() {
        if (this.lockInterval) {
            clearInterval(this.lockInterval);
            this.lockInterval = null;
            self.lockTimes = 0;
        }
    }
}
