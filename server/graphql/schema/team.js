export default `
    type Team {
        id: Int!
        name: String!
        admin: User!
        channels: [Channel!]!
        directMessageMembers: [User!]!        
    }

    type CreateTeamResponse {
        ok: Boolean!
        team: Team
        errors: [Error!]
    }

    type Query {
        allTeams: [Team!]!
        inviteTeams: [Team!]!
        teamMembers(teamId: Int!): [User!]
    }

    type VoidResponse {
        ok: Boolean!
        errors: [Error!]
    }

    type Mutation {
        createTeam(name: String!): CreateTeamResponse!
        addTeamMember(email: String!, teamId: Int! ): VoidResponse!
    }
`;
