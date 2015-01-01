ngscrollbar
===========

The AngularJS directive ng-scrollbar imitate the true browser scrollbar.
It's applied to the element which set height or width attribute and the overflow is auto, but exclude body element.
It's not necessary to imitate scrollbar for body element, if you use the AngularJS.
suggests: don't use the directive, if you don't have to. The scrollbar which is inbuilt in browser is more highly-efficient.
AngularJS is not fit for IE which version is less then 9, so the directive is not fit the IE(8,7,6,5).

I will write the example in the later.
Welcome comments

###some case
```
1.
<div style="height:300px;overflow:auto;" ng-scrollbar>
    <li ng-repeat="item in items">item</li>
</div>
2.
<div style="height:300px;overflow:auto;" ng-scrollbar scrollbar-x="false" scrollbar-y="true" scrollbar-config="{show:true, autoResize: true, dragSpeed: 1.2}">
    <li ng-repeat="item in items">item</li>
</div>
3.
<div ng-scrollbar>
    <div style="height:400px;width:3000px"></div>
</div>
```

### how to view the example
1. bower install
2. open the example.html in the browser
