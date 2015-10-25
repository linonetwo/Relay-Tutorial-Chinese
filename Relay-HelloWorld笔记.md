######有些专有名词还没有现成的好翻译，我用 「术语翻译」OriginalTerminology 来对应到中文，希望能帮助您提升阅读速度。
####前置技能： ES6     、  React    、  Flux    、  GraphQL     、   贤者时间

创建 React + Relay 的步骤




##一、 从数据库到 React




0.
Relay是什么东西，同学们清楚不清楚啊？
（清楚啊，好，那我就不废话继续往下讲 /  不清楚？不清楚也没关系，不影响的，我先继续往下讲……）

因为默认会看这篇文章的同学都已经基本了解了 Flux 架构，所以我们直接通过一个简单的例子来说明怎样用 Relay 为 React 应用加入单向数据流，你们兹瓷不兹瓷丫？
（对嘛，写说明文还是得按基本法来的。）

首先，众所周知：

>需求不清是加班的前兆。   —— 孙悟空

所以在开始进入 Relay 的世界之前，我们先来明确一下这个简单例子的需求：
  

我们需要一个完美的单页面应用，它可以显示出一个标题，标题上写着 ：

##Hello world

需求很简单，让我们开始吧。
  
1.
  

第一步，在 HelloWorld.js 文件里写一个 React 组件

在ES6中，React 组件都是继承自 React.Component类的子类。
```javascript
import React from 'react';

class HelloWorld extends React.Component {
    render() {
        var {hello} = this.props.someHelloFromRelay;
        return <h1>{hello}</h1>;
        }
}
```
我们把来自 props 的变量 someHelloFromRelay 中的 hello 变量存储用 {hello} 提取出来，然后显示出来。

这个 props.someHelloFromRelay 是由 Relay 自动传给我们的，我们坐享其成。
我们知道 props 一般只能是父组件传给子组件，所以很明显，我们要用 Relay 提供的某个组件来做 HelloWorld 的父组件，这样 Relay 就能把我们需要的值通过 props 传给 HelloWorld ，并且保证传完值之后 HelloWorld 才被加载。
  
2.
  
export default 意思是当别的 js 文件 import HelloWorld from "HelloWorld" 的时候，导入的不是上面那个 HelloWorld ，而是下面写的这个 Relay「容器」container 包装过的 HelloWorld 。
```javascript
import Relay from 'react-relay';

export default Relay.createContainer(HelloWorld, {
    fragments: {
         someHelloFromRelay: () => Relay.QL`
            fragment on HelloObject {
                hello,
            }
        `,
    }
});
```
Relay.createContainer() 接受你写的 React 组件，还有一个「请求片段」fragments。
fragments 里的内容说明了这个组件需要 Relay 帮忙请求字段 hello 的值，并传入到 props.someHelloFromRelay 。

然后 Relay.createContainer() 返回一个看起来和 HelloWorld 一模一样的 React 组件，这个容器具有把 someHelloFromRelay 变量通过 props 传给子组件 HelloWorld ，还有保证传完值之后子组件 HelloWorld 才被加载等等优越先进的功能。

请求片段中， someHelloFromRelay 告诉 Relay，拿到数据之后传给 HelloWorld 的 props.someHelloFromRelay 。
箭头函数的返回值 Relay.QL 是 ES6 标签函数，接受模板字符串中声明的请求片段 fragment on HelloObject ，然后到「结构库」schema.js 中去找对应的信息，结构库算是有点“后台”的感觉了，我们等一下再说“后台”，现在先把“前端”写完。
但你现在可能有点晕晕的感觉了，我们等一下再写“前端”，现在先把什么叫「请求片段」 说完。

***

什么是「请求片段」 fragments 呢？

一个 GraphQL 「请求」Query 可以是这样的：
```javascript
query UserQuery {
  user(id: "123") {
    name,
  },
}
```
通过 "123" 的全局 id 来请求用户的名字

