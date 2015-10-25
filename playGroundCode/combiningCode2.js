 class HelloWorld extends React.Component {
    render() {
        var {hello} = this.props.someHelloFromRelay;
        return <h1>{hello}</h1>;
        }
}


HelloWorld = Relay.createContainer(HelloWorld, {
    fragments: {
         someHelloFromRelay: () => Relay.QL`
            fragment on HelloObject {
                hello,
            }
        `,
    }
});








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

class SpeechContainer extends React.Component {
  _handleSubmit = (e) => {
    e.preventDefault();
    Relay.Store.update(
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
        <h1>Breaking News</h1>
        <p>The peanut is neither a pea nor a nut.</p>
        <strong>Discuss:</strong>
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


class MutationOfCreateSpeechInComponent extends Relay.Mutation {
  static fragments = {
    speechListWithID: () => Relay.QL`
      fragment on NameOfSpeechListType { id }
    `,
  };
  getMutation() {
    return Relay.QL`
      mutation{ createSpeechField }
    `;
  }
  getFatQuery() {  // 下面这东西on 的Object，居然就是 schema 里定义的Mutation的名字后面加个Payload
    return Relay.QL`
      fragment on NameOfCreateNewSpeechasdfasdfPayload { 
        speechListFromMutationOutputFields { speechesArray },
      }
    `;
  }
  getConfigs() { //下面这东西声明在schema的 outputFields ，但是好像是用来在断网情况下更新本地显示的，注意，它获取id只为了即时在这个id对应的列表里显示你做出过的修改
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: { speechListFromMutationOutputFields: this.props.speechListWithID.id },
    }];
  }
  getVariables() {
    return { text: this.props.text };
  }
}



class TaoTao extends React.Component {
    render() {
        const someHelloFromRelay = this.props.guanHaiTingTao;
        return( <div>
        	<HelloWorld someHelloFromRelay={someHelloFromRelay}/>

        	</div>);
        }
}
TaoTao = Relay.createContainer(TaoTao, {
    fragments: {
         guanHaiTingTao: () => Relay.QL`
            fragment on HelloObject {
                ${HelloWorld.getFragment('someHelloFromRelay')},
            }
        `,
    }
});



  
class HelloRoute extends Relay.Route {
    static routeName = 'LiShadan';
    static queries = {
         guanHaiTingTao: (Component) => Relay.QL`
            query GuanHaiTingTaoQuery {
                 helloField {
                    ${Component.getFragment('guanHaiTingTao')},
                },
            }
        `,
    };
}


ReactDOM.render(
    <Relay.RootContainer
        Component={TaoTao}
        route={new HelloRoute()}
    />,
    mountNode
);



