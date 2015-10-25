import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import {
  mutationWithClientMutationId,
} from 'graphql-relay';

const SpeechDataBase = {
  speechesArray: [],
  id: '42',
};

var SpeechType = new GraphQLObjectType({
  name: 'NameOfSpeechType',
  fields: () => ({
    id: {type: GraphQLID},
    text: {type: GraphQLString},
  }),
});

var SpeechListType = new GraphQLObjectType({
  name: 'NameOfSpeechListType',
  fields: () => ({
    speechesArray: { type: new GraphQLList(SpeechType) },
    id: { type: GraphQLString },
  }),
});

var MutationOfCreateSpeech = mutationWithClientMutationId({
  name: 'NameOfCreateNewSpeechasdfasdf',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    speechListFromMutationOutputFields: {
      type: SpeechListType,
      resolve: () => SpeechDataBase,
    },
  },
  mutateAndGetPayload: ({text}) => {
    var newComment = {
      id: SpeechDataBase.speechesArray.length,
      text,
    };
    SpeechDataBase.speechesArray.push(newComment);
    return newComment;
  },
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'QueryThatLigoudanWants',
    fields: () => ({
      speechField: {
        type: SpeechListType,
        resolve: () => SpeechDataBase,
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
