const { buildSchema } = require('graphql');

module.exports = buildSchema(`
type Bewoner {
    _id: ID!
    name: String!
    description: String
    moveInDate: String!
    moveOutDate: String
    user: User!
    title: Title
    profilePicture: String
}

type User {
    _id: ID!
    email: String!
    password: String
    bewoner: Bewoner
}

type AuthData {
    user: User!
    token: String!
    tokenExpiration: Int!
}

type Title {
    _id: ID!
    name: String!
    bewoner: Bewoner!
    date: String!
}

input BewonerInput {
    _id: ID
    name: String!
    description: String
    moveInDate: String!
    moveOutDate: String
    profilePicture: String
}

input UserInput {
    email: String!
    password: String!
}

input TitleInput {
    name: String!
    date: String
}

type RootQuery {
    bewoner(bewonerId: String!): Bewoner
    bewoners: [Bewoner!]!
    titles: [Title!]!
    login(email: String!, password: String!): AuthData!
    user(userId: String!): User
}

type RootMutation {
    createBewoner(bewonerInput: BewonerInput!): Bewoner
    editBewoner(bewonerInput: BewonerInput!): Bewoner
    createUser(userInput: UserInput): AuthData!
    editEmail(email: String!): AuthData!
    editPassword(oldPassword: String!, newPassword: String!): AuthData!
    deleteUser(userId: String!): Boolean
    createTitle(titleInput: TitleInput, bewonerId: String): Title
    giveTitle(titleId: String, bewonerId: String): Bewoner
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`)