而一个「请求片段」 fragments 则是这样的：
```javascript
fragment UserProfilePhoto on User {
  profilePhoto(size: $size) {
    uri,
  },
}
```
给定一个大小，请求某个用户的头像的 url。

一个请求片段得组合到一个带全局 id 的「请求」Query 里才能使用：
```javascript
query UserQuery {
  user(id: "123") {
    ...UserProfilePhoto,
  },
}
```
通过全局id "123" 请求用户的头像

一个请求片段也可以在别的地方重复利用：
```javascript
query UserQuery {
  user(id: "123") {
    friends(first: 10) {
      edges {
        node {
          ...UserProfilePhoto,
        },
      },
    },
  },
}
```
你看，请求片段 UserProfilePhoto 就是一个组件化的东西，你可以放在任意一个请求里使用，而且事实上还可以把一个请求片段放在另一个请求片段里，格式就是 ES6 的扩展运算符，三个点。

请求和请求片段组成了一棵树，请求作为根，请求片段作为子孙。

***

以上是  HelloWorld.js
  
3.
  
然后在 /routes/HelloWorldRoute.js 里写 GraphQL 请求的配置文件。

这边的 Route 不是 React-Route 里那个路由的意思，它是当时 Relay 开发人员拍脑子想出的词，现在他们很后悔，觉得当时应该叫 RelayQueryRoots 或 RelayQueryConfig 才对，但一言既出驷马难追好汉不提当年囧， 我们英文暂时还是叫它 Route 好了，中文就叫它「请求配置」RelayQueryConfig 。

首先起一个 routeName ，这名字不能和别的请求配置名重复，我们随便起个名字好了。
```javascript
import Relay from 'react-relay';

class HelloRoute extends Relay.Route {
    static routeName = 'LiShadan';
    static queries = {
         someHelloFromRelay: (Component) => Relay.QL`
            query GreetingsQuery {
                 helloField {
                    ${Component.getFragment('someHelloFromRelay')},
                },
            }
        `,
    };
}
```
我们之前写的 Relay 容器所需要的数据，不是已经通过「请求片段」声明了嘛，那个请求片段的名字叫做 someHelloFromRelay 来着，现在把它放进 helloField 字段，构造一个请求。
 helloField 字段在「结构库」schema.js 中定义，「结构库」中写了它包含着一个叫 hello 的 string ，还有这个 string 的值是
本次请求的名字叫做 GreetingsQuery ，因为是用来请求 someHelloFromRelay 嘛。

以上是 /routes/HelloWorldRoute.js
  
4.
  
再写一个 app.js

用 ReactDOM.render 把 React 组件放到 DOM 上。
当然，不能直接把我们的 <HelloWorld/> 放上去，不然它要怎么和我们上面写的那个 HelloRoute 发生关系呢？
我们提供一个场所来给它们发生关系，这个 ホテル 的名字叫做 Relay.RootContainer ，把 HelloWorld 作为 Component 属性传进去，new 一个 HelloRoute 对象传进 route 属性，然后轻车熟路地把这个 ホテル 挂到 DOM 中的 mountNode 上。
```javascript
import HelloWorld from "./HelloWorld";
import HelloRoute from "/routes/HelloWorldRoute.js";

import ReactDOM from 'react-dom';

ReactDOM.render(
    <Relay.RootContainer
        Component={HelloWorld}
        route={new HelloRoute()}
    />,
    mountNode
);
```
还记得上头 HelloRoute 里模板字符串内写着的 ${Component.getFragment('someHelloFromRelay')} 么？这个变量就是来自 Component={HelloWorld} ，可以搞到 Relay容器 HelloWorld 里声明的请求片段。

注意虽然刚才我们给「请求配置」随手起了一个名字叫李傻蛋，但是我们不是route={new LiShadan()} 而是 route={new HelloRoute()} ，new 对象还是得按着基本法来的。

