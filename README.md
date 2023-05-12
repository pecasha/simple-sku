# Simple-SKU

> 用于商城商品的简易SKU模块。[Demo](https://chihai-chuck.github.io/simple-sku/demo/index.html)

## 安装
### NPM或其它包管理器
```shell
npm install simple-sku
```
### Script引入
```html
<script src="/node_modules/simple-sku/build/index.umd.js"></script>
```

## 使用示例
### ES6
```javascript
import Sku from "simple-sku";

const sku = new Sku({
    items: { // 商品sku数据(自行格式化)
        42: "1_14_77",
        43: "1_14_78",
        44: "1_14_79",
        45: "1_15_77",
        46: "2_14_77",
        47: "3_14_77",
        48: "3_14_79",
        49: "3_18_78"
    },
    callback: (unavailable, skuId) => {
        // 操作回调
    }
});

sku.set(1, 15); // 设置选中

sku.unset(1); // 取消选中
```
### ES5/Script引入
```javascript
var sku = new Sku({
    items: { // 商品sku数据(自行格式化)
        42: "1_14_77",
        43: "1_14_78",
        44: "1_14_79",
        45: "1_15_77",
        46: "2_14_77",
        47: "3_14_77",
        48: "3_14_79",
        49: "3_18_78"
    },
    callback: function(unavailable, skuId) {
        // 操作回调
    }
});

sku.set(1, 15); // 设置选中

sku.unset(1); // 取消选中
```

## Classes
### Options
- items: 商品规格数据（格式：`{skuID:“第一层_第二层_第三层_第四层”}`，层级选项值为`-1`表示这层不可选）
- depth: 层级深度（不传或传0则自动计算）
- callback: 回调函数（第一个参数是不可选的合集，第二个参数是匹配的SkuId）

### Methods
- set: 设置选中（第一个参数是层级下标，第二个参数是选中值）
- unset: 取消选中（参数是层级下标）
