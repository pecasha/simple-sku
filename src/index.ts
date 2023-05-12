import {
    arrayDeepClone,
    arrayDifference
} from "@goodluck/util";

interface SkuConfigOptions {
    /** 规格信息数据 例：{6692398:"0_26_0_2",6692393:"0_24_0_2"} {skuID:"第一层_第二层_第三层_第四层"} 传入-1代表这一层不可选 */
    items: {
        [id: number]: string;
    };
    /** SKU层级深度，不传或0则自动计算 */
    depth?: number;
    /** 输出回调函数 */
    callback?: (unavailable: number[][], skuId: number | null) => void;
}

export default class {
    constructor(
        private options: SkuConfigOptions
    ) {
        this.#items = options.items;
        if(options.depth) {
            this.#number = options.depth;
        }
        this.#init();
    }

    /** SKU层级深度 */
    #number: number = 0;
    /** 规格信息 例：{"6692398":"0_26_0_2","6692393":"0_24_0_2"} {套装ID:第一层_第二层_第三层_第四层} */
    #items: SkuConfigOptions["items"] = {};
    /** 已经选中的层级ID及值 例：[21,0,0,5] */
    #select: (null|number)[] = [];
    /** 每层可选范围 例：[[21,11],[2]] */
    #availableRange: number[][] = [];
    /** 不可选数组，返回给回调函数使用 */
    #unavailable: number[][] = [];
    /** 临时可选 */
    #availableTemp: number[][] = [];
    /** 输出回调 */
    #callback?: SkuConfigOptions["callback"];

    /**
     * 设置选中
     * @param position 层级下标
     * @param val 值
     */
    set(position: number, val: number) {
        this.#select[position] = val;
        this.#unavailableRestore();
        this.#out();
    }

    /**
     * 取消选中
     * @param position 层级下标
     */
    unset(position: number) {
        this.#select[position] = null;
        this.#unavailableRestore();
        this.#out();
    }

    /**
     * 全局初始化
     * @private
     */
    #init() {
        const itemKeys = Object.keys(this.#items).map(Number);

        // 判断sku使用的几层模型
        if(!this.#number) {
            for(let i of itemKeys) {
                if(this.#number) { // 只执行一次
                    break;
                }
                this.#number = this.#items[i].split("_").length;
            }
        }

        // 根据结构类型创建参数对象
        for(let i=0; i<this.#number; i++) {
            this.#select[i] = null;
            this.#availableRange[i] = [];
        }

        // 每层可选范围
        for(let i of itemKeys) {
            this.#items[i].split("_").map(Number).forEach((num, index) => {
                if(!this.#availableRange[index].includes(num) && num > -1) {
                    this.#availableRange[index].push(num);
                }
            });
        }

        this.options.callback?.(Array(this.#number).fill([]), null);
    }

    /**
     * 临时可选数组初始化
     * @private
     */
    #availableTempRestore() {
        for(let i=0; i<this.#number; i++) {
            this.#availableTemp[i] = [];
        }
    }

    /**
     * 不可选数组初始化
     * @private
     */
    #unavailableRestore() {
        for(let i=0; i<this.#number; i++) {
            this.#unavailable[i] = [];
        }
    }

    /**
     * 回调输出数据
     * @private
     */
    #out() {
        // 判断当前设置了几个层级
        let number = 0;
        this.#select.forEach((item, index) => {
            if(item !== null || !this.#availableRange[index].length) {
                number++;
            }
        });

        // 筛选不可选
        this.#loopUnavailable(number);

        // 如果所有层级选择完整，且有符合条件的数据
        let skuId: number | null = null;
        if(number === this.#number) {
            const regexp = this.#createRegexp(this.#select);
            for(let id of Object.keys(this.#items).map(Number)) {
                if(regexp.test(this.#items[id])) {
                    skuId = id;
                }
            }
        }

        this.options.callback?.(this.#unavailable, skuId);
    }

    /**
     * 按需创建正则
     * @param position 位置数组
     * @private
     */
    #createRegexp(position: (number|null)[]) {
        const arr: string[] = [];
        for(let i=0; i<this.#number; i++) {
            let val = "[0-9]+";
            if(i in position) {
                val = position[i]?.toString() || "0";
            }
            arr.push(val);
        }
        return new RegExp(arr.join("_"));
    }

    /**
     * 递归筛选每个层级不可选
     * @param number 最大联合值的个数
     * @param arr 位置数组
     * @param k 当前联合值的个数
     * @private
     */
    #loopUnavailable(number: number, arr: (number|null)[] = [], k: number = 0) {
        if(!number) {
            return false;
        }

        // 递归处理数据
        for(let i=k; i<this.#number; i++) {
            const _arr = arrayDeepClone(arr);
            if(this.#select[i] !== null) {
                _arr[i] = this.#select[i];
                if(_arr.length <= number) {
                    this.#loopUnavailable(number, _arr, i + 1);
                }
                this.#setUnavailable(this.#createRegexp(_arr), _arr);
            }
        }

        return false;
    }

    /**
     * 获取一定不可选的套装数据
     * @param regexp 判断正则
     * @param arr 位置数组
     * @private
     */
    #setUnavailable(regexp: RegExp, arr: (number|null)[]) {
        this.#availableTempRestore();
        // 匹配数据并解析［每个层级可选的项］
        for(let i of Object.keys(this.#items).map(Number)) {
            const item = this.#items[i];
            if(regexp.test(item)) {
                item.split("_").map(Number).forEach((item, index) => {
                    if(!this.#availableTemp[index].includes(item)) {
                        this.#availableTemp[index].push(item);
                    }
                });
            }
        }
        // 通过可选推导出各层级一定不能选的ID
        for(let i in this.#availableTemp) {
            if(i in arr) {
                continue;
            }
            for(let j of arrayDifference(this.#availableRange[i], this.#availableTemp[i])) {
                if(!this.#unavailable[i].includes(j)) {
                    this.#unavailable[i].push(j);
                }
            }
        }
    }
}