此后 Relay 就会把 React 组件中的请求综合起来，向后台请求数据，然后把数据交给组件，再让组件开始渲染。

以上是 app.js
  
5.
  
接下来在 ./data/schema.js 里，用 GraphQLObjectType 声明我们可以请求的数据形式，然后把它放进 GraphQLSchema 里，GraphQLSchema 看请求符合 GraphQLObjectType 的形式，就返回对应的数据。
```javascript
import {

     GraphQLObjectType,

     GraphQLSchema,

     GraphQLString,

} from 'graphql';
```
GraphQLObjectType 接受一个名字，我们叫它 HelloObject ，还记得么，你在上头第二步制作 Relay容器的时候见过它。

当时我们写下了： Relay.QL` fragment on HelloObject { hello, } `  ，就是声明我们这个请求片段的形式符合 HelloObject，里头有一个 hello

现在我们在「结构库」里这么写：
```javascript
var GreetingsType = new GraphQLObjectType({

     name: 'HelloObject',

     fields: () => ({

         hello: {type: GraphQLString},

     }),

});
```
「字段」field 是返回一个对象的函数，说明了可请求的数据的格式，里头的GraphQLString 表示这边会返回一个 string 类型，更多类型可以搜一搜 GraphQL 的手册来看。


现在没有数据库，不过我们可以一起假装这数据是从数据库里来的，你不说我不说就没人知道了。
```javascript
var data = {

     hello: 'Hello world',

};
```
注意，数据库返回的 JSON 的变量名，一定要和 GraphQLObjectType 里定义的 field 名一致，也要和 React 组件 var {hello} = this.props.someHelloFromRelay; 中的左值相同，它是一脉相承的。


最后，我们对外暴露一个「结构库」Schema，它是一个只有一个元素 query 的对象 { query: blabla }
```javascript
export default new GraphQLSchema({

     query: new GraphQLObjectType({

         name: 'qingqiu',

         fields: () => ({

             helloField: {

                 type: GreetingsType,

                 resolve: () => data,

             },

         }),

     }),

});
```
这个 query 的值是一个类似于上头 GreetingsType 的 GraphQLObjectType ，为了让这个教程显得不像是从国外翻译来的，我们给这个 GraphQLObjectType 取一个好听的名字叫"qingqiu" 。
  
很好听对吧，文艺的名字，清秋。"qingqiu" 含有一个「根字段」root field，也就是 helloField ，它接受 GreetingsType 这样的请求，如果请求的类型没错，就执行 resolve 函数，这个函数会从后台数据库里取得数据。

至此，前端 React 和后台数据库就由 React - RelayCompenment - Relay.RootContainer - Relay.Route - Schema - Database 像烤串一样地串起来了。
  
但是，别忘了这只是个 HelloWorld，里面用到的 Relay 只是很小的一部分，我们接着往下拓展它。
  
6.
  
>再忙不忘家人，再方不忘带套。 —— 中国谚语

Relay 的意义之一就在于，大量组件镶套时它能够不慌不忙，合并重复的请求，一次性交送所有请求给服务器程序上的「数据端点」endpoint，比如下面这个例子：
  
```javascript
import React from 'react';
import Relay from 'react-relay';
import HelloWorld from './HelloWorld.js';



class TaoTao extends React.Component {
    render() {
        const { forHello } = this.props.guanHaiTingTao;
        return( <div>
                        <HelloWorld someHelloFromRelay={forHello}/>
                    </div>);
    }
}
```
我们准备给 <HelloWorld /> 带个套，写了一个 TaoTao 组件，先把 Relay容器传入套套的 props.guanHaiTingTao 用 const { forHello } = this.props 保存下来，然后，瞅瞅 <HelloWorld/> 里面，我们用 someHelloFromRelay={forHello} 把 HelloWorld 所需的信息再传给了 HelloWorld 组件。
  
