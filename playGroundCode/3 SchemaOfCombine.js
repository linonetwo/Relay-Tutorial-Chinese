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


var dataBase = {
	forSpeech: {
		speechesArray: [],
		id: '42',
	},
	forHello: {
		hello: 'Hello world',
	},
}

var GreetingsType = new GraphQLObjectType({
		name: 'HelloObject',
		fields: () => ({
			hello: {type: GraphQLString},
		}),
});


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


var TaoTaoType = new GraphQLObjectType({
	name: 'NameOfTaoTaoType',
	fields: () => ({
		forSpeech: {type: SpeechListType},
		forHello: {type: GreetingsType},
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
 
