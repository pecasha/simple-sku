/* eslint-disable */

const Sku = function(number) {
    this.num = parseInt(number); //套装几层结构
    this.suitRuleInfo = {}; //套装信息 如 {"6692398":"0_26_0_2","6692393":"0_24_0_2"} //{套装ID:第一层_第二层_第三层_第四层}
    this.paramsSort = []; //已经设置的层级ID及值[0:21,1:0,2:0,3:5]
    this.paramsArr = []; //每层可选范围[0:[21,11],1:[2]],
    this.canNotArr = []; //不能选数组，返回给回调函数使用
    this.tempCan = []; //临时可选
};

Sku.prototype = {
    //配置
    config(obj) {
        this.suitRuleInfo = obj.suitRuleInfo;
        this.init();
    },
    //设置信息
    set(position, val) {
        this.paramsSort[position] = val;
        this.singleInit();
        this.out();
    },
    //删除信息
    unset(position) {
        this.paramsSort[position] = 0;
        this.singleInit();
        this.out();
    },
    //全局初始化
    init() {
        //判断套装使用的几层模型
        if(!this.num) {
            const suitRuleInfo = this.suitRuleInfo;
            for(let i in suitRuleInfo) {
                if(suitRuleInfo.hasOwnProperty(i)) {
                    if(this.num) break; //只执行一次
                    this.num = suitRuleInfo[i].split("_").length;
                }
            }
        }

        //根据结构类型创建参数对象
        for(let i = 0; i < this.num; i++) {
            this.paramsSort[i] = 0;
            this.paramsArr[i] = [];
        }

        //每层可选范围
        for(let i in this.suitRuleInfo) {
            if(this.suitRuleInfo.hasOwnProperty(i)) {
                const curSuitRuleInfo = this.suitRuleInfo[i].split("_");
                for(let j in curSuitRuleInfo) {
                    if(curSuitRuleInfo.hasOwnProperty(j)) {
                        if(!this.paramsArr[j].includes(curSuitRuleInfo[j])) {
                            if(curSuitRuleInfo[j] > 0) {
                                this.paramsArr[j].push(curSuitRuleInfo[j]);
                            }
                        }
                    }
                }
            }
        }

        if(typeof this.callBack === "function") this.callBack(Array(this.num).fill([]), void 0);
    },
    //临时变量初始化，循环中使用的变量［将每层可选的项置为空］
    tempInit() {
        for(let i = 0; i < this.num; i++) {
            this.tempCan[i] = [];
        }
    },
    //单次初始化变量，每次选择变更时要调整的量［将每层不可选的项置为空］
    singleInit() {
        for(let i = 0; i < this.num; i++) {
            this.canNotArr[i] = [];
        }
    },
    //外部输出
    out() {
        //判断当前设置了几个层级
        let number = 0;
        this.paramsSort.forEach((item, index) => {
            if(item || !this.paramsArr[index].length) {
                number++;
            }
        });

        //筛选
        this.loopJudge(number);

        //如果所有层级选择完整，且有符合条件的数据
        let suitId = void 0;

        if(number === this.num) {
            const curPattern = this.createPattern(this.paramsSort);
            for(let curSuitId in this.suitRuleInfo) {
                if(this.suitRuleInfo.hasOwnProperty(curSuitId)) {
                    if(new RegExp(curPattern).test(this.suitRuleInfo[curSuitId])) {
                        suitId = curSuitId;
                    }
                }
            }
        }

        //返回数据
        this.callBack(this.canNotArr, suitId);
    },
    //按需创建正则
    createPattern(positionObj) {
        const patternArr = [];
        for(let i = 0; i < this.num; i++) {
            let curVal = "[0-9]+";
            if(i in positionObj) curVal = positionObj[i];
            patternArr.push(curVal);
        }
        return patternArr.join("_");
    },
    //递归筛选每个层级不可选 positionArr 位置数组  k当前联合值的个数  number最大联合值的个数
    loopJudge(number, positionArr, k) {
        if(!number) return false;
        if(!positionArr) positionArr = [];
        if(!k) k = 0;

        //递归处理数据
        k = parseInt(k);
        for(let i = k; i < this.num; i++) {
            const curPositionArr = JSON.parse(JSON.stringify(positionArr));
            if(this.paramsSort[i]) {
                curPositionArr[i] = this.paramsSort[i];

                if(curPositionArr.length <= number) {
                    this.loopJudge(number, curPositionArr, i + 1);
                }

                this.judgeSuit(this.createPattern(curPositionArr), curPositionArr);
            }
        }

        return false;
    },
    //获取一定不可选的套装数据
    judgeSuit(curPattern, positionArr) {
        //重置临时变量
        this.tempInit();
        //判断正则
        const pattern = new RegExp(curPattern);
        const suitRuleInfo = this.suitRuleInfo;
        //匹配数据并解析［每个层级可选的项］
        for(let i in suitRuleInfo) {
            if(suitRuleInfo.hasOwnProperty(i)) {
                let curVal = suitRuleInfo[i];
                if(pattern.test(curVal)) {
                    const curArr = curVal.split("_");
                    for(let j in curArr) {
                        if(curArr.hasOwnProperty(j) && !this.tempCan[j].includes(curArr[j])) {
                            this.tempCan[j].push(curArr[j]);
                        }
                    }
                }
            }
        }
        //通过可选推导出各层级一定不能选的ID
        for(let i in this.tempCan) {
            if(this.tempCan.hasOwnProperty(i)) {
                if(i in positionArr) continue;

                const canNotArr = this.paramsArr[i].filter(key => !this.tempCan[i].includes(key));
                for(let j in canNotArr) {
                    if(canNotArr.hasOwnProperty(j)) {
                        //本次正则选择的层级不在范围里
                        if(!this.canNotArr[i].includes(canNotArr[j])) {
                            this.canNotArr[i].push(canNotArr[j]);
                        }
                    }
                }
            }
        }
    }
};

export default Sku;