说实话刚见到 Relay 的介绍时，我还以为子组件用 Relay容器包好了之后，在父组件里使用的时候就会自己请求数据了，没想到还是得在父组件的 Relay容器里主动帮孩子声明一下他需要什么信息，用 ${HelloWorld.getFragment('someHelloFromRelay')} 声明子组件需要什么数据，再把 HelloWorld 组件需要的数据作为 props 传给 HelloWorld组件，不帮孩子做这些事的话，孩子就会哭闹报错 Warning: RelayContainer: Expected query `someHelloFromRelay` to be supplied to `HelloWorld` as a prop from the parent. Pass an explicit `null` if this is intentional.


```javascript
TaoTao = Relay.createContainer(TaoTao, {
    fragments: {
        guanHaiTingTao: () => Relay.QL`
            fragment on NameOfTaoTaoType {
                forHello {
                    ${HelloWorld.getFragment('someHelloFromRelay')},
                }
            }
        `,
    }
});
```
以上是 TaoTao.js

***
同学们学过 GraphQL 的语法么？
（学过啊，很好，上面这段声明和下面这两块代码是等价的，注意一下就好，也不用刻意去记。 / 没学过么？没事，不影响理解的，你只要知道上面这段声明还有下面这样的等价形式就好了，也不用刻意去记。）

```javascript
`
  fragment TaoTao on NameOfTaoTaoType {
     forHello {    
          ...someHelloFromRelay,
     }
  }

  fragment someHelloFromRelay on HelloObject { 
     hello, 
  } 
`
```

***


注意，我们现在写的请求片段的格式是在 schema.js 里这样声明的：
```javascript
var TaoTaoType = new GraphQLObjectType({
    name: 'NameOfTaoTaoType',
    fields: () => ({
         forHello: {type: GreetingsType},
    }),
});
```
它的意思是，你在用它为 HelloWorld 请求数据的时候，得在 HelloWorld 所需的数据外头包一层 forHello {       } ，以体现出有层级的数据结构。

然后把结构库里的根字段改成为 TaoTao 服务：
```javascript
export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'QueryThatLigoudanWants',
        fields: () => ({
            TaoTaoFIeld: {
                type: TaoTaoType,
                resolve: () => dataBase,
            },
        }),
    }),
});
var dataBase = {
    forHello: {
        hello: 'Hello world',
    },
}
```

所以我们还得把 /routes/HelloWorldRoute.js 里的请求配置改成向 TaoTaoFIeld 请求数据，请求到的数据返回给 guanHaiTingTao 变量
```javascript
class TaoTaoRoute extends Relay.Route {
    static routeName = 'LiShadan';
    static queries = {
        guanHaiTingTao: (Component) => Relay.QL`
            query GuanHaiTingTaoQuery {
                TaoTaoFIeld {
                    ${Component.getFragment('guanHaiTingTao')},
                },
            }
        `,
    };
}
```

最后别忘了修改 app.js 里的 Relay.RootContainer ：
```javascript
ReactDOM.render(
    <Relay.RootContainer
        Component={TaoTao}
        route={new TaoTaoRoute()}
    />,
    mountNode
);
```
  
注意以上修改过的代码中，哪些变量被改成了 guanHaiTingTao ？
  
  
  
Relay 的好处之一：
1. 你不再需要在组件里 imperative 地搞一大坨 AJAX ，现在需要做的是用 declarative 的方式写一个请求片段，更抽象，更贴近你在成为程序员之前的人类天性。你看我们刚刚写的东西是不是都是对需要的数据的定义还有对可能会被需要的数据的定义？
2.一大堆子组件的请求被自动去重、合并，可以节省大量的网络带宽、CPU等资源，scale up 之后谁用谁知道。

但目前还没法看出第二个优点，所以我们再塞一个子组件进套套里如何？
  
  
##二、从 React 到数据库
  

7.

新的需求：   客户希望我们能让用户像做国旗下讲话一样，做 HelloWorld下讲话。


##HelloWorld
主席台↓
-同志们
-大家早上好啊
-同志们辛苦啦
-我的发言完了


