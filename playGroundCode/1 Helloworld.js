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


ReactDOM.render(
    <Relay.RootContainer
        Component={HelloWorld}
        route={new HelloRoute()}
    />,
    mountNode
);