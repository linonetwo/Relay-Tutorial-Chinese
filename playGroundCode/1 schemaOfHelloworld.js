import {

     GraphQLObjectType,

     GraphQLSchema,

     GraphQLString,

} from 'graphql';
  
  
var GreetingsType = new GraphQLObjectType({

     name: 'HelloObject',

     fields: () => ({

         hello: {type: GraphQLString},

     }),

});


var data = {

     hello: 'Hello world',

};


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
 