发言要能由用户自己自由发挥，按下回车就提交。


需要交互了啊，是时候展示真正的技术了，我们用 Relay的 「突变」Mutation ，它用来从用户处向数据库提交信息，并且同时更新所有和这个信息相关的组件显示结果。它作为一个类似子组件的形式存在，就像 Relay容器包在你的组件外面一样，你可以里面放一个 Relay突变，外面放一个 Relay容器，内外兼修里应外合夹逼定理，不过首先要创建一个 React组件：

在 SpeechItem.js 里：

先用我们熟悉的方式声明一个组件
```javascript
class SpeechItem extends React.Component {
    render() {
        var {id, text} = this.props.aSpeechObjectIncludingIDAndText;
        return <li key={id}>{text}</li>;
    }
}
SpeechItem = Relay.createContainer(SpeechItem, {
    fragments: {
        aSpeechObjectIncludingIDAndText: () => Relay.QL`
            fragment on NameOfSpeechType {
                id,
                text,
            }
        `,
    },
});
```
这个组件用于显示一条条的 speech ```<ul/>```，所以需要 id 和 text 两个信息，React列表组件如果不传入 ```key={id}``` 会在删除和添加新```<ul/> ```时发生事件触发器错位等疑难杂症，有```<ul/>```最好都把 key 属性加上。


我们刚定义了上面这个组件会向 NameOfSpeechType 请求这些数据，接着我们到结构库 schema.js 里定义一下数据源的格式：
```javascript
var SpeechType = new GraphQLObjectType({
    name: 'NameOfSpeechType',
    fields: () => ({
        id: {type: GraphQLID},
        text: {type: GraphQLString},
    }),
});
```


然后我们再写一个 SpeechContainer.js  作为 ```<ul /> ```来放上面那些``` <li /> ```:
```javascript
class SpeechContainer extends React.Component {
    _handleSubmit = (e) => {
        e.preventDefault();

        Relay.Store.update(   // Relay.Store 暴露出向服务器提交数据的API
            new MutationOfCreateSpeechInComponent({ // 把需要传到服务器的那个 speechList的id，还有要放进去的内容，赋值给左值
                speechListWithID: this.props.speechesFromRelay,
                text: this.refs.newSpeechInput.value,
            })
        );

        this.refs.newSpeechInput.value = '';
    }

    render() {
        var {speechesArray} = this.props.speechesFromRelay;
        return (
         <form onSubmit={this._handleSubmit}>
            <strong>主席台↓</strong>
           
            <ul>
            {speechesArray.map(
                aSpeech => <SpeechItem aSpeechObjectIncludingIDAndText={aSpeech} />
            )}
            </ul>

            <input
                placeholder="HelloWorld下讲话"
                ref="newSpeechInput"
                type="text"
            />
        </form>
        );
    }
}
```
你可能很惊讶，说好的只是个 ```<ul /> ```呢？上面这一大坨 _handleSubmit 是啥？

这是因为我们要让用户能发表演讲，所以得加入一个 ```<form />```， 这一大坨函数就是用来在 e.preventDefault()阻止了表单的默认行为之后，将表单移交给 Relay 管的。


接着照例，给它创建一个 Relay容器，请求数据库里存放的 speechesArray 用于显示，还有 Relay突变 所需要的ID ，然后把这些数据都传到变量 speechesFromRelay 里。
```javascript
SpeechContainer = Relay.createContainer(SpeechContainer, {
    fragments: {
        speechesFromRelay: () => Relay.QL`
            fragment on NameOfSpeechListType {
                speechesArray {
                    ${SpeechItem.getFragment('aSpeechObjectIncludingIDAndText')},
                },
                ${MutationOfCreateSpeechInComponent.getFragment('speechListWithID')},
            }
        `,
    },
});
```
在 Relay 容器里声明的数据需求一般来自于组件自身，还有它的子组件。
SpeechItem 你懂，是它的子组件。


