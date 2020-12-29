import {
    withFilter,
} from 'graphql-subscriptions';

import pubsub from '../../redis/pubsub';

import {
    requiresTeamAccess,
    requiresPrivateChannelAccess,
    requiresMessageFullAccess,
    // requiresTeamAdminAccess,
} from '../../permissions';

const CHANNEL_MESSAGE_CREATED = 'CHANNEL_MESSAGE_CREATED';
const CHANNEL_MESSAGE_UPDATED = 'CHANNEL_MESSAGE_UPDATED';
const CHANNEL_MESSAGE_REMOVED = 'CHANNEL_MESSAGE_REMOVED';
const MESSAGES_LIMIT = 20;

export default {
    Message: {
        sender: ({ user, userId }, _, { loaders }) => {
            if (user) return user;

            return loaders.sender.load(userId);
        },
        files: ({ id }, _, { loaders }) => loaders.file.load(id),
    },
    Query: {
        getMessages: requiresTeamAccess.createResolver(
            requiresPrivateChannelAccess.createResolver(
                async (_, { channelId, cursor }, { models }) => {
                    const messages = await models.Message.findAll({
                        order: [['created_at', 'DESC']],
                        where: {
                            channelId,
                            ...(cursor && {
                                created_at: {
                                    [models.op.lt]: (new Date(Number(cursor))).toISOString(),
                                },
                            }),
                        },
                        limit: MESSAGES_LIMIT,
                    }, {
                        raw: true,
                    });

                    return messages.reverse();
                },
            ),
        ),
    },
    Mutation: {
        createMessage: requiresTeamAccess.createResolver(
            requiresPrivateChannelAccess.createResolver(
                async (_, { files, ...restArgs }, { models, user }) => {
                    try {
                        // create a new message
                        // create entries for related files if needed
                        const message = await models.sequelize
                            .transaction(async (transaction) => {
                                const newMessage = await models.Message.create(
                                    {
                                        ...restArgs,
                                        // explicitly fixing non-null default arg graphql issue
                                        forwarded: restArgs.forwarded || false,
                                        userId: user.id,
                                    },
                                    { transaction },
                                );

                                const filesMap = files.map(file => ({
                                    ...file,
                                    messageId: newMessage.id,
                                }));

                                await models.File.bulkCreate(filesMap, { transaction });

                                return newMessage;
                            });

                        // put new message in pubsub
                        const currentUser = await models.User.findByPk(user.id);

                        // TODO: quick fix non timestamps date
                        message.dataValues.created_at = Date.now();

                        await pubsub.publish(CHANNEL_MESSAGE_CREATED, {
                            channelId: restArgs.channelId,
                            channelMessagesUpdates: {
                                ...message.dataValues,
                                user: currentUser.dataValues,
                            },
                        });

                        return true;
                    } catch (err) {
                        return false;
                    }
                },
            ),
        ),
        updateMessage: requiresMessageFullAccess.createResolver(
            async (_, { messageId, text, files }, { models }) => {
                try {
                    // update the text if provided
                    if (text) {
                        await models.Message.update(
                            { text },
                            { where: { id: messageId } },
                        );
                    }

                    // add the files if provided
                    if (files) {
                        const filesMap = files.map(file => ({
                            ...file,
                            messageId,
                        }));

                        await models.File.bulkCreate(filesMap);
                    }

                    // TODO: update message in pubsub
                    // pubsub.publish(CHANNEL_MESSAGE_UPDATED, {
                    //     messageId,
                    //     channelMessagesUpdates: {
                    //         ...message.dataValues,
                    //         user: currentUser.dataValues,
                    //     },
                    // });
                    return true;
                } catch (err) {
                    return false;
                }
            },
        ),
        deleteMessage: requiresMessageFullAccess.createResolver(
            async (_, { messageId }, { models, user }) => {
                try {
                    // delete the message
                    await models.Message.destroy({
                        where: { id: messageId, user_id: user.id },
                    });

                    const pubsubFunc = () => {
                        // TODO: remove message from pubsub
                        // pubsub.publish(CHANNEL_MESSAGE_REMOVED, {
                        //     messageId,
                        //     channelMessagesUpdates: {
                        //         messageId,
                        //     },
                        // });
                    };
                    pubsubFunc();

                    return true;
                } catch (err) {
                    return false;
                }
            },
        ),
        pinMessage: requiresMessageFullAccess.createResolver(
            async (_, { messageId, status }, { models }) => {
                try {
                    await models.Message.update(
                        { pinned: status },
                        { where: { id: messageId } },
                    );

                    return true;
                } catch (err) {
                    return false;
                }
            },
        ),
    },
    Subscription: {
        channelMessagesUpdates: {
            resolve: (payload) => {
                console.log('brrrah');
                // , args, context, info
                // Manipulate and return the new value
                return payload.channelMessagesUpdates;
            },
            subscribe: requiresTeamAccess.createResolver(
                withFilter(
                    () => pubsub.asyncIterator(
                        CHANNEL_MESSAGE_CREATED,
                        CHANNEL_MESSAGE_UPDATED,
                        CHANNEL_MESSAGE_REMOVED,
                    ),
                    // (payload, args) => payload.newChannelMessage.channelId === args.channelId,
                    (payload, args) => payload.channelId === args.channelId,
                ),
            ),
        },
    },
};