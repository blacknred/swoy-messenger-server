export default `
    type Team {
        id: Int!
        name: String!
        description: String
        admin: User!
        channels: [Channel!]!
        created_at: String!
        updatesCount: Int!
        membersCount: Int!
        members: [User!]
    }

    type Query {
        getTeams: [Team!]
        getTeam(teamId: Int!): Team!
    }

    type MemberResponse {
        ok: Boolean!
        errors: [Error!]
        status: String
    }

    type TeamResponse {
        ok: Boolean!
        errors: [Error!]
        team: Team
    }

    type Mutation {
        createTeam(name: String!, description: String): TeamResponse!
        addTeamMember(teamId: Int!, email: String!): MemberResponse!
        createTeamAccessLink(teamId: Int!, timespan: Int): String!
        updateTeam(teamId: Int!, name: String!, description: String): TeamResponse!
        deleteTeam(teamId: Int!): Boolean!
        leaveTeam(teamId: Int!): Boolean!
    }
`;
// directMessageMembers: [User!]