那 MutationOfCreateSpeechInComponent 是个啥？你可能都快忘了，它是在上面那一大坨的  _handleSubmit(e) 里 new 出来的对象，和 Relay容器一样也是定义数据流的容器组件，它就是 Relay突变，它定义了组件突变时的数据变化，这样写：
```javascript
class MutationOfCreateSpeechInComponent extends Relay.Mutation {
    static fragments = { // 这是一个请求片段，和 Relay容器很像对吧，它请求了表单要改变的数据库字段的 id
        speechListWithID: () => Relay.QL`
            fragment on NameOfSpeechListType { id }
        `,
    };

     getMutation() {  // 这是一个GraphQL 突变声明，就像我们向 TaoTaoFIeld 请求数据一样，我们向 createSpeechField 发送突变
// 请求片段向 TaoTaoFIeld 请求数据是在 /routes/HelloWorldRoute.js 里声明的，而突变向哪里发送是在这里声明的。
        return Relay.QL`
            mutation{ createSpeechField }
        `;
    }

     getFatQuery() { // 下面这东西 on 的Object，就是 schema 里定义的Mutation的名字后面加个Payload，我们等一下看结构库的时候请留意
// 这个请求用于声明这次突变有可能会影响到哪些东西，比如一个大型应用中你发了一句 speech ，可能会影响界面颜色、按钮disable、装备爆率等等，现在它只会影响 speechesArray ，我们就只写它。不过多写一点未来可能会影响的东西也没关系，因为这个 FatQuery 会先和真正可能会被影响的字段做交集运算，真的会被影响的部分 Relay 才会做请求。
        return Relay.QL`
            fragment on NameOfCreateNewSpeechasdfasdfPayload { 
                speechListFromMutationOutputFields { speechesArray },
            }
        `;
    }

     getConfigs() { //下面这东西声明在schema的 outputFields ，但是是用来在断网情况下更新本地显示的，注意，它获取id是为了即时在这个id对应的列表里显示你做出过的修改
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: { speechListFromMutationOutputFields: this.props.speechListWithID.id },
        }];
    }

    getVariables() { // 这个函数用来把 this.props.text 转发到本地变量 text
        return { text: this.props.text };
    }

}
```

以上是 SpeechItem.js ，我们写了组件还有它的突变声明，然后装进 Relay容器里。

接着我们修改 TaoTao，把新的子组件加进去，
```javascript
class TaoTao extends React.Component {
    render() {
        const {forSpeech, forHello} = this.props.guanHaiTingTao;
        return( <div>
                        <HelloWorld someHelloFromRelay={forHello}/>
                        <SpeechContainer speechesFromRelay={forSpeech}/>
                    </div>);
    }
}
TaoTao = Relay.createContainer(TaoTao, {
    fragments: {
        guanHaiTingTao: () => Relay.QL`
            fragment on NameOfTaoTaoType {
                forSpeech {
                    ${SpeechContainer.getFragment('speechesFromRelay')},
                }
                forHello {
                    ${HelloWorld.getFragment('someHelloFromRelay')},
                }
            }
        `,
    }
});
```


然后在 Schema.js 里，我们设置好对应的可请求的数据格式声明：
```javascript
var TaoTaoType = new GraphQLObjectType({
    name: 'NameOfTaoTaoType',
    fields: () => ({
         forSpeech: {type: SpeechListType},
         forHello: {type: GreetingsType},
    }),
});
```


