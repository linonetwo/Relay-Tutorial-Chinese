 
##三、 当应用复杂起来


数据库返回的可以是包装好的JSON对象，然后 GraphQL类型系统会将这一个个对象挡在背后，只有通过类型系统的检验才能获取数据。

一般来说，各种 API 都会向你要一个 ID ，通过这个 ID 来获取一个特定的对象。



许多类型可能有其相似之处，就像我们在写 Java 、 ES6 、 C 的时候会不断地重构一样， GraphQL 里的类型也是可以重构的，我们可以把其中的相似之处抽出来变成一个「接口」interface



我们首先用一个「全局ID」global ID 来验人，我们可以获得这个全局ID，到底代表着什么样的地位权利和背景，惹得起还是惹不起，就在一念之间。
  
怎么验人呢？
```javascript
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'User') {
      return getUser(id);
    } else if (type === 'Widget') {
      return getWidget(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Widget)  {
      return widgetType;
    } else {
      return null;
    }
  }
);
```
nodeDefinitions( ) 接收两个函数，它会往第一个函数里传入今天要验的人的全局ID，就是  (globalId) => { } 这个，然后我们再把传入的全局ID用 fromGlobalId( globalId ) 分析一下，得到 type, id 。
  
然后判断一下 type 对应我们数据库中的哪种类型，把 id 给数据库，向数据库请求这个 id 对应的数据。

nodeDefinitions( ) 会往第二个函数里传入一个数据库中定义的对象，就是 (obj) => { } 这个，然后我们再看看传入的对象对应的是哪个 GraphQL 类型，返回这个类型。

以上是 schema.js 中的一个节点定义，「节点」这个词估计也是来自电路分析，















node definitions; in other words, the object and type that should be associated with a given node based on a global ID



参考资料

[GraphQL Technical Preview Contents](https://github.com/facebook/graphql/blob/master/README.md)