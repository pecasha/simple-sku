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
    #private;
    private options;
    constructor(options: SkuConfigOptions);
    /**
     * 设置信息
     * @param position 层级下标
     * @param val 值
     */
    set(position: number, val: number): void;
    /**
     * 删除信息
     * @param position 层级下标
     */
    unset(position: number): void;
}
export {};