然后，我们设置服务器上可改变的数据格式的声明：
```javascript
import {
    mutationWithClientMutationId,    
} from 'graphql-relay';

var MutationOfCreateSpeech = mutationWithClientMutationId({
    name: 'NameOfCreateNewSpeechasdfasdf',
    inputFields: {
        text: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        speechListFromMutationOutputFields: {
            type: SpeechListType,
            resolve: () => dataBase.forSpeech,
        },
    },
    mutateAndGetPayload: ({text}) => {
        let newSpeech = {
            id: dataBase.forSpeech.speechesArray.length,
            text,
        };
        dataBase.forSpeech.speechesArray.push(newSpeech);
        return newSpeech;
    },
});
```
mutateAndGetPayload 让你传入 text ，它把 text存好到数据库，然后返回一个对象，里面有 id 和你刚输入的 text，返回到客户端的负载会被用在 getConfigs（） 里面更新客户端的 store 。之所以叫「突变」 mutate and get 「负载」payload ，是因为……输入的东西改变了服务器还有很多地方的显示所以叫突变，返回给你的东西捆绑上了 id 变成了对象所以叫负载，当然这个命名方式我还没查到深层原因，我猜难道都和电路有关？

inputFields 和 outputFields 没什么好说的，它们声明了服务器上 Mutation端点输入输出的数据格式，而 mutateAndGetPayload 是一个从输入到输出的映射。可以把 inputFields 和 outputFields 看成变量声明，outputFields = mutateAndGetPayload（inputFields） 是一次映射。



最后就是我们轻车熟路地暴露一个格式库出来：
```javascript
export default new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'QueryThatLigoudanWants',
        fields: () => ({
            TaoTaoFIeld: {
                type: TaoTaoType,
                resolve: () => dataBase,
            },
        }),
    }),
    mutation: new GraphQLObjectType({
        name: 'MutationToAddANewSpeech',
        fields: () => ({
            createSpeechField: MutationOfCreateSpeech,
        }),
    }),
});
```
多了一个 mutation: new GraphQLObjectType ，然而它的写法和 query 的写法差不多，右值 MutationOfCreateSpeech 是我们刚定义的那个 outputFields = mutateAndGetPayload（inputFields）；左值 createSpeechField 用在那个内外兼修里应外合夹逼定理处在内部的突变子组件里，还记得么？


然后我们把数据库返回的数据结构修改成符合我们数据流定义的样子：
```javascript
var dataBase = {
    forSpeech: {
        speechesArray: [],
        id: '42',
    },
    forHello: {
        hello: 'Hello world',
    },
}
```

  
8.
  
最后我们来总结一下 Relay的特性：
  

>Relay 好处都有啥，谁说对了就给他。 —— 圣地亚哥民谣
  
1.我们一直在各种声明数据格式，客户端组件里我们声明这个组件需要的数据格式，还要照顾子组件需要的数据格式，还有声明突变传递的数据格式，声明来声明去生生不息绕梁三日不绝于耳，好处在于你对于组件那些地方要显示的数据来自哪里会比较清楚，你的接盘侠也比较容易看懂你开发的 React-Relay 模块。

2.突变和Promise在某种意义上类似，它能保证你向服务器提交的信息总是更新了所有该更新的地方，如果服务器链接速度慢，它会先更新客户端的显示让用户体验显得精雕细琢，而且如果服务器连接中断，它会撤销这些更改。


事实上，我为了保证阅读速度并没有在上面的例子中加入太多的功能，但自从有了这个 boilerplate 你已经可以很轻松地查阅官方API文档了，那些想打造一个震惊世界的APP只缺程序员的人缺的就是你啊！
  

######我其实看不懂代码，上面这些都是我瞎编的，我实在编不下去了，如果我哪里编错了请善意地提醒我。
  

####杜撰：上海科技大学 林一二
  
  

参考：


[ Relay 概念介绍](https://facebook.github.io/relay/docs/getting-started.html )

[ Relay 试验场](https://facebook.github.io/relay/docs/getting-started.html ) 你可以把

[ GraphQL 手册中关于类型的部分](http://graphql.org/docs/api-reference-type-system/)

[ 我做容器之时掉进的坑](https://github.com/facebook/relay/issues/510)
  
>少年不识愁滋味，爱debug，爱debug，为debug熬一宿；

>而今识尽愁滋味，欲de还休，欲de还休，先去睡觉de个球。


