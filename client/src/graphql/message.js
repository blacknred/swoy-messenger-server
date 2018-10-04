import gql from 'graphql-tag';

export const CHANNEL_MESSAGES_QUERY = gql`
    query($channelId: Int!) {
        messages(channelId: $channelId) {
            id
            text
            sender {
                username
            }
            created_at
        }
    }
`;

export const DIRECT_MESSAGES_QUERY = gql`
    query($teamId: Int!, $userId: Int!) {
        directMessages(teamId: $teamId, otherUserId: $userId) {
            id
            text
            sender {
                username
            }
            created_at
        }
    }
`;

export const CHANNEL_MESSAGES_SUBSCRIPTION = gql`
    subscription($channelId: Int!) {
        newChannelMessage(channelId: $channelId) {
            id
            text
            sender {
                username
            }
            created_at
        }
    }
`;

export const DIRECT_MESSAGES_SUBSCRIPTION = gql`
    subscription($channelId: Int!) {
        newChannelMessage(channelId: $channelId) {
            id
            text
            sender {
                username
            }
            created_at
        }
    }
`;

export const CREATE_CHANNEL_MESSAGE_MUTATION = gql`
    mutation($channelId: Int!, $text: String!) {
        createChannelMessage(channelId: $channelId, text: $text)
    }
`;

export const CREATE_DIRECT_MESSAGE_MUTATION = gql`
    mutation($teamId: Int!, $receiverId: Int!, $text: String!) {
        createDirectMessage(teamId: $teamId, receiverId: $receiverId, text: $text)
    }
`;
